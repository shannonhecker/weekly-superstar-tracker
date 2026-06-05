import { describe, it, expect } from 'vitest'
import { formatAuthError, isSilentAuthError } from './authErrors'

// authErrors maps Firebase auth error codes to friendly user copy.
// Web-only OAuth overrides are layered on top of shared copy, and sensitive
// sign-in failures are normalized to avoid email enumeration.

const GENERIC_SIGN_IN_ERROR = 'Email or password is incorrect. Try again or reset your password.'

describe('formatAuthError — OAuth overrides', () => {
  it('maps credential failures to one generic sign-in message', () => {
    expect(formatAuthError({ code: 'auth/user-not-found' })).toBe(GENERIC_SIGN_IN_ERROR)
    expect(formatAuthError({ code: 'auth/wrong-password' })).toBe(GENERIC_SIGN_IN_ERROR)
    expect(formatAuthError({ code: 'auth/invalid-credential' })).toBe(GENERIC_SIGN_IN_ERROR)
    expect(formatAuthError({ code: 'auth/invalid-login-credentials' })).toBe(GENERIC_SIGN_IN_ERROR)
  })

  it('keeps the password mask when flow is explicitly password', () => {
    expect(formatAuthError({ code: 'auth/invalid-credential' }, { flow: 'password' }))
      .toBe(GENERIC_SIGN_IN_ERROR)
  })

  it('de-masks credential failures on the OAuth flow (Google)', () => {
    const out = formatAuthError({ code: 'auth/invalid-credential' }, { flow: 'oauth', provider: 'google.com' })
    expect(out).not.toBe(GENERIC_SIGN_IN_ERROR)
    expect(out).toContain('Google')
  })

  it('de-masks credential failures on the OAuth flow (Apple)', () => {
    expect(formatAuthError({ code: 'auth/user-not-found' }, { flow: 'oauth', provider: 'apple.com' }))
      .toContain('Apple')
  })

  it('uses a generic OAuth message when the provider is unknown', () => {
    const out = formatAuthError({ code: 'auth/invalid-login-credentials' }, { flow: 'oauth' })
    expect(out).not.toBe(GENERIC_SIGN_IN_ERROR)
    expect(out).toContain('did not go through')
  })

  it('still maps non-credential OAuth codes the same regardless of flow', () => {
    expect(formatAuthError({ code: 'auth/popup-blocked' }, { flow: 'oauth', provider: 'google.com' }))
      .toContain('Allow popups')
  })

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
