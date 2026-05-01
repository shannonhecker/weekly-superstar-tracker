import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore + firebase/auth at module load. Tests can override
// individual function behavior per case via the returned mock fns.
const firestoreMocks = vi.hoisted(() => ({
  getDocs: vi.fn(),
  deleteDoc: vi.fn(async () => undefined),
  updateDoc: vi.fn(async () => undefined),
  collection: vi.fn((..._args) => ({ _kind: 'collection', _args })),
  doc: vi.fn((..._args) => ({ _kind: 'doc', _args })),
  query: vi.fn((..._args) => ({ _kind: 'query', _args })),
  where: vi.fn((..._args) => ({ _kind: 'where', _args })),
  arrayRemove: vi.fn((v) => ({ _kind: 'arrayRemove', v })),
}))

const authMocks = vi.hoisted(() => ({
  deleteUser: vi.fn(async () => undefined),
  reauthenticateWithCredential: vi.fn(async () => undefined),
  reauthenticateWithPopup: vi.fn(async () => undefined),
  EmailAuthProvider: { credential: vi.fn((email, pw) => ({ _kind: 'cred', email, pw })) },
  GoogleAuthProvider: vi.fn(function () { this._kind = 'google' }),
  OAuthProvider: vi.fn(function (id) {
    this._kind = 'oauth'
    this.id = id
    this.scopes = []
    this.addScope = (s) => this.scopes.push(s)
  }),
}))

vi.mock('firebase/firestore', () => firestoreMocks)
vi.mock('firebase/auth', () => authMocks)
vi.mock('./firebase', () => ({ db: { _kind: 'db' } }))

import { deleteAccountCascade, primaryProvider, reauthenticate } from './deleteAccount'

const passwordUser = {
  uid: 'user-1',
  email: 'me@example.com',
  providerData: [{ providerId: 'password' }],
}
const googleUser = {
  uid: 'user-2',
  email: 'me@google.com',
  providerData: [{ providerId: 'google.com' }],
}
const appleUser = {
  uid: 'user-3',
  email: 'me@privaterelay.appleid.com',
  providerData: [{ providerId: 'apple.com' }],
}

beforeEach(() => {
  Object.values(firestoreMocks).forEach((fn) => fn.mockClear?.())
  Object.values(authMocks).forEach((fn) => fn.mockClear?.())
  authMocks.EmailAuthProvider.credential.mockClear()
  firestoreMocks.getDocs.mockReset()
})

describe('primaryProvider', () => {
  it('returns password when email/password provider present', () => {
    expect(primaryProvider(passwordUser)).toBe('password')
  })
  it('returns google.com for Google-only accounts', () => {
    expect(primaryProvider(googleUser)).toBe('google.com')
  })
  it('returns apple.com for Apple-only accounts', () => {
    expect(primaryProvider(appleUser)).toBe('apple.com')
  })
  it('returns null for null user', () => {
    expect(primaryProvider(null)).toBe(null)
  })
  it('prefers password when user has linked multiple providers', () => {
    const linked = {
      providerData: [{ providerId: 'google.com' }, { providerId: 'password' }],
    }
    expect(primaryProvider(linked)).toBe('password')
  })
})

describe('reauthenticate', () => {
  it('uses EmailAuthProvider for password accounts', async () => {
    await reauthenticate(passwordUser, { password: 'secret' })
    expect(authMocks.EmailAuthProvider.credential).toHaveBeenCalledWith(
      'me@example.com',
      'secret',
    )
    expect(authMocks.reauthenticateWithCredential).toHaveBeenCalledTimes(1)
    expect(authMocks.reauthenticateWithPopup).not.toHaveBeenCalled()
  })

  it('throws missing-password if password account submits empty password', async () => {
    await expect(reauthenticate(passwordUser, { password: '' })).rejects.toThrow(
      /password/i,
    )
    expect(authMocks.reauthenticateWithCredential).not.toHaveBeenCalled()
  })

  it('uses popup for Google accounts', async () => {
    await reauthenticate(googleUser)
    expect(authMocks.reauthenticateWithPopup).toHaveBeenCalledTimes(1)
    expect(authMocks.reauthenticateWithCredential).not.toHaveBeenCalled()
  })

  it('uses popup with email/name scope for Apple accounts', async () => {
    await reauthenticate(appleUser)
    expect(authMocks.reauthenticateWithPopup).toHaveBeenCalledTimes(1)
    const providerArg = authMocks.reauthenticateWithPopup.mock.calls[0][1]
    expect(providerArg.scopes).toEqual(['email', 'name'])
  })
})

