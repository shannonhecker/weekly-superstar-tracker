import { useState } from 'react'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { PET_CHAINS, THEMES, HATCH_GOAL, petAtStage, animatedFluentUrl } from '../lib/themes'
import { getWeekKey, formatWeekKey } from '../lib/week'
import { RARE_STICKERS } from '../lib/stickers'
import { useToast } from '../contexts/ToastContext'
import Modal from './Modal'
import Icon from './Icon'
import Egg from './Egg'
import EmptyStateScene from './EmptyStateScene'
import { useI18n } from '../lib/i18n'

function collectRareStickers(kid) {
  const map = kid?.stickers || {}
  const counts = {}
  for (const emoji of Object.values(map)) {
    if (RARE_STICKERS.includes(emoji)) {
      counts[emoji] = (counts[emoji] || 0) + 1
    }
  }
  return counts
}

function totalBonusStars(kid) {
  const b = kid?.bonusStars || {}
  return Object.values(b).reduce((s, v) => s + (v || 0), 0)
}

function rawSpeciesForEmoji(chainKey, emoji) {
  const chain = PET_CHAINS[chainKey]
  if (!chain || !emoji) return ''
  const idx = chain.stages.indexOf(emoji)
  return idx >= 0 ? chain.names[idx] : ''
}

export default function PetGallery({ open, onClose, kid, currentPet, currentChainKey, currentStage = 0, currentEggName = 'Mystery Egg', boardId, onRename, onOpenSummary }) {
  const toast = useToast()
  const { t, petSpeciesName, petChainLabel } = useI18n()
  const history = kid?.weekHistory || {}
  const favorite = kid?.favoritePet || null
  // Two-step delete — the trash icon next to each week entry sits 8px
  // away from the favourite-star icon and is easy to mis-tap on touch.
  // An accidental tap fires an irreversible Firestore deleteField on
  // a real memory. Confirming via a second deliberate click (in a
  // separate modal with a destructive-styled button) is what defeats
  // fat-finger taps.
  const [pendingDelete, setPendingDelete] = useState(null) // { weekKey, archive } | null
  const isFavoriteEntry = (weekKey, emoji) =>
    !!favorite && favorite.weekKey === weekKey && favorite.emoji === emoji
  const rareCounts = collectRareStickers(kid)
  const bonusStars = totalBonusStars(kid)
  const rareEntries = Object.entries(rareCounts)
  const currentWeekKey = kid?.weekKey || getWeekKey()

  // Sort past weeks: favorite first (if it's a past-week entry), then most recent → oldest.
  const entries = Object.entries(history).sort((a, b) => {
    const aFav = isFavoriteEntry(a[0], a[1]?.petEmoji)
    const bFav = isFavoriteEntry(b[0], b[1]?.petEmoji)
    if (aFav !== bFav) return aFav ? -1 : 1
    return a[0] < b[0] ? 1 : -1
  })

  const deleteEntry = async (weekKey) => {
    if (!boardId || !kid?.id) return
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
        [`weekHistory.${weekKey}`]: deleteField(),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[PetGallery] deleteEntry failed', err)
      toast.error(t('petGallery.removeError'))
    }
  }

  const toggleFavorite = async (snapshot) => {
    if (!boardId || !kid?.id) return
    const same =
      favorite &&
      favorite.weekKey === snapshot.weekKey &&
      favorite.emoji === snapshot.emoji
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), {
        favoritePet: same ? null : snapshot,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[PetGallery] toggleFavorite failed', err)
      toast.error(t('petGallery.favoriteError'))
    }
  }

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      emoji="🏆"
      title={t('petGallery.title', { name: kid?.name || '' })}
      panelClassName="!max-w-[860px] !overflow-hidden"
    >
      <div className="flex h-[calc(100vh-13rem)] max-h-[680px] flex-col sm:h-auto sm:max-h-[calc(100vh-9rem)]">
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
        {/* Bonus Goodies section: rare stickers + bonus stars from mystery boxes */}
        <div className="mb-4">
          <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">✨ {t('petGallery.bonusGoodies')}</div>
          {rareEntries.length === 0 && bonusStars === 0 ? (
            <p className="text-xs text-earthy-cocoaSoft font-bold py-2">
              {t('petGallery.bonusHelp')}
            </p>
          ) : (
            <div className="bg-earthy-terracottaSoft/40 rounded-xl p-3">
              {rareEntries.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {rareEntries.map(([emoji, count]) => (
                    <div key={emoji} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-earthy-cream border border-earthy-terracotta/40">
                      <span className="text-xl">{emoji}</span>
                      <span className="text-xs font-bold text-earthy-terracotta">× {count}</span>
                    </div>
                  ))}
                </div>
              )}
              {bonusStars > 0 && (
                <div className="text-xs font-bold text-earthy-terracotta">
                  ⭐ {t('petGallery.bonusStarsEarned', { count: bonusStars })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pet history section */}
        <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">🐾 {t('petGallery.petHistory')}</div>

        {/* Current week */}
        {currentPet && currentStage === 0 && (() => {
          const kidTheme = THEMES[kid?.theme] || THEMES.football
          return (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-earthy-ivory border border-earthy-divider mb-2">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <Egg
                  themeKey={kid?.theme || 'football'}
                  accent={kidTheme.accent}
                  totalStars={0}
                  max={50}
                  petEmoji=""
                  size={48}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-earthy-cocoa">{t('board.thisWeek')}</div>
                <div className="text-xs text-earthy-cocoaSoft font-bold truncate">
                  {t('petGallery.earnStarsToHatch', { egg: currentEggName, count: HATCH_GOAL })}
                </div>
              </div>
            </div>
          )
        })()}
        {currentStage > 0 && (() => {
          // Fallback to petAtStage so we still render a thumbnail when
          // currentPet is briefly undefined during chain assignment.
          const chainKey = currentChainKey || kid?.chainKey || 'cats'
          const currentPetInfo = petAtStage(chainKey, currentStage)
          const pet = currentPet || currentPetInfo.emoji
          const species = petSpeciesName(currentPetInfo.name)
          const currentFav = isFavoriteEntry(currentWeekKey, pet)
          const currentSnapshot = {
            emoji: pet,
            chainLabel: petChainLabel(chainKey, PET_CHAINS[chainKey]?.label),
            petName: kid?.petName || null,
            weekKey: currentWeekKey,
          }
          return (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-earthy-ivory border border-earthy-divider mb-2">
              <img
                src={animatedFluentUrl(pet)}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-earthy-cocoa">{t('board.thisWeek')}</div>
                <div className="text-xs text-earthy-cocoaSoft font-bold truncate">
                  {kid?.petName || t('petGallery.yourPetGrowing', { pet: species || pet })}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSnapshot) }}
                aria-label={currentFav ? t('petGallery.unsetFavorite') : t('petGallery.setFavorite')}
                aria-pressed={currentFav}
                className="shrink-0 text-lg px-2"
                style={{ color: currentFav ? '#F59E0B' : '#6B7280' }}
              >
                {currentFav ? '⭐' : '☆'}
              </button>
              {onRename && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose?.(); onRename(); }}
                  aria-label={t('petGallery.renamePet')}
                  className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold text-earthy-cocoa bg-earthy-cream border border-earthy-divider flex items-center gap-1"
                >
                  <Icon name="edit" size={14} />
                  <span>{t('petGallery.rename')}</span>
                </button>
              )}
            </div>
          )
        })()}

        {entries.length === 0 && (
          <div className="rounded-2xl overflow-hidden bg-earthy-card border border-earthy-divider mb-2">
            <EmptyStateScene variant="no-weeks" />
            <p className="text-xs text-earthy-cocoaSoft font-bold text-center px-3 py-3 border-t border-earthy-dividerCream">
              {t('petGallery.noPastWeeks')}
            </p>
          </div>
        )}

        {entries.map(([weekKey, archive]) => {
          const pet = archive.petEmoji
          const stars = archive.totalStars || 0
          const name = archive.petName
          const species = petSpeciesName(rawSpeciesForEmoji(archive.chainKey, pet))
          const isFav = isFavoriteEntry(weekKey, pet)
          const snapshot = {
            emoji: pet,
            chainLabel: petChainLabel(archive.chainKey, PET_CHAINS[archive.chainKey]?.label),
            petName: name || null,
            weekKey,
          }
          const openRecap = () => onOpenSummary?.(weekKey, archive)
          const canOpen = !!onOpenSummary
          return (
            <div
              key={weekKey}
              role={canOpen ? 'button' : undefined}
              tabIndex={canOpen ? 0 : undefined}
              onClick={canOpen ? openRecap : undefined}
              onKeyDown={canOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRecap() } } : undefined}
              aria-label={canOpen ? t('petGallery.openRecap', { week: formatWeekKey(weekKey) }) : undefined}
              className={`flex items-center gap-3 p-2 rounded-xl ${canOpen ? 'hover:bg-earthy-cream active:scale-[0.99] transition-transform cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta' : 'hover:bg-earthy-cream'}`}
              style={isFav ? { background: '#FEF3C7' } : undefined}
            >
              {pet ? (
                <img src={animatedFluentUrl(pet)} alt="" width={48} height={48} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-earthy-divider flex items-center justify-center text-xl">🥚</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-earthy-cocoa truncate">{formatWeekKey(weekKey)}</div>
                <div className="text-[11px] text-earthy-cocoaSoft font-bold truncate">
                  {name ? `${name} · ` : species ? `${species} · ` : ''}{t('board.starsCount', { count: stars })}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(snapshot) }}
                aria-label={isFav ? t('petGallery.unsetFavorite') : t('petGallery.setFavorite')}
                aria-pressed={isFav}
                className="shrink-0 text-lg px-2"
                style={{ color: isFav ? '#F59E0B' : '#6B7280' }}
              >
                {isFav ? '⭐' : '☆'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPendingDelete({ weekKey, archive: snapshot }) }}
                aria-label={t('petGallery.removeWeekA11y')}
                className="shrink-0 text-earthy-cocoaSoft hover:text-red-400 px-2 flex items-center"
              >
                <Icon name="delete" size={18} />
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex justify-end border-t border-earthy-divider pt-4">
        <button
          onClick={onClose}
          className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
        >
          {t('common.close')}
        </button>
      </div>
      </div>
    </Modal>
    <Modal
      open={!!pendingDelete}
      onClose={() => setPendingDelete(null)}
      emoji="🗑"
      title={t('petGallery.removeWeekTitle')}
      panelClassName="!max-w-lg !overflow-hidden"
    >
        <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
        <div className="text-sm text-earthy-cocoa font-bold mb-2">
          {pendingDelete?.archive?.emoji ? `${pendingDelete.archive.emoji} ` : ''}
          {pendingDelete?.archive?.petName ? `"${pendingDelete.archive.petName}" — ` : ''}
          {pendingDelete?.weekKey ? formatWeekKey(pendingDelete.weekKey) : ''}
        </div>
        <p className="text-sm text-earthy-cocoaSoft mb-5">
          {kid?.name
            ? t('petGallery.removeWeekBody', { name: kid.name })
            : t('petGallery.removeWeekBodyFallback')}
        </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setPendingDelete(null)}
            className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={async () => {
              const wk = pendingDelete?.weekKey
              setPendingDelete(null)
              if (wk) await deleteEntry(wk)
            }}
            className="flex min-h-12 w-full items-center justify-center rounded-pill bg-red-500 px-6 font-bold text-white transition-colors hover:bg-red-600 active:scale-[0.99] sm:w-auto sm:min-w-32"
          >
            {t('activities.remove')}
          </button>
        </div>
    </Modal>
    </>
  )
}
