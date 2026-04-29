import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { PET_CHAINS, THEMES, petAtStage, animatedFluentUrl } from '../lib/themes'
import { getWeekKey, formatWeekKey } from '../lib/week'
import { RARE_STICKERS } from '../lib/stickers'
import { useToast } from '../contexts/ToastContext'
import Modal from './Modal'
import Egg from './Egg'
import EmptyStateScene from './EmptyStateScene'

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

export default function PetGallery({ open, onClose, kid, currentPet, currentChainKey, currentStage = 0, currentEggName = 'Mystery Egg', boardId, onRename, onOpenSummary }) {
  const toast = useToast()
  const history = kid?.weekHistory || {}
  const favorite = kid?.favoritePet || null
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
      toast.error('Could not remove that week — try again')
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
      toast.error('Could not update favourite — try again')
    }
  }

  return (
    <Modal open={open} onClose={onClose} emoji="🏆" title={`${kid?.name || ''}'s Collection`}>
      <div className="max-h-[65vh] overflow-y-auto">
        {/* Treasures section — rare stickers + bonus stars from mystery boxes */}
        <div className="mb-4">
          <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">🎁 Mystery Treasures</div>
          {rareEntries.length === 0 && bonusStars === 0 ? (
            <p className="text-xs text-earthy-cocoaSoft font-bold py-2">
              Keep tapping stickers — mystery boxes appear once in a while!
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
                  ⭐ Bonus stars earned: {bonusStars}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pet history section */}
        <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">🐾 Pet History</div>

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
                <div className="font-bold text-earthy-cocoa">This week</div>
                <div className="text-xs text-earthy-cocoaSoft font-bold truncate">
                  {currentEggName} — earn 50 stars to hatch!
                </div>
              </div>
            </div>
          )
        })()}
        {currentStage > 0 && (() => {
          // Fallback to petAtStage so we still render a thumbnail when
          // currentPet is briefly undefined during chain assignment.
          const pet = currentPet || petAtStage(kid?.chainKey || 'cats', currentStage).emoji
          const currentFav = isFavoriteEntry(currentWeekKey, pet)
          const currentSnapshot = {
            emoji: pet,
            chainLabel: PET_CHAINS[currentChainKey]?.label || 'Pet',
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
                <div className="font-bold text-earthy-cocoa">This week</div>
                <div className="text-xs text-earthy-cocoaSoft font-bold truncate">
                  {kid?.petName || `Your ${pet} is still growing!`}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSnapshot) }}
                aria-label={currentFav ? 'Unset favorite' : 'Set as favorite'}
                aria-pressed={currentFav}
                className="shrink-0 text-lg px-2"
                style={{ color: currentFav ? '#F59E0B' : '#6B7280' }}
              >
                {currentFav ? '⭐' : '☆'}
              </button>
              {onRename && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose?.(); onRename(); }}
                  aria-label="Rename pet"
                  className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold text-earthy-cocoa bg-earthy-cream border border-earthy-divider"
                >
                  ✏️ Rename
                </button>
              )}
            </div>
          )
        })()}

        {entries.length === 0 && (
          <div className="rounded-2xl overflow-hidden bg-earthy-ivory ring-1 ring-earthy-divider mb-2">
            <EmptyStateScene variant="no-weeks" />
            <p className="text-xs text-earthy-cocoaSoft font-bold text-center py-3">
              No past weeks yet — finish this week to start your collection.
            </p>
          </div>
        )}

        {entries.map(([weekKey, archive]) => {
          const pet = archive.petEmoji
          const stars = archive.totalStars || 0
          const name = archive.petName
          const isFav = isFavoriteEntry(weekKey, pet)
          const snapshot = {
            emoji: pet,
            chainLabel: PET_CHAINS[archive.chainKey]?.label || 'Pet',
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
              aria-label={canOpen ? `Open ${formatWeekKey(weekKey)} recap` : undefined}
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
                  {name ? `${name} · ` : ''}{stars} stars
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(snapshot) }}
                aria-label={isFav ? 'Unset favorite' : 'Set as favorite'}
                aria-pressed={isFav}
                className="shrink-0 text-lg px-2"
                style={{ color: isFav ? '#F59E0B' : '#6B7280' }}
              >
                {isFav ? '⭐' : '☆'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteEntry(weekKey) }}
                aria-label="Delete history entry"
                className="shrink-0 text-earthy-cocoaSoft hover:text-red-400 text-lg px-2"
              >
                🗑
              </button>
            </div>
          )
        })}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-4 py-2 rounded-xl text-earthy-cocoaSoft font-bold text-sm"
      >
        Close
      </button>
    </Modal>
  )
}
