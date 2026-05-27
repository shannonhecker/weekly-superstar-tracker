import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('firebase/auth', () => {
  return {
    GoogleAuthProvider: {
      credentialFromError: vi.fn(),
      PROVIDER_ID: 'google.com',
    },
    OAuthProvider: {
      credentialFromError: vi.fn(),
    },
    fetchSignInMethodsForEmail: vi.fn(),
    linkWithCredential: vi.fn(),
  }
})

vi.mock('./firebase', () => ({ auth: { name: 'mock-auth' } }))

import {
  GoogleAuthProvider,
  OAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth'
import {
  extractRecoveryInfo,
  getExistingSignInMethods,
  linkPendingCredential,
  RECOVERY_ERROR_CODE,
} from './accountLinkRecovery'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('extractRecoveryInfo', () => {
  it('returns null when the error is not the collision code', () => {
    expect(extractRecoveryInfo({ code: 'auth/wrong-password' }, 'google.com')).toBeNull()
    expect(extractRecoveryInfo(null, 'google.com')).toBeNull()
  })

  it('extracts email + Google pending credential', () => {
    const fakeCred = { providerId: 'google.com', accessToken: 't' }
    GoogleAuthProvider.credentialFromError.mockReturnValue(fakeCred)
    const err = {
      code: 'auth/account-exists-with-different-credential',
      customData: { email: 'user@example.com' },
    }

    const info = extractRecoveryInfo(err, 'google.com')

    expect(info).toEqual({
      email: 'user@example.com',
      attemptedProviderId: 'google.com',
      pendingCredential: fakeCred,
    })
    expect(GoogleAuthProvider.credentialFromError).toHaveBeenCalledWith(err)
  })

  it('extracts email + Apple pending credential', () => {
    const fakeCred = { providerId: 'apple.com', idToken: 'id' }
    OAuthProvider.credentialFromError.mockReturnValue(fakeCred)
    const err = {
      code: 'auth/account-exists-with-different-credential',
      customData: { email: 'apple.user@example.com' },
    }

    const info = extractRecoveryInfo(err, 'apple.com')

    expect(info.email).toBe('apple.user@example.com')
    expect(info.pendingCredential).toBe(fakeCred)
    expect(info.attemptedProviderId).toBe('apple.com')
    expect(OAuthProvider.credentialFromError).toHaveBeenCalledWith(err)
  })

  it('returns null when the credential cannot be extracted', () => {
    GoogleAuthProvider.credentialFromError.mockReturnValue(null)
    const err = {
      code: 'auth/account-exists-with-different-credential',
      customData: { email: 'user@example.com' },
    }
    expect(extractRecoveryInfo(err, 'google.com')).toBeNull()
  })

  it('returns null when the email is missing (cannot recover blind)', () => {
    GoogleAuthProvider.credentialFromError.mockReturnValue({ providerId: 'google.com' })
    const err = {
      code: 'auth/account-exists-with-different-credential',
      customData: {},
    }
    expect(extractRecoveryInfo(err, 'google.com')).toBeNull()
  })
})

describe('getExistingSignInMethods', () => {
  it('proxies to fetchSignInMethodsForEmail and returns the array', async () => {
    fetchSignInMethodsForEmail.mockResolvedValue(['apple.com'])
    const methods = await getExistingSignInMethods('user@example.com')
    expect(methods).toEqual(['apple.com'])
    expect(fetchSignInMethodsForEmail).toHaveBeenCalledWith(
      { name: 'mock-auth' },
      'user@example.com',
    )
  })
})

describe('linkPendingCredential', () => {
  it('calls linkWithCredential with the user + pending credential', async () => {
    const fakeUser = { uid: 'u1' }
    const fakeCred = { providerId: 'google.com' }
    const fakeResult = { user: fakeUser }
    linkWithCredential.mockResolvedValue(fakeResult)

    const out = await linkPendingCredential(fakeUser, fakeCred)

    expect(out).toBe(fakeResult)
    expect(linkWithCredential).toHaveBeenCalledWith(fakeUser, fakeCred)
  })
})

describe('RECOVERY_ERROR_CODE', () => {
  it('exports the Firebase collision code as a constant', () => {
    expect(RECOVERY_ERROR_CODE).toBe('auth/account-exists-with-different-credential')
  })
})
