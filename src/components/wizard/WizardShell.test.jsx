import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import WizardShell from './WizardShell'

// ProductPreview owns its own illustrative UI and animation styles. Stub it so
// these tests stay focused on WizardShell's composition.
vi.mock('./ProductPreview', () => ({
  default: ({ variant }) => <div data-testid="product-preview" data-variant={variant} />,
}))

afterEach(() => {
  cleanup()
})

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

  it('renders the rotating product preview on the intro step', () => {
    render(
      <WizardShell step={1} direction="forward">
        <main />
      </WizardShell>
    )
    expect(screen.getByTestId('product-preview')).toHaveAttribute('data-variant', 'board')
  })

  it('keeps later steps as a single-column flow without the preview aside', () => {
    render(
      <WizardShell step={2} direction="forward">
        <main />
      </WizardShell>
    )
    expect(screen.queryByTestId('product-preview')).not.toBeInTheDocument()
  })

  it('applies forward parallax keyframe when direction is forward', () => {
    const { container } = render(
      <WizardShell step={1} direction="forward">
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
