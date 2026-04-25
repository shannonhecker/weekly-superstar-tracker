// Full-width gradient score progress bar. The score numerals are the visual
// hero of the kid card — set in the larger Fredoka display size and
// tabular-nums so the digits don't jitter on increment.
export default function ScoreBar({ total, max, theme }) {
  const pct = max > 0 ? Math.min(100, (total / max) * 100) : 0
  return (
    <div
      className="rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-3"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${theme.accent}33`,
        boxShadow: `0 1px 0 ${theme.accent}11`,
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
        style={{ background: `${theme.accent}33` }}
      >
        {theme.emoji}
      </div>
      <div className="flex-1 h-3.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: pct + '%',
            background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.deeper} 100%)`,
          }}
        />
      </div>
      <div
        className="font-black font-display text-2xl sm:text-3xl shrink-0 tabular-nums leading-none"
        style={{ color: theme.deeper }}
      >
        {total}
        <span className="opacity-40 text-xl sm:text-2xl">/{max}</span>
      </div>
    </div>
  )
}
