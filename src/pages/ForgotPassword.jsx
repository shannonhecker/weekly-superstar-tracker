import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { formatAuthError } from '../lib/authErrors'

export default function ForgotPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const prefill = new URLSearchParams(location.search).get('email') || ''
  const [email, setEmail] = useState(prefill)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Enter your email to reset your password.')
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, trimmed)
      setSent(true)
    } catch (err) {
      // Email enumeration mitigation (audit S8): when Firebase reports
      // auth/user-not-found OR auth/invalid-email-against-database OR
      // similar "no such user" codes, still show the success state so
      // a malicious actor can't probe which emails are registered.
      // Real network/quota/internal errors still bubble up.
      const code = err?.code || err?.message || ''
      const SILENCE = new Set([
        'auth/user-not-found',
        'auth/invalid-email-verified', // less common, defensive
        'auth/email-not-found',
      ])
      if (SILENCE.has(code)) {
        // Log to devtools so we still see signal during testing without
        // leaking it to the page.
        console.warn('[forgot-password] silenced enumeration probe:', code)
        setSent(true)
      } else {
        setError(formatAuthError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        {sent ? (
          <>
            <div className="text-5xl text-center mb-3">✉️</div>
            <h1 className="text-2xl font-black font-display mb-1 text-center">Check your inbox</h1>
            <p className="text-gray-500 mb-5 text-sm text-center">
              If we have an account for <span className="font-bold text-gray-700">{email.trim()}</span>,
              the reset link is on its way. Follow it to set a new password.
            </p>
            <button
              onClick={() => navigate('/signin', { replace: true })}
              className="w-full py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-green-400 to-purple-500"
            >
              Back to sign in
            </button>
            <p className="text-center mt-4 text-xs text-gray-400">
              Didn't get it? Check spam, or{' '}
              <button
                type="button"
                onClick={() => { setSent(false) }}
                className="text-purple-600 font-bold"
              >
                try a different email
              </button>
              .
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <h1 className="text-2xl font-black font-display mb-1">Reset your password</h1>
            <p className="text-gray-400 mb-5 text-sm">
              Enter your email and we'll send you a link to reset it.
            </p>

            <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-2 rounded-xl bg-purple-50 outline-none font-bold text-gray-800"
            />

            {error && <p className="text-red-500 text-sm font-bold mt-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-green-400 to-purple-500 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <p className="text-center mt-4 text-sm text-gray-500">
              Remembered it? <Link to="/signin" className="text-purple-600 font-bold">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
