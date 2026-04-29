import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { findUserBoards } from '../lib/boards'
import { formatAuthError, isSilentAuthError } from '../lib/authErrors'
import { createBoardForNewUser } from './SignUp'
import PrimaryButton from '../components/PrimaryButton'

// First-time OAuth users on the SignIn page have no board yet — give them
// sensible defaults so they land on a working board instead of the marketing
// Landing page. Theme + kid name can be edited from the board itself.
// Tradeoff documented in PR description: brand-new OAuth-via-SignIn users
// skip the theme picker and start with the first theme + their displayName.
async function ensureBoardForOAuthUser(user) {
  const boards = await findUserBoards(user.uid)
  if (boards.length > 0) return boards[0].id
  return createBoardForNewUser(user, {
    theme: null, // helper falls back to the first theme in THEMES
    kidName: user.displayName || 'Your kid',
    birthday: '',
  })
}

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      // Existing email accounts always have a board (created at signup).
      // Landing handles the redirect for us.
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const onOAuth = async (provider) => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, provider)
      const boardId = await ensureBoardForOAuthUser(cred.user)
      navigate(`/board/${boardId}`, { replace: true })
    } catch (err) {
      if (!isSilentAuthError(err)) setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const onApple = () => {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    onOAuth(provider)
  }
  const onGoogle = () => onOAuth(new GoogleAuthProvider())

  return (
    <main id="main" className="min-h-screen bg-earthy-cream flex items-center justify-center px-5 py-8">
      <form
        onSubmit={onSubmit}
        className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-8 max-w-md w-full"
      >
        <h1 className="font-display font-black text-earthy-cocoa text-3xl tracking-tight mb-1">
          Welcome back
        </h1>
        <p className="text-earthy-cocoaSoft text-sm mb-6">Sign in to your board.</p>

        <label htmlFor="signin-email" className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
        />

        <label htmlFor="signin-password" className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-2 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
        />

        <div className="flex justify-end mb-2">
          <Link
            to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="text-xs text-earthy-cocoaSoft hover:text-earthy-cocoa font-bold underline underline-offset-2 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div role="alert" className="mb-3 px-4 py-3 rounded-xl bg-[#F8E5DF] text-[#8A3A2E] text-sm font-bold">
            {error}
          </div>
        )}

        <PrimaryButton type="submit" disabled={loading} className="mt-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>

        {/* Divider — same rule as SignUp screen 4 so the two screens read as a pair. */}
        <div className="flex items-center gap-3 my-6" role="presentation">
          <span className="flex-1 h-px bg-earthy-divider" />
          <span className="text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft">or</span>
          <span className="flex-1 h-px bg-earthy-divider" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onApple}
            disabled={loading}
            aria-label="Continue with Apple"
            className="w-full py-3.5 rounded-pill bg-earthy-ivory border-2 border-earthy-divider text-earthy-cocoa font-bold text-sm hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-divider transition-colors flex items-center justify-center gap-2"
          >
            <span aria-hidden="true"></span> Continue with Apple
          </button>
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            aria-label="Continue with Google"
            className="w-full py-3.5 rounded-pill bg-earthy-ivory border-2 border-earthy-divider text-earthy-cocoa font-bold text-sm hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-divider transition-colors flex items-center justify-center gap-2"
          >
            <span aria-hidden="true">G</span> Continue with Google
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-earthy-cocoaSoft">
          No account?{' '}
          <Link to="/signup" className="text-earthy-cocoa font-bold underline underline-offset-2">
            Create one
          </Link>
        </p>

        <p className="text-center mt-3 text-xs text-earthy-cocoaSoft">
          <a
            href="mailto:hello@winkingstar.com?subject=Help%20signing%20in%20to%20Winking%20Star"
            className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
          >
            Need help?
          </a>
        </p>
      </form>
    </main>
  )
}
