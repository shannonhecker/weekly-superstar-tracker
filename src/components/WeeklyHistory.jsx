import { getBadge } from '../utils/helpers'
import { MAX_TOTAL } from '../utils/constants'

const WeeklyHistory = ({ history, theme }) => {
  if (history.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-3.5 border-2 border-black/[0.04]">
      <div className="text-[13px] font-extrabold text-gray-400 mb-2.5">📊 Past Weeks</div>
      <div className="flex items-end gap-1.5" style={{ height: 90, paddingBottom: 22 }}>
        {history.slice(-8).map((h, i) => {
          const pct = h.score / MAX_TOTAL
          const badge = getBadge(h.score, theme)
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              {badge && <span className="text-xs">{badge.icon}</span>}
              <span className="text-[10px] font-bold text-gray-400">{h.score}</span>
              <div
                className="w-full max-w-[36px] rounded-md"
                style={{
                  height: `${Math.max(pct * 55, 4)}px`,
                  background: badge
                    ? `linear-gradient(180deg, ${badge.color}, ${badge.color}88)`
                    : `linear-gradient(180deg, ${theme.accentLight}, #EEE)`,
                }}
              />
              <span className="text-[9px] font-bold text-gray-300">W{i + 1}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyHistory
