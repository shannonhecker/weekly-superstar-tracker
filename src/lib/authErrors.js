// Wrap the shared formatter with web-only OAuth-specific messages.
// Sensitive sign-in failures are normalized here so the UI does not reveal
// whether an email address exists; OAuth popup flows stay web-specific.
import { formatAuthError as sharedFormatAuthError } from '@weekly-superstar/shared/auth-errors'

const GENERIC_SIGN_IN_ERROR = 'Email or password is incorrect. Try again or reset your password.'

// Provider display names for OAuth-specific copy.
const PROVIDER_LABELS = { 'google.com': 'Google', 'apple.com': 'Apple' }

// "The credential did not work" codes. On the password flow these are masked
// to one generic message to avoid email enumeration. On an OAuth (Google /
// Apple) flow there is no password to be wrong, so the masked copy is
// misleading; surface a provider-specific message instead.
const CREDENTIAL_FAILURE_CODES = new Set([
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
])

const OAUTH_OVERRIDES = {
  'auth/user-not-found': GENERIC_SIGN_IN_ERROR,
  'auth/wrong-password': GENERIC_SIGN_IN_ERROR,
  'auth/invalid-credential': GENERIC_SIGN_IN_ERROR,
  'auth/invalid-login-credentials': GENERIC_SIGN_IN_ERROR,
  'auth/popup-closed-by-user': 'Sign-in window was closed before finishing.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in popup. Allow popups for winkingstar.com and try again.',
  'auth/account-exists-with-different-credential':
    'An account with this email already exists with a different sign-in method. Try email + password, or contact support.',
  'auth/operation-not-allowed':
    "This sign-in method isn't enabled yet. Contact the admin.",
  'auth/no-family-board':
    'Create your family board first, then sign in here next time.',
  // Sentinel used by callers so they can distinguish "silent" cancellations
  // (e.g. user clicked the OAuth button twice in a row) from real errors.
  // Treat as falsy display.
  'auth/cancelled-popup-request': '',
}

export function formatAuthError(err, { flow = 'password', provider } = {}) {
  if (!err) return 'Something went wrong. Try again.'
  const code = (err && (err.code || err.message)) || ''
  // On an OAuth flow, a credential failure must not claim "email or password
  // is incorrect" (there is no password). De-mask to a provider message.
  if (flow === 'oauth' && CREDENTIAL_FAILURE_CODES.has(code)) {
    const label = PROVIDER_LABELS[provider]
    return label
      ? `${label} sign-in did not go through. Please try again.`
      : 'Sign-in did not go through. Please try again.'
  }
  if (Object.prototype.hasOwnProperty.call(OAUTH_OVERRIDES, code)) {
    return OAUTH_OVERRIDES[code]
  }
  return sharedFormatAuthError(err)
}

// True for codes the UI should ignore silently (clear loading state, no banner).
export function isSilentAuthError(err) {
  const code = (err && (err.code || err.message)) || ''
  return code === 'auth/cancelled-popup-request'
}
