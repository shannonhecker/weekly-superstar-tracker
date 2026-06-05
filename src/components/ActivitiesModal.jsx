import { useEffect, useMemo, useState } from 'react'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ACTIVITY_COLORS, ACTIVITY_EMOJIS, ACTIVITY_PRESETS } from '../lib/themes'
import { mirrorActivitiesForKid } from '../lib/activities-mirror'
import { useToast } from '../contexts/ToastContext'
import Modal from './Modal'
import ActivityRow from './ActivityRow'
import { useI18n } from '../lib/i18n'

const MAX_ACTIVITIES = 10

function genId(label) {
  const slug =
    (label || 'task')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20) || 'task'
  return `${slug}-${Date.now().toString(36).slice(-5)}`
}

function pickRandomColor(existingColors) {
  const used = new Set(existingColors.filter(Boolean))
  const free = ACTIVITY_COLORS.filter((c) => !used.has(c))
  const pool = free.length > 0 ? free : ACTIVITY_COLORS
  return pool[Math.floor(Math.random() * pool.length)]
}

// Web port of iOS components/ActivitiesModal.tsx. Same three sub-views (list,
// emoji, colour, preset) toggled inside a single Modal — no nested modals.
// Same merge-by-id preset semantics: existing customised activities win,
// new ids append, 10-cap respected.
export default function ActivitiesModal({ open, onClose, kid, boardId, kids }) {
  const toast = useToast()
  const { t, activityLabel } = useI18n()
  const [view, setView] = useState('list')
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  // Pending-delete shape: { id, emoji, label } | null. Tapping the trash
  // icon stages this and opens the confirm modal; only Remove proceeds
  // to the persist() call. Defends against fat-finger taps on the wrong
  // row (delete is irreversible — wipes the activity and every check
  // tied to its id).
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    if (!open) return
    setView('list')
    setEditingId(null)
    setBusy(false)
    setPendingDelete(null)
  }, [open, kid?.id])

  const activities = useMemo(
    () => (kid?.activities && kid.activities.length > 0 ? kid.activities : []),
    [kid?.activities],
  )

  if (!kid) return null

  // Activity edits fan out to every kid on the board so the task list stays
  // in sync across siblings. The source kid (the one being edited) gets the
  // new array verbatim; every other kid is mirrored — labels matching keep
  // their existing IDs so star checks survive (`checks` are keyed by
  // `${activityId}-${day}`). One atomic Firestore batch.
  const persist = async (next) => {
    setBusy(true)
    try {
      const batch = writeBatch(db)
      const allKids = Array.isArray(kids) && kids.length > 0 ? kids : [kid]
      for (const k of allKids) {
        const ref = doc(db, 'boards', boardId, 'kids', k.id)
        const arr = k.id === kid.id ? next : mirrorActivitiesForKid(k.activities, next)
        batch.update(ref, { activities: arr })
      }
      await batch.commit()
    } catch {
      toast.error(t('board.saveError'))
    } finally {
      setBusy(false)
    }
  }

  const updateActivity = (id, patch) => {
    const next = activities.map((a) => (a.id === id ? { ...a, ...patch } : a))
    return persist(next)
  }

  const moveUp = (id) => {
    const idx = activities.findIndex((a) => a.id === id)
    if (idx <= 0) return
    const next = [...activities]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    return persist(next)
  }

  const moveDown = (id) => {
    const idx = activities.findIndex((a) => a.id === id)
    if (idx < 0 || idx >= activities.length - 1) return
    const next = [...activities]
    ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
    return persist(next)
  }

  const deleteActivity = (id) => {
    const target = activities.find((a) => a.id === id)
    setPendingDelete({
      id,
      emoji: target?.emoji || '',
      label: target ? activityLabel(target) : t('activities.thisActivity'),
    })
  }

  const confirmDeleteActivity = async () => {
    const id = pendingDelete?.id
    setPendingDelete(null)
    if (!id) return
    const next = activities.filter((a) => a.id !== id)
    await persist(next)
  }

  const addActivity = () => {
    if (activities.length >= MAX_ACTIVITIES) return
    const newActivity = {
      id: genId(''),
      label: '',
      emoji: '⭐',
      color: pickRandomColor(activities.map((a) => a.color || '')),
    }
    return persist([...activities, newActivity])
  }

  const applyPreset = (presetKey) => {
    const preset = ACTIVITY_PRESETS[presetKey]
    if (!preset) return
    const byId = new Map(activities.map((a) => [a.id, a]))
    for (const item of preset.activities) {
      if (byId.has(item.id)) continue
      if (byId.size >= MAX_ACTIVITIES) break
      byId.set(item.id, { ...item })
    }
    setView('list')
    return persist(Array.from(byId.values()))
  }

  const renderHeader = (title, showBack) => (
    <div className="flex items-center mb-4 min-h-[32px]">
      {showBack && (
        <button
          type="button"
          onClick={() => setView('list')}
          className="flex items-center text-sm font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa active:scale-[0.98]"
          aria-label={t('signup.back')}
        >
          <span className="mr-1">←</span> {t('signup.back')}
        </button>
      )}
      <h2
        className="font-extrabold text-lg flex-1 text-center text-earthy-cocoa"
        style={{ marginRight: showBack ? '56px' : 0 }}
      >
        {title}
      </h2>
    </div>
  )

  return (
    <>
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      panelClassName="!max-w-[900px] !overflow-hidden"
    >
      <div className="flex h-[calc(100vh-8.5rem)] max-h-[720px] flex-col sm:h-auto sm:max-h-[calc(100vh-8.5rem)]">
        {view === 'list' && (
          <div className="flex min-h-0 flex-1 flex-col">
            {renderHeader(kid.name ? t('activities.titleForKid', { name: kid.name }) : t('activities.title'), false)}

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
              {activities.length > 0 && (
                <div className="mb-2 hidden grid-cols-[56px_minmax(260px,1fr)_72px_92px_52px] gap-3 px-3 text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft md:grid">
                  <span>{t('kid.emoji')}</span>
                  <span>{t('activityRow.taskName')}</span>
                  <span>{t('activities.pickColor')}</span>
                  <span>{t('kid.position')}</span>
                  <span />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {activities.map((a, i) => (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    displayLabel={activityLabel(a)}
                    isFirst={i === 0}
                    isLast={i === activities.length - 1}
                    labels={{
                      taskName: t('activityRow.taskName'),
                      changeEmoji: t('activityRow.changeEmoji'),
                      changeColor: t('activityRow.changeColor'),
                      moveUp: t('activityRow.moveUp'),
                      moveDown: t('activityRow.moveDown'),
                      delete: t('activityRow.delete'),
                    }}
                    onLabelChange={(id, label) => updateActivity(id, { label })}
                    onPickEmoji={(id) => {
                      setEditingId(id)
                      setView('emoji')
                    }}
                    onPickColor={(id) => {
                      setEditingId(id)
                      setView('color')
                    }}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onDelete={deleteActivity}
                  />
                ))}
                {activities.length === 0 && (
                  <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory py-8 text-center text-sm font-bold text-earthy-cocoaSoft">
                    {t('activities.empty')}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 md:flex-row md:items-center md:justify-between">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:w-auto">
                <button
                  type="button"
                  onClick={addActivity}
                  disabled={activities.length >= MAX_ACTIVITIES || busy}
                  className="flex min-h-11 items-center justify-center gap-1 rounded-pill border border-earthy-divider bg-earthy-ivory px-4 font-bold text-earthy-cocoa active:scale-[0.98] disabled:opacity-40"
                >
                  <span>＋</span>
                  <span>
                    {t('activities.addTask', { count: activities.length, max: MAX_ACTIVITIES })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('preset')}
                  className="flex min-h-11 items-center justify-center gap-1 rounded-pill border border-earthy-divider bg-earthy-ivory px-4 font-bold text-earthy-cocoa active:scale-[0.98]"
                >
                  <span>✨</span>
                  <span>{t('activities.applyPreset')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
                className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold transition-all hover:bg-earthy-cocoaDark active:scale-[0.99] disabled:opacity-50 md:w-auto md:min-w-40"
              >
                {t('common.done')}
              </button>
            </div>
          </div>
        )}

        {view === 'emoji' && (
          <div className="min-h-0 overflow-y-auto pr-1">
            {renderHeader(t('activities.pickEmoji'), true)}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
              {ACTIVITY_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    if (editingId) updateActivity(editingId, { emoji: e })
                    setView('list')
                  }}
                  className="w-12 h-12 rounded-full bg-earthy-ivory border border-earthy-divider hover:bg-earthy-terracottaSoft/50 flex items-center justify-center text-2xl active:scale-[0.94]"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'color' && (
          <div className="min-h-0 overflow-y-auto pr-1">
            {renderHeader(t('activities.pickColor'), true)}
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
              {ACTIVITY_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    if (editingId) updateActivity(editingId, { color: hex })
                    setView('list')
                  }}
                  aria-label={`${t('activities.pickColor')} ${hex}`}
                  className="w-12 h-12 rounded-full border-[3px] border-earthy-cream shadow-earthy-soft active:scale-[0.94]"
                  style={{ background: hex }}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'preset' && (
          <div className="min-h-0 overflow-y-auto pr-1">
            {renderHeader(t('activities.applyPresetTitle'), true)}
            <p className="text-xs text-earthy-cocoaSoft mb-3">
              {t('activities.presetHelp', { max: MAX_ACTIVITIES })}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(ACTIVITY_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="rounded-2xl p-3 bg-earthy-ivory border border-earthy-divider hover:border-earthy-terracotta text-left active:scale-[0.99] transition-all"
                >
                  <div className="font-bold mb-1.5 text-earthy-cocoa">
                    {t(`activityPreset.${key}`) === `activityPreset.${key}` ? preset.label : t(`activityPreset.${key}`)}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.activities.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold text-earthy-cocoa"
                        style={{ background: a.color }}
                      >
                        <span className="mr-1 text-base leading-none">{a.emoji}</span>
                        <span>{activityLabel(a)}</span>
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
    <Modal
      open={!!pendingDelete}
      onClose={() => setPendingDelete(null)}
      emoji="🗑"
      title={t('activities.removeTitle')}
      panelClassName="!max-w-lg !overflow-hidden"
    >
      <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
        <div className="text-sm text-earthy-cocoa font-bold mb-2">
          {pendingDelete?.emoji ? `${pendingDelete.emoji} ` : ''}
          {pendingDelete?.label || t('activities.thisActivity')}
        </div>
        <p className="text-sm text-earthy-cocoaSoft">
          {kid?.name
            ? t('activities.removeBody', { name: kid.name })
            : t('activities.removeBodyFallback')}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setPendingDelete(null)}
          className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
        >
          {t('activities.cancel')}
        </button>
        <button
          onClick={confirmDeleteActivity}
          className="flex min-h-12 w-full items-center justify-center rounded-pill bg-red-500 px-6 font-bold text-white transition-colors hover:bg-red-600 active:scale-[0.99] sm:w-auto sm:min-w-32"
        >
          {t('activities.remove')}
        </button>
      </div>
    </Modal>
    </>
  )
}
