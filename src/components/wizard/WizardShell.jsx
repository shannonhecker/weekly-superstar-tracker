import Logo from '../Logo'
import MarketingDoodleStage from '../MarketingDoodleStage'
import TrustPills from '../TrustPills'

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
// Both columns are flush on cream. Step-column wrapper is `relative` on lg
// so the existing floating chrome inside <main> stays anchored within the
// column on desktop. On mobile the wrapper is `contents`, so <main>'s own
// `relative` anchors chrome exactly as today.
//
// `step` + `direction` drive the parallax: the inner brand-column wrapper is
// keyed on `step` so it re-mounts each change, applying a slide+fade keyframe
// (8px translate3d + opacity 0->1, 220ms ease-out) that mirrors the existing
// onb-slide-in-* pattern on the right side.
export default function WizardShell({ children, step, direction }) {
  const parallaxClass =
    direction === 'back'
      ? 'animate-[brand-parallax-up_220ms_ease-out]'
      : 'animate-[brand-parallax-down_220ms_ease-out]'

  return (
    <div className="contents lg:mx-auto lg:grid lg:w-full lg:max-w-6xl lg:grid-cols-[1fr_0.86fr] lg:gap-5 lg:items-stretch lg:px-5 lg:py-6 lg:bg-earthy-cream">
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
          <MarketingDoodleStage compact className="min-h-[340px]" />
          <div className="mt-8 mb-5 flex items-center gap-3">
            <Logo size={52} />
            <span className="text-2xl font-extrabold text-earthy-cocoa">
              Winking Star
            </span>
          </div>
          <h2 className="max-w-xl text-4xl font-extrabold leading-tight text-earthy-cocoa">
            Build a board they want to open.
          </h2>
          <p className="mt-4 max-w-lg text-base font-bold leading-relaxed text-earthy-cocoaSoft">
            Pick a theme, add your superstar, and turn this week's routines into visible wins.
          </p>
          <TrustPills className="mt-8" />
        </div>
      </aside>

      {/* Step column: `contents` on mobile (no layout impact, children render as
          if direct), `block` + `relative` on lg so the existing floating chrome
          inside <main> anchors to this column. */}
      <div className="contents lg:block lg:relative">
        {children}
      </div>
    </div>
  )
}
