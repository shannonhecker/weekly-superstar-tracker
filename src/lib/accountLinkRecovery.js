import {
  GoogleAuthProvider,
  OAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth'
import { auth } from './firebase'

export const RECOVERY_ERROR_CODE = 'auth/account-exists-with-different-credential'

function credentialExtractorFor(providerId) {
  if (providerId === 'google.com') return GoogleAuthProvider.credentialFromError
  return OAuthProvider.credentialFromError
}

export function extractRecoveryInfo(err, attemptedProviderId) {
  if (!err || err.code !== RECOVERY_ERROR_CODE) return null
  const email = err.customData?.email
  if (!email) return null
  const pendingCredential = credentialExtractorFor(attemptedProviderId)(err)
  if (!pendingCredential) return null
  return { email, attemptedProviderId, pendingCredential }
}

export function getExistingSignInMethods(email) {
  return fetchSignInMethodsForEmail(auth, email)
}

export function linkPendingCredential(user, pendingCredential) {
  return linkWithCredential(user, pendingCredential)
}
