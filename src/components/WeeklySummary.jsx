import { useEffect } from 'react'
import Modal from './Modal'
import { THEMES, PET_ASSET, PET_CHAINS } from '../lib/themes'
import { BADGE_TIERS } from './BadgeShelf'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/achievements'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'

const RARE_STICKERS = new Set(['🌈', '🦄', '🧚', '🪄', '🎆', '💎', '🎇', '🌠'])

// Mirror of week.js day labels — the archive's checks map is keyed by label ("Mon"…"Sun").
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function animatedFluentUrl(emoji) {
  const asset = PET_ASSET[emoji]
  if (!asset) return null
  return `https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/${encodeURIComponent(asset[0])}/${encodeURIComponent(asset[1])}.png`
}

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
    if (RARE_STICKERS.has(emoji)) count++
  }
  return count
}

// Total activities checked across the week (not counting bonus stars).
function totalChecks(archive) {
  const checks = archive?.checks || {}
  return Object.values(checks).filter(Boolean).length
}

// Per-activity check count across the 7 day labels.
function perActivityCounts(archive, activities) {
  const checks = archive?.checks || {}
  const out = []
  for (const a of activities || []) {
    const count = DAY_LABELS.reduce((s, label) => s + (checks[`${a.id}-${label}`] ? 1 : 0), 0)
    out.push({ id: a.id, label: a.label, emoji: a.emoji, count })
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
function highlights(archive, activities) {
  const counts = perActivityCounts(archive, activities)
  const perfect = perfectDayCount(archive, activities)
  const sevenSeven = counts.filter((c) => c.count >= 7)
  const best = [...counts].sort((a, b) => b.count - a.count)[0]
  const out = []
  if (perfect > 0) {
    out.push({ icon: '✨', text: `${perfect} perfect day${perfect > 1 ? 's' : ''}` })
  }
  if (sevenSeven.length > 0) {
    for (const a of sevenSeven.slice(0, 2)) {
      out.push({ icon: a.emoji || '⭐', text: `${a.label} every day (7/7)` })
    }
  }
  if (out.length < 3 && best && best.count >= 4 && !sevenSeven.find((s) => s.id === best.id)) {
    out.push({ icon: best.emoji || '⭐', text: `Great at ${best.label} — ${best.count}/7 days` })
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

export default function WeeklySummary({ open, onClose, kid, archive, weekKey, onOpenCollection, replay = false }) {
  const theme = THEMES[kid?.theme] || THEMES.football
  const totalStars = archive?.totalStars || 0
  const petName = archive?.petName
  const chainLabel = PET_CHAINS[archive?.chainKey]?.label || 'Pet'
  const petUrl = animatedFluentUrl(archive?.petEmoji)
  const activities = kid?.activities || []
  const streak = bestStreak(archive, activities)
  const rareCount = countRareStickers(archive)
  const stickersEarned = totalChecks(archive)
  const totalPossible = activities.length * 7
  const wins = highlights(archive, activities)

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
    <Modal open={open} onClose={onClose} title={`${kid?.name || 'Your'}'s week recap`} emoji="🎉">
      <div className="text-center -mt-2 mb-3 text-xs font-bold text-earthy-cocoaSoft">
        {formatWeekRange(weekKey)}
      </div>

      {/* Hero pet */}
      <div className="relative flex items-center justify-center py-4 mb-3 rounded-2xl"
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

      {/* Name line */}
      <div className="text-center mb-4">
        <div className="font-black font-display text-lg text-earthy-cocoa">
          {petName ? `${petName}` : `Your ${chainLabel.toLowerCase().replace(' family', '')}`}
        </div>
        <div className="text-xs font-bold text-earthy-cocoaSoft">
          {totalStars >= 50 ? '🎉 Fully grown!' : `grew to ${totalStars} stars`}
        </div>
      </div>

      {/* Stat rows */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Stat icon="⭐" label="Total stars" value={totalStars} />
        <Stat icon="✅" label="Stickers" value={totalPossible > 0 ? `${stickersEarned}/${totalPossible}` : stickersEarned} />
        <Stat icon="🔥" label="Best streak" value={streak > 0 ? `${streak} day${streak > 1 ? 's' : ''}` : '—'} />
        <Stat icon="🏅" label="Badges" value={badgesTotal} />
        {rareCount > 0 && <Stat icon="🎁" label="Rare stickers" value={rareCount} />}
      </div>

      {/* What went well */}
      {wins.length > 0 && (
        <div className="mb-4 rounded-2xl p-3 border border-earthy-divider"
          style={{ background: `${theme.accent}10` }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wide text-earthy-cocoaSoft mb-1.5">
            ✨ What went well
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

      <button
        onClick={onClose}
        className="w-full py-3 rounded-pill text-earthy-ivory font-bold bg-earthy-cocoa hover:bg-[#4A2E25] shadow-earthy-soft active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-earthy-terracotta"
      >
        Yay!
      </button>
      {onOpenCollection && (
        <button
          onClick={() => { onClose?.(); onOpenCollection?.() }}
          className="w-full mt-2 py-2 rounded-pill text-earthy-cocoaSoft font-bold text-sm hover:text-earthy-cocoa transition-colors"
        >
          See full collection →
        </button>
      )}
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
