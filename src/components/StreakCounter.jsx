import { getCurrentWeek } from '../lib/week'
import { THEMES } from '../lib/themes'

function calculateStreak(kid, days) {
  const checks = kid.checks || {}
  const activities = kid.activities || []
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]
    if (day.date > new Date()) continue
    const allDone = activities.length > 0 && activities.every((a) => checks[`${a.id}-${day.key}`])
    if (allDone) streak++
    else break
  }
  return streak
}

export default function StreakCounter({ kid }) {
  const { days } = getCurrentWeek()
  const streak = calculateStreak(kid, days)
  const theme = THEMES[kid.theme] || THEMES.football
  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3 h-full bg-white shadow-card"
      style={{
        border: `1px solid ${theme.accent}33`,
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${theme.accent}33` }}
      >
        {streak > 0 ? <span className="flame-flicker">🔥</span> : '💤'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black font-display text-gray-700">
          {streak > 0 ? `${streak}-day streak!` : 'No streak yet'}
        </div>
        <div className="text-[11px] font-bold mt-0.5" style={{ color: theme.deeper, opacity: 0.85 }}>
          Complete all tasks in a day
        </div>
      </div>
    </div>
  )
}
