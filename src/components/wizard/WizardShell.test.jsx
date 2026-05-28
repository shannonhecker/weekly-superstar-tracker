import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import WizardShell from './WizardShell'

// ThemeBannerArt pulls in AnimatedRasterBanner + raster assets which JSDOM
// can't load. Stub it out so we only test WizardShell's own composition.
vi.mock('../ThemeBannerArt', () => ({
  default: ({ themeKey }) => (
    <div data-testid="theme-banner-art" data-theme={themeKey} />
  ),
}))

// Logo is a thin <img> wrapper but its asset path means JSDOM will surface
// a network warning. Stub for cleanliness — Logo's own tests cover it.
vi.mock('../Logo', () => ({
  default: ({ size }) => <div data-testid="logo" data-size={size} />,
}))

describe('WizardShell', () => {
  it('renders children unchanged (mobile pass-through)', () => {
    // The outer wrapper is `contents` below lg:, so children should appear
    // exactly as if rendered without the shell wrapper. We assert the
    // unique child marker is in the tree.
    render(
      <WizardShell step={1} direction="forward">
        <main data-testid="step-content">
          <p>Step body</p>
        </main>
      </WizardShell>
    )
    expect(screen.getByTestId('step-content')).toBeInTheDocument()
    expect(screen.getByText('Step body')).toBeInTheDocument()
  })

  it('renders the brand-column heading', () => {
    render(
      <WizardShell step={1} direction="forward">
        <main />
      </WizardShell>
    )
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'A family achievement board.',
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders the three trust pills', () => {
    render(
      <WizardShell step={1} direction="forward">
        <main />
      </WizardShell>
    )
    expect(screen.getByText('Weekly view')).toBeInTheDocument()
    expect(screen.getByText('No ads, ever')).toBeInTheDocument()
    expect(screen.getByText('Ages 3 to 12')).toBeInTheDocument()
  })

  it('applies forward parallax keyframe when direction is forward', () => {
    const { container } = render(
      <WizardShell step={2} direction="forward">
        <main />
      </WizardShell>
    )
    // The keyed inner brand-column wrapper carries the animation class.
    const animated = container.querySelector(
      '[class*="brand-parallax-down"]'
    )
    expect(animated).not.toBeNull()
  })

  it('applies back parallax keyframe when direction is back', () => {
    const { container } = render(
      <WizardShell step={1} direction="back">
        <main />
      </WizardShell>
    )
    const animated = container.querySelector(
      '[class*="brand-parallax-up"]'
    )
    expect(animated).not.toBeNull()
  })
})
