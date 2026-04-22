import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { auth, db } from '../lib/firebase'
import { formatAuthError } from '../lib/authErrors'

export default function Join() {
  const { code } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    let cancelled = false
    ;(async () => {
      try {
        let currentUser = user
        if (!currentUser) {
          const cred = await signInAnonymously(auth)
          currentUser = cred.user
        }

        const q = query(collection(db, 'boards'), where('shareCode', '==', code))
        const snap = await getDocs(q)
        if (snap.empty) {
          if (!cancelled) setError('That invite link is no longer valid.')
          return
        }
        const board = snap.docs[0]
        const data = board.data()
        if (!data.memberIds || !data.memberIds.includes(currentUser.uid)) {
          await updateDoc(doc(db, 'boards', board.id), {
            memberIds: arrayUnion(currentUser.uid),
          })
        }
        if (!cancelled) navigate(`/board/${board.id}`, { replace: true })
      } catch (err) {
        if (!cancelled) setError(formatAuthError(err))
      }
    })()
    return () => { cancelled = true }
  }, [loading, user, code, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-5">
      <div>
        <div className="text-5xl mb-3">🎉</div>
        {error
          ? <p className="text-red-500 font-bold">{error}</p>
          : <p className="text-gray-500 font-bold">Joining the board…</p>}
      </div>
    </div>
  )
}
