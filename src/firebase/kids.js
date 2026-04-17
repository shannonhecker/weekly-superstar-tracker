import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { ref as sref, listAll, deleteObject } from 'firebase/storage'
import { db, storage } from './config'

export const DEFAULT_ACTIVITIES = [
  { id: 'sleep', emoji: '😴', label: 'Sleep', color: '#7C6FF7' },
  { id: 'bath', emoji: '🛁', label: 'Bath', color: '#4ECDC4' },
  { id: 'teeth', emoji: '🪥', label: 'Teeth', color: '#45B7D1' },
  { id: 'breakfast', emoji: '🍳', label: 'Brekkie', color: '#FF9F43' },
  { id: 'shoes', emoji: '👟', label: 'Shoes', color: '#EE5A24' },
  { id: 'school-book', emoji: '📖', label: 'School', color: '#F7B731' },
  { id: 'fun-book', emoji: '📚', label: 'Reading', color: '#FC5C65' },
  { id: 'mandarin', emoji: '🀄', label: 'Mandarin', color: '#FF6348' },
  { id: 'walk', emoji: '🚶', label: 'Walk', color: '#26DE81' },
  { id: 'custom', emoji: '⭐', label: 'Special!', color: '#FD9644', isCustom: true },
]

export function kidsCollection(boardId) {
  return collection(db, 'boards', boardId, 'kids')
}

export async function createKid(boardId, kid) {
  const ref = await addDoc(kidsCollection(boardId), {
    name: kid.name,
    theme: kid.theme || 'football',
    photoUrl: kid.photoUrl || null,
    activities: kid.activities || DEFAULT_ACTIVITIES,
    order: kid.order ?? 0,
    checks: {},
    customLabel: '',
    badges: [],
    weekHistory: [],
    reward: null,
    weekKey: null,
    petIdx: null,
    eggIdx: null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateKid(boardId, kidId, updates) {
  await updateDoc(doc(db, 'boards', boardId, 'kids', kidId), updates)
}

export async function deleteKid(boardId, kidId) {
  // Best-effort: clean up any photos this kid uploaded. If it fails
  // (offline, rules mismatch, etc.) we still proceed with the Firestore
  // delete so the user's action isn't blocked.
  if (storage) {
    try {
      const folder = sref(storage, `boards/${boardId}/kids/${kidId}`)
      const listed = await listAll(folder)
      await Promise.all(listed.items.map((item) => deleteObject(item).catch(() => {})))
    } catch (e) {
      console.warn('Kid photo cleanup failed', kidId, e)
    }
  }
  await deleteDoc(doc(db, 'boards', boardId, 'kids', kidId))
}

export function subscribeKids(boardId, callback) {
  const q = query(kidsCollection(boardId), orderBy('order', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeKid(boardId, kidId, callback) {
  return onSnapshot(doc(db, 'boards', boardId, 'kids', kidId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
    else callback(null)
  })
}
