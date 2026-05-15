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
  writeBatch,
} from 'firebase/firestore'
import { deleteObject, listAll, ref as storageRef } from 'firebase/storage'

import { db, storage } from './firebase'

export function deletionRequiresPassword(user) {
  return !!user?.providerData?.some((provider) => provider.providerId === 'password')
}

export async function deleteAccountCascade(user, password) {
  await reauthenticateForDeletion(user, password)

  const boardsSnap = await getDocs(
    query(collection(db, 'boards'), where('memberIds', 'array-contains', user.uid)),
  )

  for (const boardDoc of boardsSnap.docs) {
    const data = boardDoc.data()
    if (data.adminId === user.uid) {
      const kidsSnap = await getDocs(collection(db, 'boards', boardDoc.id, 'kids'))
      for (const kidDoc of kidsSnap.docs) {
        await deleteKidSubcollection(boardDoc.id, kidDoc.id, 'habits')
        await deleteKidSubcollection(boardDoc.id, kidDoc.id, 'weekHistory')
        await deleteKidStorage(boardDoc.id, kidDoc.id)
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

async function reauthenticateForDeletion(user, password) {
  const providerIds = (user.providerData || []).map((provider) => provider.providerId)

  if (providerIds.includes('password')) {
    if (!user.email) throw new Error('This account has no email associated with it.')
    if (!password) throw new Error('Enter your password to confirm.')
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email, password),
    )
    return
  }

  if (providerIds.includes('google.com')) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
    return
  }

  if (providerIds.includes('apple.com')) {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    await reauthenticateWithPopup(user, provider)
    return
  }

  throw new Error('Sign in again with the same provider before deleting this account.')
}

async function deleteKidSubcollection(boardId, kidId, subcollection) {
  const snap = await getDocs(collection(db, 'boards', boardId, 'kids', kidId, subcollection))
  if (snap.empty) return
  const batches = []
  let batch = writeBatch(db)
  let count = 0
  for (const docSnap of snap.docs) {
    batch.delete(docSnap.ref)
    count++
    if (count >= 500) {
      batches.push(batch)
      batch = writeBatch(db)
      count = 0
    }
  }
  if (count > 0) batches.push(batch)
  await Promise.all(batches.map((batchRef) => batchRef.commit()))
}

async function deleteKidStorage(boardId, kidId) {
  try {
    const listing = await listAll(storageRef(storage, `boards/${boardId}/kids/${kidId}`))
    await Promise.all(listing.items.map((itemRef) => deleteObject(itemRef)))
  } catch {
    // Best-effort: locked or already-deleted objects should not block account deletion.
  }
}
