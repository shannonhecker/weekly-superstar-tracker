import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { colors } from '@weekly-superstar/shared/tokens'
import { db } from '../lib/firebase'
import { getCurrentWeek } from '../lib/week'
import { THEMES } from '../lib/themes'
import { RARE_STICKERS } from '../lib/stickers'
import { useToast } from '../contexts/ToastContext'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import MysteryBox from './MysteryBox'
import { useI18n } from '../lib/i18n'

// Small curated celebration pool — used for ~half of regular rewards to feel varied.
// Everything else draws from the ACTIVITY's own emoji (a.emoji), so checking "Sleep"
// never rewards you with an ice cream cone. Rare stickers stay separate and drop
// only via mystery boxes.
const CELEBRATION_STICKERS = ['⭐', '🌟', '✨', '💫', '🎉', '👏', '💪', '🏆']

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
  const { t, formatDate, activityLabel } = useI18n()
  // Call fresh on every render — `getCurrentWeek()` is cheap date math, and the
  // previous `useMemo(..., [])` froze `days` at first render so post-midnight
  // writes could land under a different `dayKey` than StreakCounter reads.
  // Both READ (StreakCounter) and WRITE (this file) now share the same fresh keys.
  const { days } = getCurrentWeek()
  const checks = kid.checks || {}
  const stickers = kid.stickers || {}
  const activities = kid.activities || []
  const today = new Date()
  const todayIndex = days.findIndex((d) => d.date.toDateString() === today.toDateString())
  const safeTodayIndex = todayIndex >= 0 ? todayIndex : 0
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
          prize = { emoji: updates[`stickers.${key}`], label: t('board.rareSticker') }
        } else {
          const today = new Date()
          const bkey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          updates[`bonusStars.${bkey}`] = ((kid.bonusStars || {})[bkey] || 0) + 3
          prize = { emoji: '⭐⭐⭐', label: t('board.bonusStars') }
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
        const dayIndex = days.findIndex((d) => d.key === dayKey)
        const isoDay = dayIndex >= 0 ? dayIndex + 1 : 1
        const scheduledForDay = activities.filter((a) => isDayScheduled(a.daysOfWeek, isoDay))
        const allDone =
          scheduledForDay.length > 0 &&
          scheduledForDay.every((a) => nextChecks[`${a.id}-${dayKey}`])
        if (allDone) {
          setTimeout(() => { celebrate('day'); play('cheer') }, 250)
        }
      }
    } catch (e) {
      toast.error(t('board.saveError'))
    }
  }

  return (
    <>
    <MysteryBox open={mysteryOpen} onClose={() => setMysteryOpen(false)} prize={mysteryPrize} />
    <div
      className="rounded-3xl shadow-earthy-card overflow-x-auto font-jakarta p-3 sm:p-4 bg-earthy-card"
      style={{ border: '1px solid #F0E1C8' }}
    >
      <div className="mb-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-earthy-cocoa leading-tight">
            {t('board.thisWeek')}
          </h3>
          <p className="text-sm font-bold text-earthy-cocoaSoft">
            {t('board.tapCircle')}
          </p>
        </div>
        <div className="text-xs font-extrabold text-earthy-cocoaSoft">
          {days[safeTodayIndex]
            ? t('board.todayIs', {
                day: formatDate(days[safeTodayIndex].date, { weekday: 'short' }),
                date: formatDate(days[safeTodayIndex].date, { month: 'short', day: 'numeric' }),
              })
            : ''}
        </div>
      </div>

      <table className="w-full min-w-[760px] text-center text-xs">
            <thead>
              <tr className="text-earthy-cocoaSoft">
                <th className="text-left pl-4 py-3 font-bold sticky left-0 z-10 uppercase tracking-wide rounded-l-2xl bg-[#FFF4DF]">{t('activity.generic')}</th>
                {days.map((d, dayIndex) => {
                  const isToday = dayIndex === safeTodayIndex
                  const isWeekend = dayIndex >= 5
                  const dayLabel = formatDate(d.date, { weekday: 'short' })
                  return (
                    <th
                      key={d.key}
                      className="px-1 py-3 font-bold relative bg-[#FFF4DF]"
                      style={isWeekend ? { background: weekendTint } : undefined}
                    >
                      <div className={isToday ? 'text-earthy-terracotta' : 'text-earthy-cocoa'}>{dayLabel}</div>
                      <div className={`text-[11px] font-bold ${isToday ? 'text-earthy-terracotta' : 'text-earthy-cocoaSoft'}`}>
                        {formatDate(d.date, { month: 'short', day: 'numeric' })}
                      </div>
                      {isToday && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-earthy-terracotta rounded-full" />}
                    </th>
                  )
                })}
                <th className="pr-3 py-3 text-earthy-cocoa font-bold uppercase tracking-wide rounded-r-2xl bg-[#FFF4DF]">{t('board.total')}</th>
              </tr>
            </thead>
            <tbody className="[&_tr:first-child_td]:pt-3">
              {activities.map((a, idx) => {
                const color = a.color || theme.accent
                const scheduledDays = days.filter((_, dayIndex) => isDayScheduled(a.daysOfWeek, dayIndex + 1))
                const rowTotal = scheduledDays.filter((d) => checks[`${a.id}-${d.key}`]).length
                const rowBg = idx % 2 === 0 ? 'bg-earthy-card' : 'bg-earthy-ivory'
                const label = activityLabel(a)
                return (
                  <tr key={a.id} className={rowBg}>
                    <td
                      className={`text-left pl-4 py-3 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-earthy-card' : 'bg-earthy-ivory'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: `${color}33` }}
                        >
                          {a.emoji || '⭐'}
                        </span>
                        <span className="font-extrabold text-earthy-cocoa text-sm truncate max-w-[170px]">{label}</span>
                      </div>
                    </td>
                    {days.map((d, dayIndex) => {
                      const checked = !!checks[`${a.id}-${d.key}`]
                      const scheduled = isDayScheduled(a.daysOfWeek, dayIndex + 1)
                      const isWeekend = dayIndex >= 5
                      const dayLabel = formatDate(d.date, { weekday: 'short' })
                      return (
                        <td
                          key={d.key}
                          className="p-1"
                          style={isWeekend ? { background: weekendTint } : undefined}
                        >
                          <button
                            type="button"
                            onClick={() => scheduled && toggle(a.id, d.key)}
                            disabled={!scheduled}
                            aria-label={[
                              t(checked ? 'board.uncheckActivity' : 'board.checkActivity', { activity: label, day: dayLabel }),
                              !scheduled ? `(${t('board.notScheduled')})` : checked ? `(${t('board.currentlyCompleted')})` : '',
                            ].filter(Boolean).join(' ')}
                            aria-pressed={checked}
                            className="activity-check-cell w-12 h-12 rounded-full flex items-center justify-center text-lg transition-transform active:scale-90 mx-auto disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta"
                            style={{
                              background: checked ? `${color}33` : colors.earthy.card,
                              border: checked ? `2px solid ${color}` : `2px solid ${colors.earthy.divider}`,
                            }}
                          >
                            {checked
                              ? <span key={stickers[`${a.id}-${d.key}`] || ''} className="pop-in inline-block">{stickers[`${a.id}-${d.key}`] || fallbackStickerFor(a)}</span>
                              : <span className="text-earthy-cocoaSoft/40 text-base">{scheduled ? '○' : '•'}</span>}
                          </button>
                        </td>
                      )
                    })}
                    <td className="pr-3 font-bold text-earthy-cocoaSoft text-xs">{rowTotal}/{scheduledDays.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
    </div>
    </>
  )
}

function isDayScheduled(daysOfWeek, isoIndex) {
  return !daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.includes(isoIndex)
}
