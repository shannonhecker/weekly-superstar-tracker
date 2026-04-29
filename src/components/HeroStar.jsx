import Logo from './Logo'

// Drop-in animated brand mark — extracts the bouncing-logo + sparkles "stage"
// from LogoLoader so it can be used inline (onboarding intro, empty states,
// hero moments) without the loader's full-screen wrapper / label / shadow.
//
// Reuses existing keyframes from src/index.css:
//   - logo-loader-wink-bounce (mark)
//   - logo-loader-sparkle (3 dots, staggered via inline animationDelay)
//
// The .logo-loader-stage CSS sets a fixed pixel width/height (9.5rem × 8.25rem)
// tuned for size=88. We override width/height inline so callers can ask for
// other sizes without adding new CSS.
export default function HeroStar({ size = 88, className = '' }) {
  // Match the original stage's aspect ratio so the sparkle dots — which are
  // positioned in rem from the stage edges — still land cleanly. Original
  // ratio = 9.5/8.25 ≈ 1.1515.
  const stageWidth = `${size * 1.15}px`
  const stageHeight = `${size * 0.94}px`

  return (
    <div
      className={`logo-loader-stage ${className}`.trim()}
      style={{ width: stageWidth, height: stageHeight }}
      aria-hidden="true"
    >
      <span className="logo-loader-sparkle logo-loader-sparkle-one" />
      <span className="logo-loader-sparkle logo-loader-sparkle-two" />
      <span className="logo-loader-sparkle logo-loader-sparkle-three" />
      <Logo size={size} className="logo-loader-mark" />
    </div>
  )
}
