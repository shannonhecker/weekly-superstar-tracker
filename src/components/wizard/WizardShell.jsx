import Logo from '../Logo'
import ThemeBannerArt from '../ThemeBannerArt'

// Desktop-only (lg:, 1024px+) two-column shell for the signup wizard.
//
// Mobile + tablet (<lg) render byte-identical to today: the outer wrapper
// uses `display: contents` so it contributes nothing to layout (children
// lay out as direct children of <body>), and the brand-column <aside> is
// `hidden lg:flex` so it doesn't paint. The result is the same on-screen
// rendering as a bare {children} render.
//
// Desktop (lg+) switches the outer wrapper to grid, pinning brand-column
// (left) + step-column (right) inside `max-w-6xl mx-auto` with
// `lg:grid-cols-[1fr_0.86fr]` (matches SignIn).
//
// Both columns are flush on cream (the inner <main> sets #FCEEE1 already)
// — no card wrap on either side. Step-column wrapper is `relative` on lg:
// so the existing floating chrome inside <main> stays anchored within the
// column on desktop. On mobile the wrapper is `contents`, so <main>'s own
// `relative` anchors chrome exactly as today.
//
// `step` + `direction` drive the D-6 parallax: the inner brand-column
// wrapper is keyed on `step` so it re-mounts each change, applying a
// slide+fade keyframe (8px translate3d + opacity 0→1, 220ms ease-out)
// that mirrors the existing onb-slide-in-* pattern on the right side.
// Keyframes are gated by @media (prefers-reduced-motion: no-preference)
// so reduced-motion users get a static brand column.
export default function WizardShell({ children, step, direction }) {
  const parallaxClass =
    direction === 'back'
      ? 'animate-[brand-parallax-up_220ms_ease-out]'
      : 'animate-[brand-parallax-down_220ms_ease-out]'

  return (
    <div className="contents lg:mx-auto lg:grid lg:w-full lg:max-w-6xl lg:grid-cols-[1fr_0.86fr] lg:gap-5 lg:items-stretch lg:px-5 lg:py-6 lg:bg-[#FCEEE1]">
      <aside
        className="hidden lg:flex lg:flex-col"
        aria-label="Winking Star"
      >
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @keyframes brand-parallax-down {
              from { opacity: 0; transform: translate3d(0, 8px, 0); }
              to   { opacity: 1; transform: translate3d(0, 0, 0); }
            }
            @keyframes brand-parallax-up {
              from { opacity: 0; transform: translate3d(0, -8px, 0); }
              to   { opacity: 1; transform: translate3d(0, 0, 0); }
            }
          }
        `}</style>
        <div
          key={step}
          className={`flex flex-1 flex-col justify-start p-8 ${parallaxClass}`}
        >
          <div>
            <div className="rounded-3xl overflow-hidden">
              <ThemeBannerArt
                themeKey="animals"
                height={320}
                animated={false}
                loading="eager"
              />
            </div>
            <div className="mt-8 mb-5 flex items-center gap-3">
              <Logo size={52} />
              <span className="text-2xl font-extrabold text-earthy-cocoa">
                Winking Star
              </span>
            </div>
            <h2 className="max-w-xl text-4xl font-extrabold leading-tight text-earthy-cocoa">
              A family achievement board.
            </h2>
            <p className="mt-4 max-w-lg text-base font-bold leading-relaxed text-earthy-cocoaSoft">
              Open the weekly chart, switch superstars, and keep today&apos;s stars moving with your child nearby.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {['Weekly view', 'No ads, ever', 'Ages 3 to 12'].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-earthy-divider bg-earthy-ivory px-3 py-3 text-sm font-extrabold text-earthy-cocoa"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Step column — `contents` on mobile (no layout impact, children
          render as if direct), `block` + `relative` on lg: so the existing
          floating chrome inside <main> anchors to this column. */}
      <div className="contents lg:block lg:relative">
        {children}
      </div>
    </div>
  )
}
