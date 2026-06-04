import { useEffect } from 'react'
import Modal from './Modal'
import { THEMES, PET_CHAINS, animatedFluentUrl } from '../lib/themes'
import { BADGE_TIERS } from './BadgeShelf'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/achievements'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import { RARE_STICKERS } from '../lib/stickers'
import { useI18n } from '../lib/i18n'

// Mirror of week.js day labels — the archive's checks map is keyed by label ("Mon"…"Sun").
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Best streak during the archived week: longest consecutive run of "all activities done" days.
function bestStreak(archive, activities) {
  const checks = archive?.checks || {}
  if (!activities?.length) return 0
  let best = 0
  let run = 0
  for (const label of DAY_LABELS) {
    const allDone = activities.every((a) => checks[`${a.id}-${label}`])
    if (allDone) {
      run++
      if (run > best) best = run
    } else {
      run = 0
    }
  }
  return best
}

function countRareStickers(archive) {
  const stickers = archive?.stickers || {}
  let count = 0
  for (const emoji of Object.values(stickers)) {
    if (RARE_STICKERS.includes(emoji)) count++
  }
  return count
}

// Total activities checked across the week (not counting bonus stars).
function totalChecks(archive) {
  const checks = archive?.checks || {}
  return Object.values(checks).filter(Boolean).length
}

// Per-activity check count across the 7 day labels.
function perActivityCounts(archive, activities, activityLabel) {
  const checks = archive?.checks || {}
  const out = []
  for (const a of activities || []) {
    const count = DAY_LABELS.reduce((s, label) => s + (checks[`${a.id}-${label}`] ? 1 : 0), 0)
    out.push({ id: a.id, label: activityLabel ? activityLabel(a) : a.label, emoji: a.emoji, count })
  }
  return out
}

// Count of perfect days (all activities checked).
function perfectDayCount(archive, activities) {
  const checks = archive?.checks || {}
  if (!activities?.length) return 0
  return DAY_LABELS.filter((label) => activities.every((a) => checks[`${a.id}-${label}`])).length
}

// Build "what went well" highlights in priority order: perfect days, 7/7 activities,
// best single activity. Returns [] if nothing notable (kid can still see the stats).
function highlights(archive, activities, t, activityLabel) {
  const counts = perActivityCounts(archive, activities, activityLabel)
  const perfect = perfectDayCount(archive, activities)
  const sevenSeven = counts.filter((c) => c.count >= 7)
  const best = [...counts].sort((a, b) => b.count - a.count)[0]
  const out = []
  if (perfect > 0) {
    out.push({ icon: '✨', text: t('weekly.highlight.perfectDays', { count: perfect }) })
  }
  if (sevenSeven.length > 0) {
    for (const a of sevenSeven.slice(0, 2)) {
      out.push({ icon: a.emoji || '⭐', text: t('weekly.highlight.everyDay', { activity: a.label }) })
    }
  }
  if (out.length < 3 && best && best.count >= 4 && !sevenSeven.find((s) => s.id === best.id)) {
    out.push({ icon: best.emoji || '⭐', text: t('weekly.highlight.greatAt', { activity: best.label, count: best.count }) })
  }
  return out
}

function formatWeekRange(weekKey) {
  if (!weekKey) return ''
  try {
    const d = new Date(weekKey + 'T00:00:00')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const sun = new Date(d)
    sun.setDate(d.getDate() + 6)
    const m1 = months[d.getMonth()]
    const m2 = months[sun.getMonth()]
    if (m1 === m2) return `${m1} ${d.getDate()}–${sun.getDate()}`
    return `${m1} ${d.getDate()} – ${m2} ${sun.getDate()}`
  } catch { return weekKey }
}

function rawSpeciesForEmoji(chainKey, emoji) {
  const chain = PET_CHAINS[chainKey]
  if (!chain || !emoji) return ''
  const idx = chain.stages.indexOf(emoji)
  return idx >= 0 ? chain.names[idx] : ''
}

