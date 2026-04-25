import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import Logo from '../components/Logo'

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
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-3">
          <Logo size={72} />
        </div>
        <h1 className="text-3xl font-black font-display bg-gradient-to-br from-green-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent mb-2">
          Winking Star
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          A weekly achievement tracker the whole family can share.<br/>
          Track habits, earn badges, grow pets together.
        </p>
        <Link
          to="/signup"
          className="block w-full mb-3 px-6 py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-green-400 to-purple-500"
        >
          Create a family board
        </Link>
        <Link
          to="/signin"
          className="block w-full px-6 py-4 rounded-2xl font-bold text-gray-700 text-base bg-white border-2 border-gray-200"
        >
          Sign in
        </Link>
        <p className="mt-5 text-xs text-gray-400">
          Got an invite link? Just tap it — no account needed.
        </p>
      </div>
    </div>
  )
}
