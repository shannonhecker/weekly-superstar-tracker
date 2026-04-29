// Full-width score progress bar — earthy palette. Score numerals are the
// visual hero of the kid card, set in jakarta extrabold with tabular-nums
// so digits don't jitter on increment. Theme accent + deeper come from the
// retuned earthy THEMES map.
export default function ScoreBar({ total, max, theme }) {
  const pct = max > 0 ? Math.min(100, (total / max) * 100) : 0
  return (
    <div
      className="rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-3 shadow-earthy-card font-jakarta bg-earthy-card"
      style={{ border: '1px solid #F0E1C8' }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
        style={{ background: `${theme.accent}38`, border: `1px solid ${theme.accent}55` }}
      >
        {theme.emoji}
      </div>
      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#F8F1E4', border: '1px solid #EFE1C8' }}>
        <div
          className="h-full transition-all"
          style={{
            width: pct + '%',
            background: theme.deeper,
          }}
        />
      </div>
      <div
        key={total}
        className="score-number-pop font-extrabold text-2xl sm:text-3xl shrink-0 tabular-nums leading-none"
        style={{ color: '#5A3A2E' }}
      >
        {total}
        <span className="opacity-40 text-xl sm:text-2xl">/{max}</span>
      </div>
    </div>
  )
}
