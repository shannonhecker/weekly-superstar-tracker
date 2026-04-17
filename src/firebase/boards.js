import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc,
  query, where, limit, onSnapshot, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from './config'

const ADJECTIVES = ['happy', 'super', 'sunny', 'jolly', 'brave', 'mighty', 'zesty', 'cosmic', 'lucky', 'swift']
const NOUNS = ['lion', 'dragon', 'panda', 'tiger', 'falcon', 'otter', 'bear', 'wolf', 'shark', 'eagle']

export function generateShareCode() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 90) + 10
  return `${adj}-${noun}-${num}`
}

export async function createBoard(userId, boardName = 'Family Board') {
  const shareCode = generateShareCode()
  const boardRef = await addDoc(collection(db, 'boards'), {
    name: boardName,
    adminId: userId,
    memberIds: [userId],
    shareCode,
    createdAt: serverTimestamp(),
  })
  return { id: boardRef.id, shareCode }
}

export async function getBoardByShareCode(shareCode) {
  const q = query(
    collection(db, 'boards'),
    where('shareCode', '==', shareCode),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function getBoard(boardId) {
  const snap = await getDoc(doc(db, 'boards', boardId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getBoardsForUser(userId) {
  const q = query(collection(db, 'boards'), where('memberIds', 'array-contains', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function joinBoard(boardId, userId) {
  await updateDoc(doc(db, 'boards', boardId), {
    memberIds: arrayUnion(userId),
  })
}

export function subscribeBoard(boardId, callback) {
  return onSnapshot(doc(db, 'boards', boardId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
    else callback(null)
  })
}
