import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { auth, db } from '../lib/firebase'
import { formatAuthError } from '../lib/authErrors'
import EmptyStateScene from '../components/EmptyStateScene'

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
    <main id="main" className="min-h-screen flex items-center justify-center text-center px-5 bg-earthy-ivory font-jakarta">
      <div className="bg-earthy-cream rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider max-w-md w-full overflow-hidden">
        <div className="bg-earthy-ivory">
          <EmptyStateScene variant="joining" />
        </div>
        <div className="p-8 pt-6">
          {error
            ? <p className="text-earthy-cocoa font-extrabold text-lg">{error}</p>
            : <>
                <p className="text-earthy-cocoa font-extrabold text-lg mb-1">Joining the board…</p>
                <p className="text-earthy-cocoaSoft text-sm font-bold">Hang tight, we're getting you in.</p>
              </>}
        </div>
      </div>
    </main>
  )
}
