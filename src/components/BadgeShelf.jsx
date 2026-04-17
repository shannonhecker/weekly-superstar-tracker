import { useState } from 'react'

// Badge shelf with per-badge archive. Clicking a badge opens a small
// popover with a "Hide this badge" action; hidden badges are not shown
// unless the user toggles "Show hidden". Under the hood, we track hidden
// indexes on the kid document, so existing badge entries don't need a
// schema migration.
const BadgeShelf = ({ badges, currentBadge, hiddenIndexes = [], onToggleHidden }) => {
  const [showAll, setShowAll] = useState(false)
  const [openIdx, setOpenIdx] = useState(null)

  const hiddenSet = new Set(hiddenIndexes || [])
  const hiddenCount = hiddenSet.size

  const toggleHidden = (idx) => {
    if (!onToggleHidden) return
    const next = hiddenSet.has(idx)
      ? hiddenIndexes.filter((i) => i !== idx)
      : [...hiddenIndexes, idx]
    onToggleHidden(next)
    setOpenIdx(null)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {badges.map((b, idx) => {
        const hidden = hiddenSet.has(idx)
        if (!showAll && hidden) return null
        return (
          <div key={`${idx}-${b.label}`} className="relative">
            <button
              type="button"
              title={`Week ${idx + 1}: ${b.label}${hidden ? ' (hidden)' : ''}`}
              aria-label={`Badge ${idx + 1}: ${b.label}`}
              onClick={() => onToggleHidden ? setOpenIdx(openIdx === idx ? null : idx) : null}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style={{
                background: `${b.color}22`,
                border: `2px solid ${b.color}`,
                boxShadow: `0 2px 6px ${b.glow}`,
                opacity: hidden ? 0.4 : 1,
              }}
            >
              {b.icon}
            </button>
            {openIdx === idx && onToggleHidden && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenIdx(null)} aria-hidden="true" />
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg py-1 min-w-[140px] border border-gray-100"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => toggleHidden(idx)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-purple-50"
                  >
                    {hidden ? '👁 Unhide' : '🙈 Hide'}
                  </button>
                </div>
              </>
            )}
          </div>
        )
      })}
      {currentBadge && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg animate-badge-pulse"
          style={{
            background: `${currentBadge.color}22`,
            border: `2.5px dashed ${currentBadge.color}`,
            boxShadow: `0 2px 10px ${currentBadge.glow}`,
          }}
          aria-label={`This week's badge so far: ${currentBadge.label}`}
        >
          {currentBadge.icon}
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-[11px] font-bold text-gray-400 hover:text-purple-500 px-1 focus:outline-none focus-visible:underline"
          aria-label={showAll ? 'Hide archived badges' : `Show ${hiddenCount} hidden badges`}
        >
          {showAll ? 'Hide archived' : `+${hiddenCount} hidden`}
        </button>
      )}
      {!currentBadge && badges.length === 0 && (
        <span className="text-xs font-semibold text-gray-300">
          Earn 15+ stars for a badge!
        </span>
      )}
    </div>
  )
}

export default BadgeShelf
