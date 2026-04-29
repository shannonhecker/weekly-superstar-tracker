import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { formatAuthError } from '../lib/authErrors'
import PrimaryButton from '../components/PrimaryButton'

// Migrated to the earthy palette to match SignIn / SignUp / AuthAction.
// The legacy purple/grey treatment was the only auth screen still on
// the pre-Direction-B colours — visually jarring after sign-in shipped
// in the new tokens. Audit A3.

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
      // auth/user-not-found OR similar "no such user" codes, still show
      // the success state so a malicious actor can't probe which emails
      // are registered. Real network/quota errors still bubble up.
      const code = err?.code || err?.message || ''
      const SILENCE = new Set([
        'auth/user-not-found',
        'auth/invalid-email-verified',
        'auth/email-not-found',
      ])
      if (SILENCE.has(code)) {
        // Devtools signal during testing; doesn't leak to the page.
        // eslint-disable-next-line no-console
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
    <main id="main" className="min-h-screen bg-earthy-cream flex items-center justify-center px-5 py-8">
      <div className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-8 max-w-md w-full">
        {sent ? (
          <>
            <div className="text-5xl text-center mb-3" aria-hidden="true">✉️</div>
            <h1 className="font-display font-black text-earthy-cocoa text-3xl tracking-tight mb-2 text-center">
              Check your inbox
            </h1>
            <p className="text-earthy-cocoaSoft text-sm font-bold mb-6 text-center">
              If we have an account for <span className="text-earthy-cocoa">{email.trim()}</span>,
              the reset link is on its way. Follow it to set a new password.
            </p>
            <PrimaryButton onClick={() => navigate('/signin', { replace: true })}>
              Back to sign in
            </PrimaryButton>
            <p className="text-center mt-4 text-xs text-earthy-cocoaSoft font-bold">
              Didn't get it? Check spam, or{' '}
              <button
                type="button"
                onClick={() => { setSent(false) }}
                className="text-earthy-cocoa font-bold underline underline-offset-2 hover:text-earthy-cocoa/80 transition-colors"
              >
                try a different email
              </button>
              .
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h1 className="font-display font-black text-earthy-cocoa text-3xl tracking-tight mb-1">
              Reset your password
            </h1>
            <p className="text-earthy-cocoaSoft text-sm mb-6">
              Enter your email and we'll send you a link to reset it.
            </p>

            <label
              htmlFor="forgot-email"
              className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-2 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
            />

            {error && (
              <div role="alert" className="mb-3 px-4 py-3 rounded-xl bg-[#F8E5DF] text-[#8A3A2E] text-sm font-bold">
                {error}
              </div>
            )}

            <PrimaryButton type="submit" disabled={loading} className="mt-4">
              {loading ? 'Sending…' : 'Send reset link'}
            </PrimaryButton>

            <p className="text-center mt-4 text-sm text-earthy-cocoaSoft">
              Remembered it?{' '}
              <Link
                to="/signin"
                className="text-earthy-cocoa font-bold underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>

            {/* Need-help mailto matches the rest of the auth surface so the
                experience reads as a coherent set across SignIn, SignUp,
                AuthAction, and now ForgotPassword. */}
            <p className="text-center mt-3 text-xs text-earthy-cocoaSoft">
              <a
                href="mailto:hello@winkingstar.com?subject=Help%20resetting%20my%20Winking%20Star%20password"
                className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
              >
                Need help?
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
