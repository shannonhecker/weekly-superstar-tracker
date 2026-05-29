import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import PeekBoard from './PeekBoard'

describe('PeekBoard (raw web UI for PR-A)', () => {
  it('renders without a phone bezel — no element should contain the bezelDeep token color', () => {
    const { container } = render(<PeekBoard />)
    const html = container.innerHTML
    expect(html.toLowerCase()).not.toContain('#1a1410')
    expect(html.toLowerCase()).not.toContain('#0f0a07')
  })

  it('sets data-peek-ready on the wrapper so Playwright knows when to capture', () => {
    const { container } = render(<PeekBoard />)
    const ready = container.querySelector('[data-peek-ready="true"]')
    expect(ready).not.toBeNull()
  })

  it('renders the stars-grid visual (regression guard)', () => {
    const { getAllByText } = render(<PeekBoard />)
    const stars = getAllByText('⭐')
    expect(stars.length).toBe(11)
  })

  it('renders the reward bar with kid name + goal', () => {
    const { getByText } = render(<PeekBoard />)
    expect(getByText(/nathan/i)).toBeInTheDocument()
    expect(getByText(/11 \/ 30/)).toBeInTheDocument()
  })
})
