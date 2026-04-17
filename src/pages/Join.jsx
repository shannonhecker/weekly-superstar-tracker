import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../firebase/auth'
import { getBoardByShareCode, joinBoard } from '../firebase/boards'

const Join = () => {
  const { code } = useParams()
  const { user, signInGuest } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Finding the board...')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const board = await getBoardByShareCode(code)
        if (!mounted) return
        if (!board) {
          setStatus("That invite link isn't valid. Ask for a new one.")
          setFailed(true)
          return
        }
        let uid = user?.uid
        if (!uid) {
          setStatus('Signing you in as a guest...')
          const { user: u } = await signInGuest()
          uid = u.uid
        }
        if (!board.memberIds.includes(uid)) {
          setStatus(`Joining ${board.name || 'the board'}...`)
          await joinBoard(board.id, uid)
        }
        navigate(`/board/${board.id}`, { replace: true })
      } catch (err) {
        if (!mounted) return
        setStatus(`Problem: ${err.message || 'please try again'}`)
        setFailed(true)
      }
    }
    run()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
      <div className="text-center" role="status" aria-live="polite">
        {!failed ? (
          <>
            <div
              className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"
              aria-hidden="true"
            />
            <p className="text-gray-600 font-bold">{status}</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3" aria-hidden="true">⚠️</div>
            <p className="text-gray-700 font-bold mb-4">{status}</p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500"
            >
              Go home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default Join
