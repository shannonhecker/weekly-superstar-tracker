import { useEffect } from 'react'

// One-shot celebration when a kid hits every star in the week. Renders
// a "certificate" style card over a dim backdrop. Parent can dismiss or
// save the image (share uses navigator.share if available, falling back
// to a clipboard link — native share on mobile only). Triggered by
// ChildTracker when score crosses MAX_TOTAL; suppressed if the user
// has already seen it this week (tracked via sessionStorage key).
const PerfectWeekCelebration = ({ show, childName, theme, weekKey, onClose }) => {
  useEffect(() => {
    if (!show) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, onClose])

  if (!show) return null

  const handleShare = async () => {
    const text = `${childName} got a PERFECT week ⭐ every single sticker checked! (${weekKey || 'this week'})`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Perfect Week!', text })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      }
    } catch { /* user cancelled, ignore */ }
  }

  return (
    <div
      className="fixed inset-0 z-[9996] bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfect-week-title"
    >
      <div
        className="relative rounded-3xl w-full max-w-sm p-6 text-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.accentLight}, white)`,
          border: `4px solid ${theme.accent}`,
          boxShadow: `0 10px 40px ${theme.accent}55`,
        }}
      >
        <div className="text-6xl mb-2" aria-hidden="true">🏆</div>
        <h2
          id="perfect-week-title"
          className="text-2xl font-black font-display leading-tight mb-1"
          style={{ color: theme.accentDark || theme.accent }}
        >
          PERFECT WEEK!
        </h2>
        <p className="text-base font-extrabold text-gray-700 mb-4">
          {childName} checked every single sticker ⭐
        </p>
        <div className="inline-block px-4 py-2 rounded-xl bg-white/70 text-xs font-bold mb-5" style={{ color: theme.accent }}>
          {weekKey || new Date().toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white border-2 font-extrabold text-sm"
            style={{ borderColor: theme.accentLight, color: theme.accent }}
          >
            Close
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl font-extrabold text-white text-sm"
            style={{ background: theme.accent }}
          >
            🎉 Share
          </button>
        </div>
      </div>
    </div>
  )
}

export default PerfectWeekCelebration
