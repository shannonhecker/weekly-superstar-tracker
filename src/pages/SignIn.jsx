import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../firebase/auth'
import { getBoardsForUser } from '../firebase/boards'

const SignIn = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await signIn(email, password)
      const boards = await getBoardsForUser(user.uid)
      if (boards.length === 0) navigate('/')
      else navigate(`/board/${boards[0].id}`)
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-body flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl">
        <h1 className="text-2xl font-black font-display mb-1 text-gray-800">Welcome back</h1>
        <p className="text-sm text-gray-400 font-semibold mb-5">Sign in to your board.</p>

        <label className="block text-xs font-extrabold text-gray-500 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none mb-3 focus:border-purple-400"
        />

        <label className="block text-xs font-extrabold text-gray-500 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none mb-4 focus:border-purple-400"
        />

        {error && <div className="text-red-500 text-xs font-bold mb-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-extrabold text-white text-base bg-gradient-to-r from-green-500 to-purple-500 shadow-lg shadow-purple-200 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-xs text-gray-500 font-semibold mt-4">
          No account? <Link to="/signup" className="text-purple-500 font-bold">Create one</Link>
        </p>
      </form>
    </div>
  )
}

export default SignIn
