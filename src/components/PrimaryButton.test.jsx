import { render, fireEvent, screen } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import PrimaryButton from './PrimaryButton'

// PrimaryButton is the polymorphic cocoa-pill CTA shared across SignIn,
// SignUp, ForgotPassword, and AuthAction (lifted from AuthAction in #45).
// These tests pin its public contract so a future tweak doesn't silently
// break the four call sites.

describe('PrimaryButton', () => {
  it('renders a <button type="button"> by default', () => {
    render(<PrimaryButton>Click me</PrimaryButton>)
    const el = screen.getByRole('button', { name: 'Click me' })
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('type')).toBe('button')
  })

  it('honours an explicit type="submit" prop', () => {
    render(<PrimaryButton type="submit">Sign in</PrimaryButton>)
    const el = screen.getByRole('button', { name: 'Sign in' })
    expect(el.getAttribute('type')).toBe('submit')
  })

  it('renders as a react-router Link when as={Link} is supplied', () => {
    render(
      <MemoryRouter>
        <PrimaryButton as={Link} to="/signin">Back to sign in</PrimaryButton>
      </MemoryRouter>
    )
    const el = screen.getByRole('link', { name: 'Back to sign in' })
    expect(el.tagName).toBe('A')
    expect(el.getAttribute('href')).toBe('/signin')
    // type="..." should NOT be applied when the underlying tag is not a button.
    expect(el.getAttribute('type')).toBeNull()
  })

  it('merges a caller className with the base classes', () => {
    render(<PrimaryButton className="mt-2">Submit</PrimaryButton>)
    const el = screen.getByRole('button', { name: 'Submit' })
    expect(el.className).toContain('mt-2')
    // Sample one signature class from the base set so we know the merge
    // didn't replace the defaults — full string match is brittle.
    expect(el.className).toContain('rounded-pill')
    expect(el.className).toContain('bg-earthy-cocoa')
  })

  it('forwards onClick + disabled to the underlying button', () => {
    const onClick = vi.fn()
    render(
      <PrimaryButton onClick={onClick} disabled>
        Cannot click
      </PrimaryButton>
    )
    const el = screen.getByRole('button', { name: 'Cannot click' })
    expect(el).toBeDisabled()
    fireEvent.click(el)
    // Disabled buttons swallow click in the DOM, so onClick should NOT fire.
    expect(onClick).not.toHaveBeenCalled()
  })
})
