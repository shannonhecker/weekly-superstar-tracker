// Wrap the shared formatter with web-only OAuth-specific messages.
// The shared package handles email/password codes; OAuth popup flows are
// web-specific so we layer their friendlier copy on top of the shared map
// instead of editing the shared package (kept stable for iOS parity).
import { formatAuthError as sharedFormatAuthError } from '@weekly-superstar/shared/auth-errors'

const OAUTH_OVERRIDES = {
  'auth/popup-closed-by-user': 'Sign-in window was closed before finishing.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in popup. Allow popups for winkingstar.com and try again.',
  'auth/account-exists-with-different-credential':
    'An account with this email already exists with a different sign-in method. Try email + password, or contact support.',
  'auth/operation-not-allowed':
    "This sign-in method isn't enabled yet. Contact the admin.",
  // Sentinel used by callers so they can distinguish "silent" cancellations
  // (e.g. user clicked the OAuth button twice in a row) from real errors.
  // Treat as falsy display.
  'auth/cancelled-popup-request': '',
}

export function formatAuthError(err) {
  if (!err) return 'Something went wrong. Try again.'
  const code = (err && (err.code || err.message)) || ''
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
