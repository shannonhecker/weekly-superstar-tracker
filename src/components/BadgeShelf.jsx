import { useEffect, useRef, useState } from 'react'
import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../lib/themes'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/achievements'
import { getCurrentWeek } from '../lib/week'
import Modal from './Modal'

export const BADGE_TIERS = [
  { stars: 15, emoji: '🥉', label: 'Bronze', description: 'Earn 15 stars this week' },
  { stars: 30, emoji: '🥈', label: 'Silver', description: 'Earn 30 stars this week' },
  { stars: 45, emoji: '🥇', label: 'Gold', description: 'Earn 45 stars this week' },
  { stars: 60, emoji: '🏆', label: 'Trophy', description: 'Earn 60 stars — almost a perfect week!' },
]

export default function BadgeShelf({ totalStars, themeKey, kid }) {
  const theme = THEMES[themeKey] || THEMES.football
  const { days } = getCurrentWeek()
  const earnedIds = evaluateAchievements(kid || {}, { totalStars, days })

  const prevStarBadgeCount = useRef(BADGE_TIERS.filter((t) => totalStars >= t.stars).length)
  const prevAchievementIds = useRef(new Set(earnedIds))
  const [flashIdx, setFlashIdx] = useState(-1)
  const [flashAchievement, setFlashAchievement] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    const earnedNow = BADGE_TIERS.filter((t) => totalStars >= t.stars).length
    if (earnedNow > prevStarBadgeCount.current) {
      setFlashIdx(earnedNow - 1)
      celebrate('badge', { origin: { x: 0.5, y: 0.7 } })
      play('badge')
      setTimeout(() => setFlashIdx(-1), 1300)
    }
    prevStarBadgeCount.current = earnedNow
  }, [totalStars])

  useEffect(() => {
    const prev = prevAchievementIds.current
    const newId = earnedIds.find((id) => !prev.has(id))
    if (newId) {
      setFlashAchievement(newId)
      celebrate('badge', { origin: { x: 0.5, y: 0.75 } })
      play('badge')
      setTimeout(() => setFlashAchievement(null), 1300)
    }
    prevAchievementIds.current = new Set(earnedIds)
  }, [earnedIds.join(',')])

  const anyStarBadge = totalStars >= 15
  const anyAchievement = earnedIds.length > 0
  const earnedStarCount = BADGE_TIERS.filter((t) => totalStars >= t.stars).length

  const openDetails = () => setDetailsOpen(true)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails() } }}
        className="rounded-2xl p-3 h-full text-left active:scale-[0.98] transition-transform cursor-pointer shadow-earthy-card font-jakarta"
        style={{ backgroundColor: colors.earthy.card, border: `1px solid ${theme.accent}55` }}
      >
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="text-xs font-bold truncate" style={{ color: theme.deeper }}>
            🏅 Badge Shelf
          </div>
          <div className="text-[10px] font-bold shrink-0" style={{ color: theme.deeper, opacity: 0.6 }}>
            {earnedStarCount + earnedIds.length}/{BADGE_TIERS.length + ACHIEVEMENTS.length}<span className="hidden sm:inline"> · tap ›</span>
          </div>
        </div>

        {!anyStarBadge && !anyAchievement ? (
          <div className="text-[12px] font-bold" style={{ color: theme.deeper, opacity: 0.7 }}>
            Earn 15+ stars for a badge!
          </div>
        ) : (
          <>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {BADGE_TIERS.map((tier, idx) => {
                const earned = totalStars >= tier.stars
                return (
                  <div
                    key={tier.stars}
                    title={`${tier.stars} stars`}
                    className={`text-2xl transition-all ${flashIdx === idx ? 'badge-flash' : ''}`}
                    style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}
                  >
                    {tier.emoji}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {ACHIEVEMENTS.map((a) => {
                const earned = earnedIds.includes(a.id)
                return (
                  <div
                    key={a.id}
                    title={a.label}
                    className={`text-lg transition-all ${flashAchievement === a.id ? 'badge-flash' : ''}`}
                    style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}
                  >
                    {a.emoji}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} emoji="🏅" title={`${kid?.name || ''}'s Badges`}>
        <div className="max-h-[65vh] overflow-y-auto">
          {/* Star tier badges */}
          <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">⭐ Star Badges</div>
          {BADGE_TIERS.map((tier) => {
            const earned = totalStars >= tier.stars
            const remaining = Math.max(0, tier.stars - totalStars)
            const pct = Math.min(100, Math.round((totalStars / tier.stars) * 100))
            return (
              <div key={tier.stars} className="flex items-center gap-3 p-2 rounded-xl mb-1">
                <div
                  className="text-3xl shrink-0"
                  style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}
                >
                  {tier.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-earthy-cocoa">{tier.label}</div>
                  <div className="text-[11px] text-earthy-cocoaSoft font-bold truncate">
                    {tier.description}
                  </div>
                  {!earned && (
                    <div className="mt-1">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E0D5' }}>
                        <div className="h-full transition-all duration-500" style={{ width: pct + '%', background: theme.deeper }} />
                      </div>
                      <div className="text-[11px] text-earthy-cocoaSoft font-bold mt-0.5">{remaining} more to go</div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-[10px] font-bold" style={{ color: earned ? theme.deeper : '#BBB' }}>
                  {earned ? '✓ Earned' : `${totalStars}/${tier.stars}`}
                </div>
              </div>
            )
          })}

          {/* Achievement badges */}
          <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mt-4 mb-2">🎯 Achievements</div>
          {ACHIEVEMENTS.map((a) => {
            const earned = earnedIds.includes(a.id)
            return (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl mb-1">
                <div
                  className="text-3xl shrink-0"
                  style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}
                >
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-earthy-cocoa">{a.label}</div>
                  <div className="text-[11px] text-earthy-cocoaSoft font-bold">{a.description}</div>
                </div>
                <div className="shrink-0 text-[10px] font-bold" style={{ color: earned ? theme.deeper : '#BBB' }}>
                  {earned ? '✓ Earned' : 'Locked'}
                </div>
              </div>
            )
          })}
        </div>
        <button
          onClick={() => setDetailsOpen(false)}
          className="w-full mt-4 py-2 rounded-pill text-earthy-cocoaSoft font-bold text-sm hover:text-earthy-cocoa"
        >
          Close
        </button>
      </Modal>
    </>
  )
}
