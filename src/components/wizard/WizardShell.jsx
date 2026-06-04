import { useEffect, useState } from 'react'
import ProductPreview from './ProductPreview'
import LocaleSelectorButton from '../LocaleSelectorButton'

const ROTATING_PREVIEWS = ['board', 'themes', 'kid', 'records']

// Desktop shell for the signup wizard. Step 1 gets the product preview column;
// later steps stay centered as a focused, single-column flow.
export default function WizardShell({ children, step, direction }) {
  const parallaxClass =
    direction === 'back'
      ? 'animate-[brand-parallax-up_220ms_ease-out]'
      : 'animate-[brand-parallax-down_220ms_ease-out]'
  const isIntro = step === 1
  const gridClass = isIntro
    ? 'lg:max-w-[1120px] lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-8 xl:gap-12'
    : 'lg:max-w-[560px] lg:grid-cols-1 lg:gap-0'

  return (
    <div className="contents lg:block lg:min-h-screen lg:bg-earthy-card">
      <div className={`contents lg:mx-auto lg:grid lg:min-h-screen lg:w-full lg:items-center lg:bg-earthy-card lg:px-8 lg:py-8 ${gridClass}`}>
        <div className="fixed right-4 top-4 z-20">
          <LocaleSelectorButton compact />
        </div>
        {isIntro ? (
          <aside
            className="hidden lg:min-w-0 lg:flex lg:flex-col"
            aria-label="Winking Star preview"
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
              className={`mx-auto flex w-full max-w-[560px] flex-col justify-center py-4 ${parallaxClass}`}
            >
              <RotatingProductPreview />
            </div>
          </aside>
        ) : null}

        {/* Step column — `contents` on mobile (no layout impact, children
            render as if direct), `block` + `relative` on lg: so the existing
            floating chrome inside <main> anchors to this column. */}
        <div className="contents lg:block lg:relative">
          {children}
        </div>
      </div>
    </div>
  )
}

function RotatingProductPreview() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (
      typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % ROTATING_PREVIEWS.length)
    }, 5600)
    return () => window.clearInterval(id)
  }, [])

  const variant = ROTATING_PREVIEWS[index]
  return <ProductPreview key={variant} className="w-full" variant={variant} />
}
