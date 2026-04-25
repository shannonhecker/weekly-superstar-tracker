// Full-width score progress bar — earthy palette. Score numerals are the
// visual hero of the kid card, set in jakarta extrabold with tabular-nums
// so digits don't jitter on increment. Theme accent + deeper come from the
// retuned earthy THEMES map.
export default function ScoreBar({ total, max, theme }) {
  const pct = max > 0 ? Math.min(100, (total / max) * 100) : 0
  return (
    <div
      className="rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-3 bg-earthy-ivory shadow-earthy-soft font-jakarta"
      style={{
        border: `1px solid ${theme.accent}66`,
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
        style={{ background: `${theme.accent}55` }}
      >
        {theme.emoji}
      </div>
      <div className="flex-1 h-3.5 rounded-full bg-earthy-divider overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: pct + '%',
            background: theme.deeper,
          }}
        />
      </div>
      <div
        className="font-extrabold text-2xl sm:text-3xl shrink-0 tabular-nums leading-none"
        style={{ color: theme.deeper }}
      >
        {total}
        <span className="opacity-40 text-xl sm:text-2xl">/{max}</span>
      </div>
    </div>
  )
}
