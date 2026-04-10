import { DAYS, DEFAULT_ACTIVITIES } from '../utils/constants'

const StreakCounter = ({ checks, theme }) => {
  let streak = 0
  for (let di = 0; di < DAYS.length; di++) {
    if (DEFAULT_ACTIVITIES.every((a) => checks[`${a.id}-${DAYS[di]}`])) streak++
    else break
  }

  const icons =
    streak >= 7 ? theme.streakIcon.repeat(3) :
    streak >= 4 ? theme.streakIcon.repeat(2) :
    streak >= 1 ? theme.streakIcon : '💤'

  return (
    <div
      className="flex items-center gap-2 rounded-2xl p-3.5"
      style={{
        background: streak > 0
          ? `linear-gradient(135deg, ${theme.accentLight}44, ${theme.accentLight})`
          : '#F5F5F5',
        border: streak >= 4 ? `2px solid ${theme.accent}` : '2px solid rgba(0,0,0,0.04)',
      }}
    >
      <span className={`text-[26px] ${streak >= 4 ? 'animate-flame-pulse' : ''}`}>
        {icons}
      </span>
      <div>
        <div
          className="text-sm font-extrabold"
          style={{ color: streak > 0 ? theme.accentDark : '#BBB' }}
        >
          {streak > 0 ? `${streak}-day streak!` : 'No streak yet'}
        </div>
        <div className="text-[11px] font-semibold text-gray-400">
          {streak >= 7 ? 'PERFECT WEEK!' : streak > 0 ? 'Keep it going!' : 'Complete all tasks in a day'}
        </div>
      </div>
    </div>
  )
}

export default StreakCounter
