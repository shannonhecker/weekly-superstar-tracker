import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { PET_ASSET, PET_CHAINS, THEMES } from '../lib/themes'
import { getWeekKey } from '../lib/week'
import Modal from './Modal'
import Egg from './Egg'

const RARE_STICKERS = new Set(['🌈', '🦄', '🧚', '🪄', '🎆', '💎', '🎇', '🌠'])

function animatedUrl(emoji) {
  const asset = PET_ASSET[emoji]
  if (!asset) return null
  return `https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/${encodeURIComponent(asset[0])}/${encodeURIComponent(asset[1])}.png`
}

function formatWeekKey(key) {
  if (!key) return ''
  try {
    const d = new Date(key + 'T00:00:00')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const sun = new Date(d)
    sun.setDate(d.getDate() + 6)
    const m1 = months[d.getMonth()]
    const m2 = months[sun.getMonth()]
    if (m1 === m2) return `${m1} ${d.getDate()}–${sun.getDate()}`
    return `${m1} ${d.getDate()} – ${m2} ${sun.getDate()}`
  } catch { return key }
}

function collectRareStickers(kid) {
  const map = kid?.stickers || {}
  const counts = {}
  for (const emoji of Object.values(map)) {
    if (RARE_STICKERS.has(emoji)) {
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
    } catch {}
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
    } catch {}
  }

  return (
    <Modal open={open} onClose={onClose} emoji="🏆" title={`${kid?.name || ''}'s Collection`}>
      <div className="max-h-[65vh] overflow-y-auto">
        {/* Treasures section — rare stickers + bonus stars from mystery boxes */}
        <div className="mb-4">
          <div className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-2">🎁 Mystery Treasures</div>
          {rareEntries.length === 0 && bonusStars === 0 ? (
            <p className="text-xs text-gray-400 font-bold py-2">
              Keep tapping stickers — mystery boxes appear once in a while!
            </p>
          ) : (
            <div className="bg-amber-50 rounded-xl p-3">
              {rareEntries.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {rareEntries.map(([emoji, count]) => (
                    <div key={emoji} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-amber-200">
                      <span className="text-xl">{emoji}</span>
                      <span className="text-xs font-bold text-amber-700">× {count}</span>
                    </div>
                  ))}
                </div>
              )}
              {bonusStars > 0 && (
                <div className="text-xs font-bold text-amber-700">
                  ⭐ Bonus stars earned: {bonusStars}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pet history section */}
        <div className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-2">🐾 Pet History</div>

        {/* Current week */}
        {currentPet && currentStage === 0 && (() => {
          const kidTheme = THEMES[kid?.theme] || THEMES.football
          return (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-50 mb-2">
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
                <div className="font-bold text-gray-700">This week</div>
                <div className="text-xs text-gray-500 font-bold truncate">
                  {currentEggName} — earn 50 stars to hatch!
                </div>
              </div>
            </div>
          )
        })()}
        {currentPet && currentStage > 0 && (() => {
          const currentFav = isFavoriteEntry(currentWeekKey, currentPet)
          const currentSnapshot = {
            emoji: currentPet,
            chainLabel: PET_CHAINS[currentChainKey]?.label || 'Pet',
            petName: kid?.petName || null,
            weekKey: currentWeekKey,
          }
          return (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-50 mb-2">
              <img
                src={animatedUrl(currentPet)}
                alt=""
                width={48}
                height={48}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-700">This week</div>
                <div className="text-xs text-gray-500 font-bold truncate">
                  {kid?.petName || `Your ${currentPet} is still growing!`}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSnapshot) }}
                aria-label={currentFav ? 'Unset favorite' : 'Set as favorite'}
                aria-pressed={currentFav}
                className="shrink-0 text-lg px-2"
                style={{ color: currentFav ? '#F59E0B' : '#D1D5DB' }}
              >
                {currentFav ? '⭐' : '☆'}
              </button>
              {onRename && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose?.(); onRename(); }}
                  aria-label="Rename pet"
                  className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold text-purple-600 bg-white border border-purple-200"
                >
                  ✏️ Rename
                </button>
              )}
            </div>
          )
        })()}

        {entries.length === 0 && (
          <p className="text-xs text-gray-400 font-bold py-2">
            No past weeks yet.
          </p>
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
              className={`flex items-center gap-3 p-2 rounded-xl ${canOpen ? 'hover:bg-gray-50 active:scale-[0.99] transition-transform cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-300' : 'hover:bg-gray-50'}`}
              style={isFav ? { background: '#FEF3C7' } : undefined}
            >
              {pet ? (
                <img src={animatedUrl(pet)} alt="" width={48} height={48} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">🥚</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-700 truncate">{formatWeekKey(weekKey)}</div>
                <div className="text-[11px] text-gray-500 font-bold truncate">
                  {name ? `${name} · ` : ''}{stars} stars
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(snapshot) }}
                aria-label={isFav ? 'Unset favorite' : 'Set as favorite'}
                aria-pressed={isFav}
                className="shrink-0 text-lg px-2"
                style={{ color: isFav ? '#F59E0B' : '#D1D5DB' }}
              >
                {isFav ? '⭐' : '☆'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteEntry(weekKey) }}
                aria-label="Delete history entry"
                className="shrink-0 text-gray-300 hover:text-red-400 text-lg px-2"
              >
                🗑
              </button>
            </div>
          )
        })}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-4 py-2 rounded-xl text-gray-400 font-bold text-sm"
      >
        Close
      </button>
    </Modal>
  )
}
