import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { createBoardForNewUser, findUserBoards } from '../lib/boards'
import { formatAuthError } from '../lib/authErrors'
import EmptyStateScene from '../components/EmptyStateScene'

// Guest entry point. Lets a visitor land on a real, working Board within
// one tap — no email required. Mirrors Join.jsx's anonymous-auth pattern
// so this is not a new auth path, just a new front door.
//
// Returning guests (same anon UID, second visit to /try) are routed to
// their existing demo board instead of seeding a duplicate. Once they
// upgrade via /signup?upgrade=1 the UID is preserved and this page is
// effectively retired for them.
export default function Try() {
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
        const existing = await findUserBoards(currentUser.uid)
        if (existing.length > 0) {
          if (!cancelled) navigate(`/board/${existing[0].id}`, { replace: true })
          return
        }
        const boardId = await createBoardForNewUser(currentUser, {
          theme: 'animals',
          kidName: '',
          birthday: '',
        })
        if (!cancelled) navigate(`/board/${boardId}`, { replace: true })
      } catch (err) {
        if (!cancelled) setError(formatAuthError(err))
      }
    })()
    return () => { cancelled = true }
  }, [loading, user, navigate])

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
                <p className="text-earthy-cocoa font-extrabold text-lg mb-1">Setting up your demo…</p>
                <p className="text-earthy-cocoaSoft text-sm font-bold">No account needed yet.</p>
              </>}
        </div>
      </div>
    </main>
  )
}
