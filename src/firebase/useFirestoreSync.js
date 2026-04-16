import { useEffect, useRef, useState, useCallback } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from './config'

// Live sync hook for a single kid document. Returns current kid data + update fn.
export function useKidSync(boardId, kidId) {
  const [kid, setKid] = useState(null)
  const [loading, setLoading] = useState(true)
  const lastLocalWrite = useRef(0)

  useEffect(() => {
    if (!boardId || !kidId || !db) { setLoading(false); return }
    const ref = doc(db, 'boards', boardId, 'kids', kidId)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setKid({ id: snap.id, ...snap.data() })
      setLoading(false)
    }, (err) => {
      console.warn('Kid sync error:', err)
      setLoading(false)
    })
    return unsub
  }, [boardId, kidId])

  const update = useCallback(async (updates) => {
    if (!boardId || !kidId || !db) return
    lastLocalWrite.current = Date.now()
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kidId), updates)
    } catch (err) {
      console.warn('Kid update failed:', err)
    }
  }, [boardId, kidId])

  return { kid, loading, update }
}
