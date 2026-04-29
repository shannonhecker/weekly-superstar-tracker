import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getCurrentWeek } from '../lib/week'
import { THEMES } from '../lib/themes'
import { useToast } from '../contexts/ToastContext'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import MysteryBox from './MysteryBox'

// Small curated celebration pool — used for ~half of regular rewards to feel varied.
// Everything else draws from the ACTIVITY's own emoji (a.emoji), so checking "Sleep"
// never rewards you with an ice cream cone. Rare stickers stay separate and drop
// only via mystery boxes.
const CELEBRATION_STICKERS = ['⭐', '🌟', '✨', '💫', '🎉', '👏', '💪', '🏆']

const RARE_STICKERS = ['🌈', '🦄', '🧚', '🪄', '🎆', '💎', '🎇', '🌠']

function stickerFor(activity) {
  // 50% the activity's own emoji (contextual), 50% a celebration emoji (varied).
  if (Math.random() < 0.5 && activity?.emoji) return activity.emoji
  return CELEBRATION_STICKERS[Math.floor(Math.random() * CELEBRATION_STICKERS.length)]
}

const randomRare = () => RARE_STICKERS[Math.floor(Math.random() * RARE_STICKERS.length)]

function fallbackStickerFor(activity) {
  return activity?.emoji || '⭐'
}

export default function ActivityGrid({ kid, boardId }) {
  // Call fresh on every render — `getCurrentWeek()` is cheap date math, and the
  // previous `useMemo(..., [])` froze `days` at first render so post-midnight
  // writes could land under a different `dayKey` than StreakCounter reads.
  // Both READ (StreakCounter) and WRITE (this file) now share the same fresh keys.
  const { days } = getCurrentWeek()
  const checks = kid.checks || {}
  const stickers = kid.stickers || {}
  const activities = kid.activities || []
  const today = new Date()
  const toast = useToast()
  const theme = THEMES[kid.theme] || THEMES.football
  // Slightly stronger tint than previous (1A → 33) — earthy accents are
  // softer than the legacy saturated palette, so we need more alpha to read.
  const weekendTint = `${theme.accent}33`
  const [mysteryOpen, setMysteryOpen] = useState(false)
  const [mysteryPrize, setMysteryPrize] = useState(null)

  const toggle = async (activityId, dayKey) => {
    const key = `${activityId}-${dayKey}`
    const next = !checks[key]
    // 5% mystery box roll only on check-on (not uncheck)
    const mystery = next && Math.random() < 0.05
    const useRare = mystery && Math.random() < 0.6
    const activity = activities.find((a) => a.id === activityId)

    const updates = { [`checks.${key}`]: next }
    let prize = null
    if (next) {
      updates[`stickers.${key}`] = useRare ? randomRare() : stickerFor(activity)
      if (mystery) {
        if (useRare) {
          prize = { emoji: updates[`stickers.${key}`], label: 'Rare sticker!' }
        } else {
          const today = new Date()
          const bkey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          updates[`bonusStars.${bkey}`] = ((kid.bonusStars || {})[bkey] || 0) + 3
          prize = { emoji: '⭐⭐⭐', label: '+3 bonus stars!' }
        }
      }
    }

    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), updates)
      if (next) {
        play('sticker')
        if (mystery && prize) {
          setMysteryPrize(prize)
          setMysteryOpen(true)
        }
        // Daily clean-sweep: use the POST-toggle checks so uncheck/re-check
        // edges don't false-fire via the stale closure.
        const nextChecks = { ...checks, [key]: next }
        const allDone =
          activities.length > 0 &&
          activities.every((a) => nextChecks[`${a.id}-${dayKey}`])
        if (allDone) {
          setTimeout(() => { celebrate('day'); play('cheer') }, 250)
        }
      }
    } catch (e) {
      toast.error('Could not save — try again')
    }
  }

  return (
    <>
    <MysteryBox open={mysteryOpen} onClose={() => setMysteryOpen(false)} prize={mysteryPrize} />
    <div
      className="rounded-2xl shadow-earthy-card overflow-x-auto font-jakarta p-2 sm:p-3"
      style={{ backgroundColor: '#FFFDF7', border: '1px solid #F0E1C8' }}
    >
      <table className="w-full text-center text-xs">
        <thead>
          <tr className="text-earthy-cocoaSoft">
            <th className="text-left pl-3 py-3 font-bold sticky left-0 z-10 uppercase tracking-wide rounded-l-2xl bg-[#FFF4DF]">Activity</th>
            {days.map((d) => {
              const isToday =
                d.date.toDateString() === today.toDateString()
              const isWeekend = d.label === 'Sat' || d.label === 'Sun'
              return (
                <th
                  key={d.key}
                  className="px-1 py-3 font-bold relative bg-[#FFF4DF]"
                  style={isWeekend ? { background: weekendTint } : undefined}
                >
                  <div className={isToday ? 'text-earthy-terracotta' : 'text-earthy-cocoa'}>{d.label}</div>
                  <div className={`text-[11px] font-bold ${isToday ? 'text-earthy-terracotta' : 'text-earthy-cocoaSoft'}`}>
                    {monthShort(d.date)} {d.date.getDate()}
                  </div>
                  {isToday && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-earthy-terracotta rounded-full" />}
                </th>
              )
            })}
            <th className="pr-3 py-3 text-earthy-cocoa font-bold uppercase tracking-wide rounded-r-2xl bg-[#FFF4DF]">Total</th>
          </tr>
        </thead>
        <tbody className="[&_tr:first-child_td]:pt-3">
          {activities.map((a, idx) => {
            const rowTotal = days.filter((d) => checks[`${a.id}-${d.key}`]).length
            const rowBg = idx % 2 === 0 ? 'bg-earthy-card' : 'bg-earthy-ivory'
            return (
              <tr key={a.id} className={rowBg}>
                <td
                  className={`text-left pl-3 py-2 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-earthy-card' : 'bg-earthy-ivory'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: `${a.color || '#A8E6C1'}33` }}
                    >
                      {a.emoji}
                    </span>
                    <span className="font-bold text-earthy-cocoa text-xs">{a.label}</span>
                  </div>
                </td>
                {days.map((d) => {
                  const checked = !!checks[`${a.id}-${d.key}`]
                  const isWeekend = d.label === 'Sat' || d.label === 'Sun'
                  return (
                    <td
                      key={d.key}
                      className="p-1"
                      style={isWeekend ? { background: weekendTint } : undefined}
                    >
                      <button
                        onClick={() => toggle(a.id, d.key)}
                        aria-label={`${checked ? 'Uncheck' : 'Check'} ${a.label} for ${d.label}${checked ? ' (currently completed)' : ''}`}
                        aria-pressed={checked}
                        className="activity-check-cell w-11 h-11 rounded-full flex items-center justify-center text-lg transition-transform active:scale-90 mx-auto"
                        style={{
                          background: checked ? `${a.color}33` : '#FFFDF7',
                          border: checked ? `2px solid ${a.color}` : '2px solid #E8DCC4',
                        }}
                      >
                        {checked
                          ? <span key={stickers[`${a.id}-${d.key}`] || ''} className="pop-in inline-block">{stickers[`${a.id}-${d.key}`] || fallbackStickerFor(a)}</span>
                          : <span className="text-earthy-cocoaSoft/40 text-base">○</span>}
                      </button>
                    </td>
                  )
                })}
                <td className="pr-3 font-bold text-earthy-cocoaSoft text-xs">{rowTotal}/7</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    </>
  )
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function monthShort(d) { return MONTHS[d.getMonth()] }
