import { useMemo, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getCurrentWeek } from '../lib/week'
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
  const { days } = useMemo(() => getCurrentWeek(), [])
  const checks = kid.checks || {}
  const stickers = kid.stickers || {}
  const activities = kid.activities || []
  const today = new Date()
  const toast = useToast()
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
        // Daily clean-sweep: every activity checked for this day now.
        const allDone = activities.every((a) => a.id === activityId || checks[`${a.id}-${dayKey}`])
        if (allDone && activities.length > 0) {
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
    <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full text-center text-xs">
        <thead className="bg-gray-50">
          <tr className="text-gray-500">
            <th className="text-left pl-3 py-2 font-bold sticky left-0 bg-gray-50 z-10">Activity</th>
            {days.map((d) => {
              const isToday =
                d.date.toDateString() === today.toDateString()
              return (
                <th key={d.key} className="px-1 py-2 font-bold relative">
                  <div className={isToday ? 'text-emerald-600' : ''}>{d.label}</div>
                  <div className={`text-[9px] font-bold ${isToday ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {monthShort(d.date)} {d.date.getDate()}
                  </div>
                  {isToday && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />}
                </th>
              )
            })}
            <th className="pr-3 py-2 text-gray-700 font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a, idx) => {
            const rowTotal = days.filter((d) => checks[`${a.id}-${d.key}`]).length
            return (
              <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td
                  className={`text-left pl-3 py-2 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{a.emoji}</span>
                    <span className="font-bold text-gray-700 text-xs">{a.label}</span>
                  </div>
                </td>
                {days.map((d) => {
                  const checked = !!checks[`${a.id}-${d.key}`]
                  return (
                    <td key={d.key} className="p-1">
                      <button
                        onClick={() => toggle(a.id, d.key)}
                        aria-label={checked ? 'Uncheck activity' : 'Check activity'}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-lg transition-transform active:scale-90 mx-auto"
                        style={{
                          background: checked ? `${a.color}22` : 'transparent',
                          border: checked ? `2px solid ${a.color}` : '2px solid #E8E8E8',
                        }}
                      >
                        {checked
                          ? <span key={stickers[`${a.id}-${d.key}`] || ''} className="pop-in inline-block">{stickers[`${a.id}-${d.key}`] || fallbackStickerFor(a)}</span>
                          : <span className="text-gray-300 text-base">○</span>}
                      </button>
                    </td>
                  )
                })}
                <td className="pr-3 font-bold text-gray-500 text-xs">{rowTotal}/7</td>
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
