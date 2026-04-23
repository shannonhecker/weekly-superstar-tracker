import { isBirthdayWeek } from '../lib/themes'

export function BirthdayBanner({ kid }) {
  if (!isBirthdayWeek(kid?.birthday)) return null
  return (
    <div
      role="status"
      aria-label={`Birthday week for ${kid?.name || 'someone'}. Extra sparkles all week.`}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        margin: '0 12px 8px',
        background: 'linear-gradient(135deg, #F9A8D4 0%, #FCD34D 100%)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 22, marginRight: 10 }} aria-hidden>🎂</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, color: '#7C2D12', fontSize: 14 }}>
          It's {kid?.name || 'someone'}'s birthday week!
        </div>
        <div style={{ color: '#9A3412', fontSize: 11, marginTop: 1 }}>
          Extra sparkles all week long ✨
        </div>
      </div>
    </div>
  )
}
