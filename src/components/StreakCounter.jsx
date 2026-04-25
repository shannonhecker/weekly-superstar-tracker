import { useEffect, useMemo, useRef, useState } from 'react'
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
  const days = useMemo(() => getCurrentWeek().days, [])
  const streak = useMemo(
    () => calculateStreak(kid, days),
    [kid.checks, kid.activities, days],
  )
  const theme = THEMES[kid.theme] || THEMES.football

  // Re-mount the streak text via key when the number changes so it pulses
  // in — gives parents visible confirmation when the 7th tick lands.
  const prevStreakRef = useRef(streak)
  const [pulseKey, setPulseKey] = useState(0)
  useEffect(() => {
    if (prevStreakRef.current !== streak) {
      prevStreakRef.current = streak
      setPulseKey((k) => k + 1)
    }
  }, [streak])

  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3 h-full shadow-earthy-card font-jakarta"
      style={{ backgroundColor: '#FFFDF7', border: `1px solid ${theme.accent}55` }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${theme.accent}38`, border: `1px solid ${theme.accent}55` }}
      >
        {streak > 0 ? <span className="flame-flicker" key={`emoji-${pulseKey}`}>🔥</span> : <span key={`emoji-${pulseKey}`}>💤</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-extrabold text-earthy-cocoa" key={`label-${pulseKey}`}>
          {streak > 0 ? `${streak}-day streak!` : 'No streak yet'}
        </div>
        <div className="text-[11px] font-bold mt-0.5" style={{ color: theme.deeper }}>
          Complete all tasks in a day
        </div>
      </div>
    </div>
  )
}
