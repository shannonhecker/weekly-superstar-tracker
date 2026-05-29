import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '../../lib/themes'

const KID_NAME = 'Nathan'
const THEME_KEY = 'garden'
const TOTAL_STARS = 11
const REWARD_GOAL = 30
const REWARD_LABEL = 'a new bike'
const ROWS = 3
const COLS = 5

export default function PeekBoard() {
  const theme = THEMES[THEME_KEY] || THEMES.football
  const pct = Math.min(100, Math.round((TOTAL_STARS / REWARD_GOAL) * 100))
  const cells = Array.from({ length: ROWS * COLS }, (_, i) => i < TOTAL_STARS)

  return (
    <div
      data-peek-ready="true"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: colors.earthy.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          background: colors.earthy.card,
          border: `1px solid ${colors.earthy.divider}`,
          borderRadius: 28,
          boxShadow: '0 8px 32px rgba(90, 58, 46, 0.08)',
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: theme.deeper || colors.earthy.cocoaSoft,
              marginBottom: 6,
            }}
          >
            {KID_NAME}'s week
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: colors.earthy.cocoa,
              lineHeight: 1.05,
            }}
          >
            This week
          </div>
        </div>

        {/* Stars grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            rowGap: 16,
            columnGap: 12,
            justifyItems: 'center',
          }}
        >
          {cells.map((filled, i) => (
            <div
              key={i}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                background: filled
                  ? `${theme.accent || colors.earthy.cocoa}1F`
                  : colors.earthy.ivory,
                border: filled
                  ? `2px solid ${theme.accent || colors.earthy.cocoa}`
                  : `2px solid ${colors.earthy.divider}`,
              }}
            >
              {filled ? <span>⭐</span> : <span style={{ color: colors.earthy.cocoaSoft, opacity: 0.35 }}>○</span>}
            </div>
          ))}
        </div>

        {/* Reward bar */}
        <div
          style={{
            background: colors.earthy.ivory,
            border: `1px solid ${colors.earthy.divider}`,
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              fontSize: 16,
              fontWeight: 800,
              color: colors.earthy.cocoa,
            }}
          >
            <span>🎁 {REWARD_LABEL} 🚲</span>
            <span style={{ fontSize: 13, color: theme.deeper || colors.earthy.cocoaSoft }}>
              {TOTAL_STARS} / {REWARD_GOAL}
            </span>
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 999,
              background: colors.earthy.cream,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: theme.deeper || colors.earthy.cocoa,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
