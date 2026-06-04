import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import TrustPills from './TrustPills'
import { I18nProvider } from '../lib/i18n'

function renderTrustPills(props) {
  return render(
    <I18nProvider>
      <TrustPills {...props} />
    </I18nProvider>,
  )
}

describe('TrustPills', () => {
  it('renders exactly 3 pills', () => {
    const { container } = renderTrustPills()
    const pills = container.querySelectorAll('[data-testid="trust-pill"]')
    expect(pills.length).toBe(3)
  })

  it('renders pills in canonical order with exact copy', () => {
    const { container } = renderTrustPills()
    const pills = Array.from(container.querySelectorAll('[data-testid="trust-pill"]'))
    expect(pills[0].textContent).toBe('Ages 3 to 12')
    expect(pills[1].textContent).toBe('No ads, ever')
    expect(pills[2].textContent).toBe('Free starter board')
  })

  it('forwards an accessibility-friendly role to the wrapper for grouping', () => {
    const { container } = renderTrustPills()
    const wrapper = container.querySelector('[role="list"]')
    expect(wrapper).not.toBeNull()
    const items = wrapper.querySelectorAll('[role="listitem"]')
    expect(items.length).toBe(3)
  })

  it('applies the className prop on the wrapper for layout overrides', () => {
    const { container } = renderTrustPills({ className: 'custom-spacing' })
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('custom-spacing')
  })

  it('can align the row to the start for editorial layouts', () => {
    const { container } = renderTrustPills({ align: 'start' })
    const wrapper = container.firstChild
    expect(wrapper.className).toContain('justify-start')
    expect(wrapper.className).toContain('text-left')
  })
})
