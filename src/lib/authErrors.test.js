import { describe, it, expect } from 'vitest'
import { formatAuthError, isSilentAuthError } from './authErrors'

// authErrors maps Firebase auth error codes to friendly user copy.
// The OAuth-specific overrides are web-only; the rest delegates to the
// shared formatter which iOS also uses.

describe('formatAuthError — OAuth overrides', () => {
  it('maps popup-closed-by-user to friendly copy', () => {
    const err = { code: 'auth/popup-closed-by-user' }
    expect(formatAuthError(err)).toContain('closed before')
  })

  it('maps popup-blocked to allowlist instructions', () => {
    expect(formatAuthError({ code: 'auth/popup-blocked' }))
      .toContain('Allow popups')
  })

  it('maps account-exists-with-different-credential to provider hint', () => {
    expect(formatAuthError({ code: 'auth/account-exists-with-different-credential' }))
      .toContain('different sign-in method')
  })

  it('maps operation-not-allowed to admin-config copy', () => {
    expect(formatAuthError({ code: 'auth/operation-not-allowed' }))
      .toContain("isn't enabled")
  })

  it('returns empty string for cancelled-popup-request (silent sentinel)', () => {
    expect(formatAuthError({ code: 'auth/cancelled-popup-request' })).toBe('')
  })
})

describe('formatAuthError — fallthrough to shared', () => {
  it('returns a non-empty string for unrecognised codes', () => {
    const out = formatAuthError({ code: 'auth/some-unknown-future-code' })
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
  })

  it('handles null err gracefully', () => {
    expect(formatAuthError(null)).toBe('Something went wrong. Try again.')
    expect(formatAuthError(undefined)).toBe('Something went wrong. Try again.')
  })
})

describe('isSilentAuthError', () => {
  it('returns true for cancelled-popup-request', () => {
    expect(isSilentAuthError({ code: 'auth/cancelled-popup-request' })).toBe(true)
  })

  it('returns false for any other code', () => {
    expect(isSilentAuthError({ code: 'auth/popup-closed-by-user' })).toBe(false)
    expect(isSilentAuthError({ code: 'auth/wrong-password' })).toBe(false)
  })

  it('returns false for nullish errors', () => {
    expect(isSilentAuthError(null)).toBe(false)
    expect(isSilentAuthError(undefined)).toBe(false)
  })
})
