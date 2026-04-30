import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { findUserBoards } from '../lib/boards'
import Logo from '../components/Logo'
import LogoLoader from '../components/LogoLoader'
import ThemeCardArt from '../components/ThemeCardArt'

export default function Landing() {
  const { user, loading } = useAuth()
  const [boardId, setBoardId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    let cancelled = false
    ;(async () => {
      const boards = await findUserBoards(user.uid)
      if (cancelled) return
      // Earliest-by-createdAt — the user's original board, not a stray
      // duplicate. findUserBoards already sorts that way.
      if (boards.length > 0) setBoardId(boards[0].id)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [user])

  if (loading || (user && checking)) return <LogoLoader />
  if (user && boardId) return <Navigate to={`/board/${boardId}`} replace />

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-5 bg-earthy-ivory">
      <div className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider max-w-md w-full text-center font-jakarta overflow-hidden">
        <div className="w-[82%] mx-auto mt-6 mb-2">
          <ThemeCardArt themeKey="animals" />
        </div>
        <div className="p-8 pt-4">
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
        <Link
          to="/try"
          className="block mt-4 text-sm font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa underline underline-offset-4 transition-colors"
        >
          or try it first — no signup
        </Link>
        <p className="mt-4 text-xs text-earthy-cocoaSoft/70">
          Got an invite link? Just tap it — no account needed.
        </p>
        </div>
      </div>
    </main>
  )
}
