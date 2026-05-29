import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../../lib/themes'
import PhoneBezel from './PhoneBezel'

/**
 * PeekReward — dev-only mock of the RewardGoal card, sized for a wizard banner
 * screenshot. Pure props, no Firestore/auth.
 *
 * Hardcoded fixture per task spec:
 *   theme="garden", reward { label: "a new bike", goal: 30 }, totalStars 11
 */
const KID_NAME = 'Nathan'
const THEME_KEY = 'garden'
const TOTAL_STARS = 11
const REWARD = { label: 'a new bike', goal: 30, emoji: '🚲' }

export default function PeekReward() {
  const theme = THEMES[THEME_KEY] || THEMES.football
  const pct = Math.min(100, Math.round((TOTAL_STARS / REWARD.goal) * 100))
  const remaining = Math.max(0, REWARD.goal - TOTAL_STARS)

  return (
    <PhoneBezel screenBg={colors.earthy.ivory}>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '64px 28px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          background: `linear-gradient(180deg, ${colors.earthy.ivory} 0%, ${theme.accent}1A 100%)`,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: theme.deeper,
              marginBottom: 6,
            }}
          >
            {KID_NAME}'s reward
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: colors.earthy.cocoa,
              lineHeight: 1.15,
            }}
          >
            Working toward
          </div>
        </div>

        {/* Reward hero card — expanded RewardGoal look */}
        <div
          style={{
            background: colors.earthy.card,
            border: `1px solid ${colors.earthy.cream}`,
            borderRadius: 28,
            padding: 24,
            boxShadow: '0 8px 24px rgba(26, 14, 7, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Reward emoji + label */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              paddingTop: 8,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                background: `${theme.accent}33`,
                border: `2px solid ${theme.accent}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
                filter: 'drop-shadow(0 4px 8px rgba(26,14,7,0.12))',
              }}
            >
              {REWARD.emoji}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: colors.earthy.cocoa,
                textAlign: 'center',
              }}
            >
              🎁 {REWARD.label}
            </div>
          </div>

          {/* Progress bar — matches RewardGoal track */}
          <div>
            <div
              style={{
                height: 14,
                borderRadius: 999,
                background: colors.earthy.cream,
                border: `1px solid ${colors.earthy.cream}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: theme.deeper,
                  borderRadius: 999,
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 12,
                fontWeight: 800,
                color: theme.deeper,
              }}
            >
              <span>{TOTAL_STARS}/{REWARD.goal} stars</span>
              <span>{pct}%</span>
            </div>
          </div>

          {/* Encouragement line */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: colors.earthy.cocoaSoft,
              paddingTop: 4,
            }}
          >
            {remaining} stars to go
          </div>
        </div>

        {/* Footer chip */}
        <div
          style={{
            marginTop: 'auto',
            alignSelf: 'center',
            background: `${theme.accent}33`,
            border: `1px solid ${theme.accent}66`,
            borderRadius: 999,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 800,
            color: theme.deeper,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          ⭐ Keep going
        </div>
      </div>
    </PhoneBezel>
  )
}
