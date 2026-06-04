import { useEffect, useId, useRef, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { THEMES, KID_AVATARS } from '../lib/themes'
import { useToast } from '../contexts/ToastContext'
import Modal from './Modal'
import { KidAvatar } from './KidAvatar'
import { uploadKidAvatar, deleteKidAvatar } from '../lib/avatarUpload'
import Icon from './Icon'
import EarthyDatePicker from './EarthyDatePicker'
import { useI18n } from '../lib/i18n'
import FluentEmoji from './FluentEmoji'
import ThemeBannerArt from './ThemeBannerArt'

export default function KidEditModal({ open, onClose, kid, kids, boardId, onDeleted }) {
  const { t, themeLabel } = useI18n()
  const [name, setName] = useState(kid?.name || '')
  const [theme, setTheme] = useState(kid?.theme || 'football')
  const [birthday, setBirthday] = useState(kid?.birthday || '')
  const [avatarKind, setAvatarKind] = useState(kid?.avatarKind || 'theme')
  const [avatarUrl, setAvatarUrl] = useState(kid?.avatarUrl || null)
  const [avatarEmoji, setAvatarEmoji] = useState(kid?.avatarEmoji || null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteTyped, setDeleteTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const nameId = useId()
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    setName(kid?.name || '')
    setTheme(kid?.theme || 'football')
    setBirthday(kid?.birthday || '')
    setAvatarKind(kid?.avatarKind || 'theme')
    setAvatarUrl(kid?.avatarUrl || null)
    setAvatarEmoji(kid?.avatarEmoji || null)
    setConfirmingDelete(false)
    setDeleteTyped('')
  }, [open, kid?.id])

  if (!kid) return null

  const sorted = [...(kids || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  const idx = sorted.findIndex((k) => k.id === kid.id)
  const isFirst = idx <= 0
  const isLast = idx >= sorted.length - 1

  const ref = doc(db, 'boards', boardId, 'kids', kid.id)

  const saveName = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === kid.name) return
    try { await updateDoc(ref, { name: trimmed }) }
    catch { toast.error(t('kid.saveNameError')) }
  }

  const saveTheme = async (newTheme) => {
    if (newTheme === theme) return
    setTheme(newTheme)
    try { await updateDoc(ref, { theme: newTheme }) }
    catch { toast.error(t('kid.saveThemeError')); setTheme(kid.theme || 'football') }
  }

  const saveBirthday = async (nextBirthday) => {
    setBirthday(nextBirthday)
    if ((nextBirthday || null) === (kid.birthday || null)) return
    try {
      await updateDoc(ref, { birthday: nextBirthday || null })
    } catch {
      toast.error(t('kid.saveBirthdayError'))
      setBirthday(kid.birthday || '')
    }
  }

  const handlePhotoPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadKidAvatar({ boardId, kidId: kid.id, file })
      await updateDoc(ref, {
        avatarKind: 'photo',
        avatarUrl: url,
        avatarEmoji: null,
      })
      setAvatarKind('photo')
      setAvatarUrl(url)
      setAvatarEmoji(null)
      toast.success?.(t('kid.photoSaved'))
    } catch (err) {
      toast.error(err?.message || t('kid.uploadError'))
    }
    setUploading(false)
  }

  const pickEmoji = async (emoji) => {
    try {
      await updateDoc(ref, {
        avatarKind: 'preset',
        avatarEmoji: emoji,
        avatarUrl: null,
      })
      setAvatarKind('preset')
      setAvatarEmoji(emoji)
      setAvatarUrl(null)
      if (avatarKind === 'photo') {
        deleteKidAvatar({ boardId, kidId: kid.id }).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[KidEditModal] deleteKidAvatar cleanup failed', err)
        })
      }
    } catch { toast.error(t('kid.saveAvatarError')) }
  }

  const useThemeDefault = async () => {
    try {
      await updateDoc(ref, {
        avatarKind: 'theme',
        avatarUrl: null,
        avatarEmoji: null,
      })
      if (avatarKind === 'photo') {
        // Best-effort cleanup of the orphaned storage object. Failure
        // is non-blocking — the Firestore record already points away
        // from the photo, so the UX is unaffected; the worst case is
        // a stale jpeg sitting in Storage.
        deleteKidAvatar({ boardId, kidId: kid.id }).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[KidEditModal] deleteKidAvatar cleanup failed', err)
        })
      }
      setAvatarKind('theme')
      setAvatarUrl(null)
      setAvatarEmoji(null)
    } catch { toast.error(t('kid.resetAvatarError')) }
  }

  const swapOrder = async (direction) => {
    const other = direction === 'up' ? sorted[idx - 1] : sorted[idx + 1]
    if (!other) return
    try {
      await Promise.all([
        updateDoc(ref, { order: other.order ?? 0 }),
        updateDoc(doc(db, 'boards', boardId, 'kids', other.id), { order: kid.order ?? 0 }),
      ])
    } catch { toast.error(t('kid.reorderError')) }
  }

  const canDelete = deleteTyped.trim().toLowerCase() === kid.name.trim().toLowerCase()
  const handleDelete = async () => {
    if (!canDelete) return
    setBusy(true)
    try {
      // COPPA hard rule: wipe kids-data subcollections BEFORE the parent
      // doc. Firestore does NOT cascade-delete subcollections — without
      // this, /habits/* (added by iOS Habits tab) and /weekHistory/*
      // orphan in the database forever, violating "no indefinite
      // retention". Surfaced by security review FIND-003 (2026-05-09).
      await deleteSubcollection(boardId, kid.id, 'habits')
      await deleteSubcollection(boardId, kid.id, 'weekHistory')
      await deleteDoc(ref)
      onDeleted?.(kid.id)
      onClose?.()
    } catch { toast.error(t('kid.deleteError')) }
    setBusy(false)
  }

  // Batched cascade delete of one kids-data subcollection. Firestore caps
  // batches at 500 ops; both habits and weekHistory typically stay well
  // under, but the loop handles the edge case for long-tenured kids.
  async function deleteSubcollection(bId, kId, subcollection) {
    const colRef = collection(db, 'boards', bId, 'kids', kId, subcollection)
    const snap = await getDocs(colRef)
    if (snap.empty) return
    const batches = []
    let batch = writeBatch(db)
    let count = 0
    for (const docSnap of snap.docs) {
      batch.delete(docSnap.ref)
      count++
      if (count >= 500) {
        batches.push(batch)
        batch = writeBatch(db)
        count = 0
      }
    }
    if (count > 0) batches.push(batch)
    await Promise.all(batches.map((b) => b.commit()))
  }

  const avatarPreviewKid = {
    ...kid,
    theme,
    avatarKind,
    avatarUrl,
    avatarEmoji,
  }
  const activeTheme = THEMES[theme] || THEMES.football

  return (
    <Modal
      open={open}
      onClose={busy || uploading ? undefined : onClose}
      emoji="✏️"
      title={t('kid.editTitle', { name: kid.name || t('kid.superstar') })}
      panelClassName="!max-w-[920px] !overflow-hidden"
    >
      <div className="flex h-[calc(100vh-14.5rem)] max-h-[720px] flex-col sm:h-auto sm:max-h-[calc(100vh-9.5rem)]">
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1 sm:pr-2 lg:grid-cols-[280px_minmax(0,1fr)] lg:overflow-hidden lg:pr-0">
          <aside className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4 lg:self-start">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || busy}
                aria-label={t('kid.changeAvatarA11y')}
                className="relative rounded-full transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa/70 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                <KidAvatar kid={avatarPreviewKid} size={104} borderColor="#12351F" />
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-earthy-cocoa/60 flex items-center justify-center text-earthy-ivory text-xs font-bold">
                    ...
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-earthy-cocoa text-sm text-earthy-cream shadow-earthy-soft">
                  📷
                </span>
              </button>
              <p className="mt-3 text-center text-xs font-bold text-earthy-cocoaSoft">
                {uploading ? t('kid.uploading') : t('kid.changeAvatarHint')}
              </p>
            </div>

            <fieldset className="mt-5">
              <legend className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
                {t('kid.avatar')}
              </legend>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || busy}
                  className="min-h-11 rounded-xl bg-earthy-card border border-earthy-divider px-3 text-sm font-bold text-earthy-cocoa hover:bg-earthy-cream active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  📷 {t('kid.photo')}
                </button>
              </div>
            </fieldset>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoPick}
              className="hidden"
            />
            <div className="mt-3 max-h-56 overflow-y-auto rounded-2xl border border-earthy-divider bg-earthy-card p-3">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {KID_AVATARS.map((emoji) => {
                  const active = avatarKind === 'preset' && avatarEmoji === emoji
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => active ? useThemeDefault() : pickEmoji(emoji)}
                      aria-label={t('kid.avatarA11y', { emoji })}
                      aria-pressed={active}
                      className="h-11 w-11 rounded-full text-2xl flex items-center justify-center transition-all active:scale-[0.96]"
                      style={{
                        background: active ? `${activeTheme.accent}55` : '#FFFAF0',
                        border: active ? `2px solid ${activeTheme.deeper}` : '2px solid #E8DDD0',
                      }}
                    >
                      <FluentEmoji emoji={emoji} size={26} />
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <div className="min-h-0 lg:max-h-[calc(100vh-14.5rem)] lg:overflow-y-auto lg:pr-1">
            <div className="grid gap-4">
              <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
                <label htmlFor={nameId} className="text-xs font-bold text-earthy-cocoaSoft mb-1 block uppercase tracking-wide">
                  {t('kid.name')}
                </label>
                <input
                  id={nameId}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
                  data-autofocus="true"
                  className="w-full min-h-12 px-3 py-3 rounded-xl border-2 border-earthy-divider bg-earthy-card focus:border-earthy-terracotta focus:outline-none text-base font-bold text-earthy-cocoa"
                />

                <label className="text-xs font-bold text-earthy-cocoaSoft mb-2 mt-4 block uppercase tracking-wide">
                  {t('signup.kid.birthday')} <span className="font-normal normal-case text-earthy-cocoaSoft/70">({t('signup.kid.optional')})</span>
                </label>
                <EarthyDatePicker
                  value={birthday}
                  onChange={saveBirthday}
                  placeholder={t('signup.kid.birthdayPlaceholder')}
                  ariaLabel={t('signup.kid.birthdayA11y')}
                />
              </section>

              <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
                <div className="text-xs font-bold text-earthy-cocoaSoft mb-3 block uppercase tracking-wide">
                  {t('kid.bannerTheme')}
                </div>
                <div role="radiogroup" aria-label={t('kid.pickTheme')} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(THEMES).map(([key, themeOption]) => {
                    const active = theme === key
                    return (
                      <BannerThemeOption
                        key={key}
                        themeKey={key}
                        label={themeLabel(key, themeOption.label)}
                        deeper={themeOption.deeper}
                        selected={active}
                        onClick={() => saveTheme(key)}
                      />
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
                <div className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
                  {t('kid.position')}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => swapOrder('up')}
                    disabled={isFirst}
                    className="min-h-11 flex items-center justify-center gap-1 rounded-xl bg-earthy-terracottaSoft px-3 font-bold text-earthy-cocoa transition-all active:scale-[0.99] disabled:opacity-40"
                  >
                    <Icon name="chevron-left" size={18} />
                    {t('kid.moveLeft')}
                  </button>
                  <button
                    type="button"
                    onClick={() => swapOrder('down')}
                    disabled={isLast}
                    className="min-h-11 flex items-center justify-center gap-1 rounded-xl bg-earthy-terracottaSoft px-3 font-bold text-earthy-cocoa transition-all active:scale-[0.99] disabled:opacity-40"
                  >
                    {t('kid.moveRight')}
                    <Icon name="chevron-right" size={18} />
                  </button>
                </div>
              </section>

              {confirmingDelete && (
                <section className="rounded-2xl border border-semantic-danger/20 bg-semantic-danger/10 p-4">
                  <p className="text-sm font-bold text-semantic-danger mb-2">
                    {t('kid.deleteConfirm', { name: kid.name || t('kid.superstar') })}
                  </p>
                  <input
                    value={deleteTyped}
                    onChange={(e) => setDeleteTyped(e.target.value)}
                    placeholder={kid.name}
                    autoFocus
                    className="w-full min-h-11 px-3 py-2 rounded-lg border-2 border-semantic-danger/30 focus:border-semantic-danger focus:outline-none font-bold bg-earthy-card text-earthy-cocoa"
                  />
                  <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => { setConfirmingDelete(false); setDeleteTyped('') }}
                      disabled={busy}
                      className="min-h-11 rounded-pill bg-earthy-card border-2 border-earthy-divider font-bold text-earthy-cocoaSoft"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={!canDelete || busy}
                      className="min-h-11 rounded-pill font-bold disabled:opacity-40 bg-semantic-danger text-earthy-ivory"
                    >
                      {busy ? t('kid.deleting') : t('kid.deleteForever')}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={busy || uploading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-pill border border-semantic-danger/25 px-4 text-sm font-bold text-semantic-danger transition-all hover:bg-semantic-danger/10 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
          >
            <Icon name="delete" size={17} />
            <span>{t('kid.deleteA11y')}</span>
          </button>
        ) : (
          <span className="hidden sm:block" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={onClose}
          disabled={busy || uploading}
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all disabled:opacity-50 sm:w-auto sm:min-w-40"
        >
          {t('common.done')}
        </button>
      </div>

    </Modal>
  )
}

function BannerThemeOption({ themeKey, label, deeper, selected, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onClick}
      className="overflow-hidden rounded-2xl border bg-earthy-card text-left transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa/70 focus-visible:ring-offset-2"
      style={{
        borderColor: selected ? deeper : '#E8DDD0',
        borderWidth: selected ? 3 : 1,
        boxShadow: selected ? `0 4px 12px ${deeper}2E` : '0 2px 6px rgba(90, 58, 46, 0.06)',
      }}
      title={label}
    >
      <ThemeBannerArt
        themeKey={themeKey}
        height={72}
        animated={false}
        loading="lazy"
        objectPosition="center"
        borderRadius={0}
      />
      <span className="flex min-h-10 items-center justify-between gap-2 px-3 py-2">
        <span className="min-w-0 truncate text-sm font-extrabold text-earthy-cocoa">{label}</span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
          style={{
            backgroundColor: selected ? '#12351F' : '#FFFFFF',
            borderColor: selected ? '#12351F' : '#E8DDD0',
            color: '#FFFAF0',
          }}
          aria-hidden="true"
        >
          {selected ? <Icon name="check" size={15} /> : null}
        </span>
      </span>
    </button>
  )
}
