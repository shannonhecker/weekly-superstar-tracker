// Full-width gradient score progress bar.
export default function ScoreBar({ total, max, theme }) {
  const pct = max > 0 ? Math.min(100, (total / max) * 100) : 0
  return (
    <div
      className="rounded-2xl p-3 mb-4 flex items-center gap-3"
      style={{ background: '#FFFFFF', border: `1px solid ${theme.accent}33` }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ background: `${theme.accent}33` }}
      >
        {theme.emoji}
      </div>
      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: pct + '%', background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.deeper} 100%)` }}
        />
      </div>
      <div className="font-black font-display text-base shrink-0" style={{ color: theme.deeper }}>
        {total}/{max}
      </div>
    </div>
  )
}
