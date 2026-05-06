import {
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth'
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from './firebase'

// Mirrors weekly-superstar-ios/lib/deleteAccount.ts. Apple App Review requires
// in-app account deletion for any app with sign-in; iOS already complies, web
// did not until this file landed. Web supports three providers (email, Google,
// Apple) so re-auth branches by primary provider.

export function primaryProvider(user) {
  if (!user) return null
  const providers = user.providerData || []
  if (providers.some((p) => p.providerId === 'password')) return 'password'
  if (providers.some((p) => p.providerId === 'google.com')) return 'google.com'
  if (providers.some((p) => p.providerId === 'apple.com')) return 'apple.com'
  return providers[0]?.providerId || null
}

export async function reauthenticate(user, { password } = {}) {
  const provider = primaryProvider(user)
  if (provider === 'password') {
    if (!user.email) {
      throw new Error('This account has no email associated with it. Contact support to remove it.')
    }
    if (!password) {
      const err = new Error('Enter your password to confirm.')
      err.code = 'auth/missing-password'
      throw err
    }
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
    return
  }
  if (provider === 'google.com') {
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
    return
  }
  if (provider === 'apple.com') {
    const apple = new OAuthProvider('apple.com')
    apple.addScope('email')
    apple.addScope('name')
    await reauthenticateWithPopup(user, apple)
    return
  }
  throw new Error('Your sign-in method is not supported for in-app deletion. Contact support.')
}

// Iterates every board the user is a member of:
//   - admin path: cascade-delete kids subcollection then the board doc
//   - member path: arrayRemove uid from memberIds; board stays alive for the admin
// Then deletes the Firebase Auth user, which clears the session.
export async function deleteAccountCascade(user, { password } = {}) {
  if (!user) throw new Error('Not signed in.')

  await reauthenticate(user, { password })

  const boardsSnap = await getDocs(
    query(collection(db, 'boards'), where('memberIds', 'array-contains', user.uid)),
  )

  for (const boardDoc of boardsSnap.docs) {
    const data = boardDoc.data() || {}
    if (data.adminId === user.uid) {
      const kidsSnap = await getDocs(collection(db, 'boards', boardDoc.id, 'kids'))
      for (const kidDoc of kidsSnap.docs) {
        await deleteDoc(doc(db, 'boards', boardDoc.id, 'kids', kidDoc.id))
      }
      await deleteDoc(doc(db, 'boards', boardDoc.id))
    } else {
      await updateDoc(doc(db, 'boards', boardDoc.id), {
        memberIds: arrayRemove(user.uid),
      })
    }
  }

  await deleteUser(user)
}
