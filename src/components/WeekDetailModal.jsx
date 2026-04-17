import { useEffect } from 'react'
import { DAYS } from '../utils/constants'
import { getBadge } from '../utils/helpers'
import { getPetByIndex } from '../utils/randomPets'
import PetFace from './PetFace'

// Modal showing a single past week in detail - score, badge, which pet
// was hatched, and the exact sticker grid (for weeks saved under the
// new schema). Older history entries without `checks` fall back to
// showing just the score summary.
const WeekDetailModal = ({ entry, theme, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!entry) return null
  const badge = getBadge(entry.score, theme)
  const checks = entry.checks || {}
  const hasChecks = Object.keys(checks).length > 0

  // Derive which activities were in play that week from the check keys
  // ("<actId>-<day>"). Falls back to the current theme's activities if
  // we can't infer.
  const activityIds = hasChecks
    ? Array.from(new Set(Object.keys(checks).map((k) => k.slice(0, k.lastIndexOf('-')))))
    : []

  const pet = entry.petIdx != null ? getPetByIndex(entry.petIdx) : null
  const adult = pet?.states?.[3]

  const dateLabel = entry.date
    ? new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : entry.weekKey || 'Week'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="week-detail-title"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 id="week-detail-title" className="text-lg font-black font-display text-gray-800">
              📅 {dateLabel}
            </h2>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 text-2xl leading-none">×</button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            {adult && (
              <div className="shrink-0">
                <PetFace emoji={adult.face} />
              </div>
            )}
            <div className="flex-1">
              <div className="text-3xl font-black" style={{ color: badge?.color || theme.accent }}>
                {entry.score}<span className="text-lg text-gray-300"> stars</span>
              </div>
              {badge && (
                <div className="text-sm font-extrabold" style={{ color: badge.color }}>
                  {badge.icon} {badge.label} week
                </div>
              )}
              {adult && (
                <div className="text-xs font-semibold text-gray-500 mt-0.5">
                  Hatched: {pet.name} — {adult.mood}
                </div>
              )}
            </div>
          </div>

          {hasChecks ? (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full border-separate border-spacing-0 bg-gray-50/60 rounded-xl">
                <thead>
                  <tr>
                    <th scope="col" className="text-left px-2 py-2 text-[11px] font-bold text-gray-400">Activity</th>
                    {DAYS.map((d) => (
                      <th scope="col" key={d} className="px-1 py-2 text-[11px] font-bold text-gray-400 text-center">{d.slice(0, 1)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activityIds.map((aid) => {
                    const rowChecks = DAYS.map((d) => !!checks[`${aid}-${d}`])
                    return (
                      <tr key={aid}>
                        <td className="px-2 py-1.5 text-[11px] font-bold text-gray-600">{aid}</td>
                        {rowChecks.map((c, i) => (
                          <td key={i} className="text-center px-0.5 py-1.5">
                            <span className={`inline-block w-5 h-5 rounded-full ${c ? '' : 'border-2 border-gray-200'}`}
                              style={c ? { background: theme.accent, color: 'white' } : undefined}>
                              {c ? '✓' : ''}
                            </span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-semibold">
              Detailed sticker data isn't saved for this week. New weeks will capture the full grid.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeekDetailModal
