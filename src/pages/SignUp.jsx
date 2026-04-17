import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../firebase/auth'
import { createBoard } from '../firebase/boards'

const SignUp = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [boardName, setBoardName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await signUp(email, password, name)
      const { id } = await createBoard(user.uid, boardName || `${name}'s Family`)
      navigate(`/board/${id}`)
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-body flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl">
        <h1 className="text-2xl font-black font-display mb-1 text-gray-800">Create your board</h1>
        <p className="text-sm text-gray-400 font-semibold mb-5">Admin account — you can invite family after.</p>

        <label htmlFor="signup-name" className="block text-xs font-extrabold text-gray-500 mb-1">Your name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Shannon"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none mb-3 focus:border-purple-400"
        />

        <label htmlFor="signup-board" className="block text-xs font-extrabold text-gray-500 mb-1">Board name (optional)</label>
        <input
          id="signup-board"
          type="text"
          autoComplete="off"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder="e.g. The Hecker Family"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none mb-3 focus:border-purple-400"
        />

        <label htmlFor="signup-email" className="block text-xs font-extrabold text-gray-500 mb-1">Email</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none mb-3 focus:border-purple-400"
        />

        <label htmlFor="signup-password" className="block text-xs font-extrabold text-gray-500 mb-1">Password</label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none mb-4 focus:border-purple-400"
        />

        {error && <div className="text-red-500 text-xs font-bold mb-3" role="alert">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-extrabold text-white text-base bg-gradient-to-r from-green-500 to-purple-500 shadow-lg shadow-purple-200 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create board'}
        </button>

        <p className="text-center text-xs text-gray-500 font-semibold mt-4">
          Already have an account? <Link to="/signin" className="text-purple-500 font-bold">Sign in</Link>
        </p>
      </form>
    </div>
  )
}

export default SignUp
