import { useEffect, useRef, useState } from 'react'
import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../lib/themes'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/achievements'
import { getCurrentWeek } from '../lib/week'
import Modal from './Modal'
import { useI18n } from '../lib/i18n'

export const BADGE_TIERS = [
  { stars: 15, emoji: '🥉', label: 'Bronze', description: 'Earn 15 stars this week' },
  { stars: 30, emoji: '🥈', label: 'Silver', description: 'Earn 30 stars this week' },
  { stars: 45, emoji: '🥇', label: 'Gold', description: 'Earn 45 stars this week' },
  { stars: 60, emoji: '🏆', label: 'Trophy', description: 'Earn 60 stars — almost a perfect week!' },
]

export default function BadgeShelf({ totalStars, themeKey, kid }) {
  const { t } = useI18n()
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
  const badgeLabel = (tier) => t(`badge.${String(tier.label).toLowerCase()}`)
  const badgeDescription = (tier) => t(`badge.desc${tier.stars}`)
  const achievementLabel = (achievement) => t(`achievement.${achievement.id}.label`)
  const achievementDescription = (achievement) => t(`achievement.${achievement.id}.desc`)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails() } }}
        className="rounded-2xl p-3 h-full text-left active:scale-[0.98] transition-transform cursor-pointer shadow-earthy-card font-jakarta"
        style={{ backgroundColor: colors.earthy.card, border: `1px solid ${colors.earthy.divider}` }}
      >
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="text-xs font-bold truncate" style={{ color: theme.deeper }}>
            🏅 {t('badge.title')}
          </div>
          <div className="text-[10px] font-bold shrink-0" style={{ color: theme.deeper, opacity: 0.6 }}>
            <span>{t('badge.progressTap', { done: earnedStarCount + earnedIds.length, total: BADGE_TIERS.length + ACHIEVEMENTS.length })} ›</span>
          </div>
        </div>

        {!anyStarBadge && !anyAchievement ? (
          <div className="text-[12px] font-bold" style={{ color: theme.deeper, opacity: 0.7 }}>
            {t('badge.empty')}
          </div>
        ) : (
          <>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {BADGE_TIERS.map((tier, idx) => {
                const earned = totalStars >= tier.stars
                return (
                  <div
                    key={tier.stars}
                    title={t('badge.starsTitle', { count: tier.stars })}
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
                    title={achievementLabel(a)}
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

      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        emoji="🏅"
        title={t('badge.modalTitle', { name: kid?.name || '' })}
        panelClassName="!max-w-[780px] !overflow-hidden"
      >
        <div className="flex h-[calc(100vh-13rem)] max-h-[650px] flex-col sm:h-auto sm:max-h-[calc(100vh-9rem)]">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-3">
                <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">⭐ {t('badge.starBadges')}</div>
                {BADGE_TIERS.map((tier) => {
                  const earned = totalStars >= tier.stars
                  const remaining = Math.max(0, tier.stars - totalStars)
                  const pct = Math.min(100, Math.round((totalStars / tier.stars) * 100))
                  return (
                    <div key={tier.stars} className="mb-2 flex items-center gap-3 rounded-xl bg-earthy-card p-2">
                      <div
                        className="text-3xl shrink-0"
                        style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}
                      >
                        {tier.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-earthy-cocoa">{badgeLabel(tier)}</div>
                        <div className="text-[11px] text-earthy-cocoaSoft font-bold">
                          {badgeDescription(tier)}
                        </div>
                        {!earned && (
                          <div className="mt-1">
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E0D5' }}>
                              <div className="h-full transition-all duration-500" style={{ width: pct + '%', background: theme.deeper }} />
                            </div>
                            <div className="text-[11px] text-earthy-cocoaSoft font-bold mt-0.5">{t('badge.moreToGo', { count: remaining })}</div>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-[10px] font-bold" style={{ color: earned ? theme.deeper : '#BBB' }}>
                        {earned ? t('badge.earned') : `${totalStars}/${tier.stars}`}
                      </div>
                    </div>
                  )
                })}
              </section>

              <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-3">
                <div className="font-bold text-xs text-earthy-cocoaSoft uppercase tracking-wide mb-2">🎯 {t('badge.achievements')}</div>
                {ACHIEVEMENTS.map((a) => {
                  const earned = earnedIds.includes(a.id)
                  return (
                    <div key={a.id} className="mb-2 flex items-center gap-3 rounded-xl bg-earthy-card p-2">
                      <div
                        className="text-3xl shrink-0"
                        style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}
                      >
                        {a.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-earthy-cocoa">{achievementLabel(a)}</div>
                        <div className="text-[11px] text-earthy-cocoaSoft font-bold">{achievementDescription(a)}</div>
                      </div>
                      <div className="shrink-0 text-[10px] font-bold" style={{ color: earned ? theme.deeper : '#BBB' }}>
                        {earned ? t('badge.earned') : t('badge.locked')}
                      </div>
                    </div>
                  )
                })}
              </section>
            </div>
          </div>
          <div className="mt-4 flex justify-end border-t border-earthy-divider pt-4">
            <button
              onClick={() => setDetailsOpen(false)}
              className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
