import { useState } from 'react'
import { getBadge } from '../utils/helpers'
import WeekDetailModal from './WeekDetailModal'

const WeeklyHistory = ({ history, theme }) => {
  const [selected, setSelected] = useState(null)
  if (history.length === 0) return null

  const recent = history.slice(-8)

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{ background: `${theme.accentLight}30`, border: `2px solid ${theme.accentLight}` }}
    >
      <div className="text-[13px] font-extrabold mb-2.5" style={{ color: theme.accent }}>
        📊 Past Weeks
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 90, paddingBottom: 22 }}>
        {recent.map((h, i) => {
          const pct = h.score / 56
          const badge = getBadge(h.score, theme)
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(h)}
              aria-label={`Open ${h.score}-star week for details`}
              className="flex flex-col items-center gap-1 flex-1 p-0 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
            >
              {badge && <span className="text-xs">{badge.icon}</span>}
              <span className="text-[10px] font-bold text-gray-500">{h.score}</span>
              <div
                className="w-full max-w-[36px] rounded-md transition-transform hover:scale-105"
                style={{
                  height: `${Math.max(pct * 55, 4)}px`,
                  background: badge
                    ? `linear-gradient(180deg, ${badge.color}, ${badge.color}88)`
                    : `linear-gradient(180deg, ${theme.accentLight}, #EEE)`,
                }}
              />
              <span className="text-[9px] font-bold text-gray-400">W{i + 1}</span>
            </button>
          )
        })}
      </div>
      <WeekDetailModal
        entry={selected}
        theme={theme}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

export default WeeklyHistory