export default function WeeklySummary({ open, onClose, kid, archive, weekKey, onOpenCollection, replay = false }) {
  const { t, petSpeciesName, petChainLabel, activityLabel } = useI18n()
  const theme = THEMES[kid?.theme] || THEMES.football
  const totalStars = archive?.totalStars || 0
  const petName = archive?.petName
  const chainLabel = petChainLabel(archive?.chainKey, PET_CHAINS[archive?.chainKey]?.label)
  const species = petSpeciesName(rawSpeciesForEmoji(archive?.chainKey, archive?.petEmoji))
  const petUrl = animatedFluentUrl(archive?.petEmoji)
  const activities = kid?.activities || []
  const streak = bestStreak(archive, activities)
  const rareCount = countRareStickers(archive)
  const stickersEarned = totalChecks(archive)
  const totalPossible = activities.length * 7
  const wins = highlights(archive, activities, t, activityLabel)

  // Reuse evaluateAchievements against a pseudo-kid made from the archive's check map.
  // Days for a "last week" evaluation: generic labels only (streak achievements will
  // compare against the same labels used when sticker rows were saved).
  const pseudoDays = DAY_LABELS.map((label) => ({ label, date: new Date(0), key: label }))
  const pseudoKid = {
    ...kid,
    checks: archive?.checks || {},
    activities: kid?.activities || [],
  }
  const earnedIds = evaluateAchievements(pseudoKid, { totalStars, days: pseudoDays })
  const starTiersEarned = BADGE_TIERS.filter((t) => totalStars >= t.stars)
  const badgesTotal = starTiersEarned.length + earnedIds.length

  useEffect(() => {
    if (!open) return
    // On replay (user tapped a past entry), keep the pet-dance but skip the big
    // fireworks — the celebration has already happened once.
    if (!replay) {
      celebrate('fireworks')
      play('hatch')
    }
  }, [open, replay])

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('weekly.title', { name: kid?.name || t('kid.superstar') })}
      emoji="🎉"
      panelClassName="!max-w-[820px] !overflow-hidden"
    >
      <div className="flex h-[calc(100vh-13rem)] max-h-[680px] flex-col sm:h-auto sm:max-h-[calc(100vh-9rem)]">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
          <div className="mb-3 text-center text-xs font-bold text-earthy-cocoaSoft">
            {formatWeekRange(weekKey)}
          </div>

          <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
            <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
              <div
                className="relative mb-3 flex items-center justify-center rounded-2xl py-4"
                style={{ background: `radial-gradient(circle at 50% 60%, ${theme.accent}44 0%, transparent 70%)` }}
              >
                {petUrl ? (
                  <img
                    src={petUrl}
                    alt=""
                    width={132}
                    height={132}
                    draggable={false}
                    className="pet-dance hatch-reveal drop-shadow-lg"
                  />
                ) : (
                  <div className="text-7xl pet-dance">{archive?.petEmoji || '🥚'}</div>
                )}
              </div>

              <div className="text-center">
                <div className="font-black font-display text-lg text-earthy-cocoa">
                  {petName || species || chainLabel}
                </div>
                <div className="text-xs font-bold text-earthy-cocoaSoft">
                  {totalStars >= 60 ? t('pet.fullyGrown') : t('board.starsCount', { count: totalStars })}
                </div>
              </div>
            </section>

            <section>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Stat icon="⭐" label={t('weekly.totalStars')} value={totalStars} />
                <Stat icon="✅" label={t('weekly.stickers')} value={totalPossible > 0 ? `${stickersEarned}/${totalPossible}` : stickersEarned} />
                <Stat icon="🔥" label={t('weekly.bestStreak')} value={streak > 0 ? t('weekly.dayCount', { count: streak }) : '—'} />
                <Stat icon="🏅" label={t('weekly.badges')} value={badgesTotal} />
                {rareCount > 0 && <Stat icon="🎁" label={t('weekly.rareStickers')} value={rareCount} />}
              </div>

              {wins.length > 0 && (
                <div className="rounded-2xl p-3 border border-earthy-divider"
                  style={{ background: `${theme.accent}10` }}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wide text-earthy-cocoaSoft mb-1.5">
                    ✨ {t('weekly.whatWentWell')}
                  </div>
                  <ul className="space-y-1">
                    {wins.map((w, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-bold text-earthy-cocoa">
                        <span className="text-base" aria-hidden>{w.icon}</span>
                        <span>{w.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
          {onOpenCollection ? (
            <button
              onClick={() => { onClose?.(); onOpenCollection?.() }}
              className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-colors hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
            >
              {t('weekly.openCollection')}
            </button>
          ) : <span className="hidden sm:block" aria-hidden="true" />}
          <button
            onClick={onClose}
            style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
            className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold shadow-earthy-soft transition-all hover:bg-earthy-cocoaDark active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta sm:w-auto sm:min-w-36"
          >
            {t('pet.evolution.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className="bg-earthy-ivory rounded-xl border border-earthy-divider p-2.5 flex items-center gap-2 shadow-earthy-soft">
      <div className="text-lg shrink-0" aria-hidden>{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-earthy-cocoaSoft">{label}</div>
        <div className="text-sm font-black font-display text-earthy-cocoa truncate">{value}</div>
      </div>
    </div>
  )
}
