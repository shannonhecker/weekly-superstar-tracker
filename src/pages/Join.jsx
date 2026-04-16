import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../firebase/auth'
import { getBoardByShareCode, joinBoard } from '../firebase/boards'

const Join = () => {
  const { code } = useParams()
  const { user, signInGuest } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Finding the board...')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const board = await getBoardByShareCode(code)
        if (!mounted) return
        if (!board) {
          setStatus('That invite link isn\'t valid. Ask for a new one.')
          return
        }
        let uid = user?.uid
        if (!uid) {
          setStatus('Signing you in...')
          const { user: u } = await signInGuest()
          uid = u.uid
        }
        if (!board.memberIds.includes(uid)) {
          await joinBoard(board.id, uid)
        }
        navigate(`/board/${board.id}`, { replace: true })
      } catch (err) {
        setStatus(`Problem: ${err.message}`)
      }
    }
    run()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-pet-bounce">🎉</div>
        <p className="text-gray-600 font-bold">{status}</p>
      </div>
    </div>
  )
}

export default Join
