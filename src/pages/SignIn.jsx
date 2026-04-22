import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { formatAuthError } from '../lib/authErrors'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-black font-display mb-1">Welcome back</h1>
        <p className="text-gray-400 mb-5 text-sm">Sign in to your board.</p>

        <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 rounded-xl bg-purple-50 outline-none font-bold text-gray-800"
        />

        <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-1 rounded-xl bg-purple-50 outline-none font-bold text-gray-800"
        />

        <div className="flex justify-end mb-2">
          <Link
            to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="text-xs text-purple-600 font-bold"
          >
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm font-bold mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-green-400 to-purple-500 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center mt-4 text-sm text-gray-500">
          No account? <Link to="/signup" className="text-purple-600 font-bold">Create one</Link>
        </p>
      </form>
    </div>
  )
}