describe('deleteAccountCascade', () => {
  it('cascade-deletes admin boards (kids subcollection then board doc) and Auth user', async () => {
    firestoreMocks.getDocs
      // first call: boards query
      .mockResolvedValueOnce({
        docs: [
          { id: 'board-A', data: () => ({ adminId: 'user-1' }) },
        ],
      })
      // second call: kids subcollection of board-A
      .mockResolvedValueOnce({
        docs: [{ id: 'kid-1' }, { id: 'kid-2' }],
      })

    await deleteAccountCascade(passwordUser, { password: 'secret' })

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledTimes(3) // 2 kids + 1 board
    expect(firestoreMocks.updateDoc).not.toHaveBeenCalled()
    expect(authMocks.deleteUser).toHaveBeenCalledWith(passwordUser)
  })

  it('removes uid from memberIds for non-admin board memberships (admin path NOT taken)', async () => {
    firestoreMocks.getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'board-X', data: () => ({ adminId: 'someone-else' }) },
      ],
    })

    await deleteAccountCascade(passwordUser, { password: 'secret' })

    expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1)
    expect(firestoreMocks.deleteDoc).not.toHaveBeenCalled()
    expect(firestoreMocks.arrayRemove).toHaveBeenCalledWith('user-1')
    expect(authMocks.deleteUser).toHaveBeenCalledWith(passwordUser)
  })

  it('handles a mix of admin + member boards in one pass', async () => {
    firestoreMocks.getDocs
      .mockResolvedValueOnce({
        docs: [
          { id: 'board-A', data: () => ({ adminId: 'user-1' }) }, // admin
          { id: 'board-B', data: () => ({ adminId: 'other' }) }, // member
        ],
      })
      .mockResolvedValueOnce({ docs: [{ id: 'kid-1' }] }) // kids of board-A

    await deleteAccountCascade(passwordUser, { password: 'secret' })

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledTimes(2) // 1 kid + board-A
    expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1) // board-B leave
    expect(authMocks.deleteUser).toHaveBeenCalledTimes(1)
  })

  it('skips re-auth password requirement for OAuth users (Google)', async () => {
    firestoreMocks.getDocs.mockResolvedValueOnce({ docs: [] })
    await deleteAccountCascade(googleUser)
    expect(authMocks.reauthenticateWithPopup).toHaveBeenCalledTimes(1)
    expect(authMocks.deleteUser).toHaveBeenCalledWith(googleUser)
  })

  it('throws if user is null', async () => {
    await expect(deleteAccountCascade(null, { password: 'x' })).rejects.toThrow(
      /not signed in/i,
    )
    expect(authMocks.deleteUser).not.toHaveBeenCalled()
  })

  it('does NOT call deleteUser when re-auth fails', async () => {
    authMocks.reauthenticateWithCredential.mockRejectedValueOnce(
      Object.assign(new Error('wrong'), { code: 'auth/wrong-password' }),
    )
    await expect(
      deleteAccountCascade(passwordUser, { password: 'wrong' }),
    ).rejects.toThrow()
    expect(firestoreMocks.getDocs).not.toHaveBeenCalled()
    expect(authMocks.deleteUser).not.toHaveBeenCalled()
  })
})
