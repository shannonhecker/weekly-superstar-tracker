import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import Logo from '../components/Logo'
import EmptyStateScene from '../components/EmptyStateScene'

export default function Landing() {
  const { user, loading } = useAuth()
  const [boardId, setBoardId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    let cancelled = false
    ;(async () => {
      const q = query(collection(db, 'boards'), where('memberIds', 'array-contains', user.uid))
      const snap = await getDocs(q)
      if (cancelled) return
      if (!snap.empty) setBoardId(snap.docs[0].id)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [user])

  if (loading || (user && checking)) return null
  if (user && boardId) return <Navigate to={`/board/${boardId}`} replace />

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-earthy-ivory">
      <div className="bg-earthy-cream rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider max-w-md w-full text-center font-jakarta overflow-hidden">
        <div className="bg-earthy-ivory">
          <EmptyStateScene variant="welcome" />
        </div>
        <div className="p-8 pt-6">
        <div className="flex justify-center mb-3">
          <Logo size={56} />
        </div>
        <h1 className="text-3xl font-extrabold text-earthy-cocoa mb-2 tracking-tight">
          Winking Star
        </h1>
        <p className="text-earthy-cocoaSoft text-sm mb-7 leading-relaxed">
          A weekly achievement tracker the whole family can share.<br/>
          Track habits, earn badges, grow pets together.
        </p>
        <Link
          to="/signup"
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="block w-full mb-3 px-6 py-4 rounded-pill font-bold text-base hover:bg-[#4A2E25] active:scale-[0.99] transition-all"
        >
          Create a family board
        </Link>
        <Link
          to="/signin"
          style={{ color: '#5A3A2E', backgroundColor: '#F4C8A8' }}
          className="block w-full px-6 py-4 rounded-pill font-bold text-base hover:bg-[#EAB892] active:scale-[0.99] transition-all"
        >
          Sign in
        </Link>
        <p className="mt-5 text-xs text-earthy-cocoaSoft/70">
          Got an invite link? Just tap it — no account needed.
        </p>
        </div>
      </div>
    </div>
  )
}
