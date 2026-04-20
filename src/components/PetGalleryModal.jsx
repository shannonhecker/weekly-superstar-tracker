import { useEffect } from 'react'
import { getPetByIndex, getPetTier } from '../utils/randomPets'
import { DAYS } from '../utils/constants'
import PetFace from './PetFace'

// Gallery of every pet this kid has hatched across their weeks. Appeals
// to the kid's collecting instinct without any extra schema work: we
// derive the list from weekHistory.petIdx values (unique, insertion
// order). Empty state encourages completing more weeks.
const PetGalleryModal = ({ kid, theme, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const currentScore = Object.values(kid.checks || {}).filter(Boolean).length
  const currentMax = (kid.activities || []).length * DAYS.length
  const currentTier = getPetTier(currentScore, currentMax)

  const seen = new Set()
  const pets = []
  ;(kid.weekHistory || []).forEach((h) => {
    if (h.petIdx == null || seen.has(h.petIdx)) return
    seen.add(h.petIdx)
    const pet = getPetByIndex(h.petIdx)
    pets.push({ idx: h.petIdx, pet, weekKey: h.weekKey, score: h.score })
  })
  // Include current week's pet if different
  if (kid.petIdx != null && !seen.has(kid.petIdx)) {
    const pet = getPetByIndex(kid.petIdx)
    pets.push({ idx: kid.petIdx, pet, current: true })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 id="gallery-title" className="text-lg font-black font-display text-gray-800">
              🏆 {kid.name}'s pet collection
            </h2>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 text-2xl leading-none">×</button>
          </div>

          {pets.length === 0 ? (
            <p className="text-sm text-gray-400 font-semibold py-8 text-center">
              No pets hatched yet. Complete a week to add to the collection!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pets.map(({ idx, pet, weekKey, score, current }) => {
                // Current-week tile shows the stage the kid has actually
                // reached so far. Past weeks show the adult form as a
                // "trophy" of the creature they raised.
                const displayState = current
                  ? (currentTier > 0 ? pet.states[currentTier - 1] : null)
                  : pet.states[3]
                return (
                  <div
                    key={idx}
                    className="rounded-2xl p-3 flex flex-col items-center text-center"
                    style={{ background: `${theme.accentLight}30`, border: `2px solid ${theme.accentLight}` }}
                  >
                    <div className="mb-1">
                      {displayState ? (
                        <PetFace emoji={displayState.face} />
                      ) : (
                        <div className="text-3xl" aria-label="Egg">🥚</div>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-gray-800 leading-tight">
                      {pet.name}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-500 leading-tight">
                      {displayState ? displayState.mood : 'Egg — keep tapping!'}
                    </div>
                    <div className="text-[10px] font-semibold mt-1" style={{ color: theme.accent }}>
                      {current ? 'This week' : `${score ?? '—'}★ · ${weekKey || ''}`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-[11px] text-gray-400 font-semibold mt-5 text-center">
            A new random pet hatches every week. Keep going to collect them all!
          </p>
        </div>
      </div>
    </div>
  )
}

export default PetGalleryModal
