import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { findUserBoards } from '../lib/boards'
import LogoLoader from '../components/LogoLoader'
import SignUp from './SignUp'

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

  return <SignUp />
}
