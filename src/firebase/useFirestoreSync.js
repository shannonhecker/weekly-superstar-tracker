import { useEffect, useRef, useState, useCallback } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from './config'

// Live sync hook for a single kid document. Returns current kid data + update fn.
export function useKidSync(boardId, kidId) {
  const [kid, setKid] = useState(null)
  const [loading, setLoading] = useState(true)
  const lastLocalWrite = useRef(0)

  useEffect(() => {
    // Drop the previous kid's data immediately on id change so the
    // consumer (ChildTracker) doesn't briefly render stale data that
    // belongs to a different kid. Without this, switching from Leo to
    // Nathan causes `activeKid = liveKid || kid` to resolve to Leo for
    // the tens-of-milliseconds window before Nathan's snapshot lands.
    setKid(null)
    setLoading(true)
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
    console.log('[useKidSync] update on kidId=', kidId.slice(0, 6), 'updates=', Object.keys(updates).join(','))
    lastLocalWrite.current = Date.now()
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kidId), updates)
    } catch (err) {
      console.warn('Kid update failed:', err)
    }
  }, [boardId, kidId])

  return { kid, loading, update }
}
