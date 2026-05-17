import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { createBoardForNewUser, findUserBoards } from '../lib/boards'
import { formatAuthError, isSilentAuthError } from '../lib/authErrors'
import { safeRedirect } from '../lib/safeRedirect'
import PrimaryButton from '../components/PrimaryButton'
import Logo from '../components/Logo'
import ThemeScene from '../components/ThemeScene'

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
  const [searchParams] = useSearchParams()
  const next = safeRedirect(searchParams.get('next'), '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (Date.now() < lockedUntil) {
      setError('Too many tries. Wait a minute, then try again.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setFailedAttempts(0)
      setLockedUntil(0)
      if (next) {
        navigate(next, { replace: true })
        return
      }
      // Existing email accounts always have a board (created at signup).
      // Landing handles the redirect for us.
      navigate('/', { replace: true })
    } catch (err) {
      const nextFailedAttempts = failedAttempts + 1
      setFailedAttempts(nextFailedAttempts)
      if (nextFailedAttempts >= 5) {
        setLockedUntil(Date.now() + 60 * 1000)
        setError('Too many tries. Wait a minute, then try again.')
      } else {
        setError(formatAuthError(err))
      }
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
      if (next) {
        navigate(next, { replace: true })
        return
      }
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
    <main id="main" className="min-h-screen bg-earthy-ivory px-5 py-6 sm:py-10 font-jakarta">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-5 lg:grid-cols-[1fr_0.86fr]">
        <section
          className="hidden overflow-hidden rounded-3xl border border-earthy-divider bg-earthy-card shadow-earthy-lifted lg:flex lg:flex-col"
          aria-label="Winking Star"
        >
          <div className="h-[320px] overflow-hidden">
            <ThemeScene themeKey="animals" height="320px" />
          </div>
          <div className="flex flex-1 flex-col justify-between p-8">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <Logo size={52} />
                <span className="text-2xl font-extrabold text-earthy-cocoa">
                  Winking Star
                </span>
              </div>
              <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-earthy-cocoa">
                Back to the family board.
              </h1>
              <p className="mt-4 max-w-lg text-base font-bold leading-relaxed text-earthy-cocoaSoft">
                Open the weekly chart, switch superstars, and keep today&apos;s stars moving with your child nearby.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {['Big taps', 'Weekly view', 'Pet pals'].map((label) => (
                <div key={label} className="rounded-2xl border border-earthy-divider bg-earthy-ivory px-3 py-3 text-sm font-extrabold text-earthy-cocoa">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="flex min-h-[calc(100vh-48px)] flex-col justify-center rounded-3xl border border-earthy-divider bg-earthy-card p-6 shadow-earthy-lifted sm:p-8 lg:min-h-[720px]"
        >
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <Logo size={48} />
            <div>
              <div className="text-xl font-extrabold text-earthy-cocoa">
                Winking Star
              </div>
              <div className="text-sm font-bold text-earthy-cocoaSoft">
                Family achievement board
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-earthy-cocoa sm:text-4xl">
            Sign in
          </h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-earthy-cocoaSoft sm:text-base">
            Use the parent account connected to your family board.
          </p>

          <div className="mt-7">
            <label htmlFor="signin-email" className="block text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft mb-2">
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[52px] w-full rounded-2xl border-2 border-earthy-divider bg-earthy-ivory px-4 py-3 text-base font-bold text-earthy-cocoa outline-none transition-colors placeholder:text-earthy-cocoaSoft/60 focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20"
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="signin-password" className="block text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft">
                Password
              </label>
              <Link
                to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-xs text-earthy-cocoaSoft hover:text-earthy-cocoa font-bold underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[52px] w-full rounded-2xl border-2 border-earthy-divider bg-earthy-ivory py-3 pl-4 pr-20 text-base font-bold text-earthy-cocoa outline-none transition-colors focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 min-h-10 -translate-y-1/2 rounded-pill px-3 text-xs font-extrabold text-earthy-cocoaSoft transition-colors hover:bg-earthy-cream hover:text-earthy-cocoa focus-visible:ring-2 focus-visible:ring-earthy-terracotta"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-2xl bg-[#F8E5DF] px-4 py-3 text-sm font-bold text-[#8A3A2E]">
              {error}
            </div>
          )}

          <PrimaryButton type="submit" disabled={loading} className="mt-6 min-h-[54px]">
            {loading ? 'Signing in...' : 'Sign in'}
          </PrimaryButton>

          <div className="my-6 flex items-center gap-3" role="presentation">
            <span className="h-px flex-1 bg-earthy-divider" />
            <span className="text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft">or</span>
            <span className="h-px flex-1 bg-earthy-divider" />
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={onApple}
              disabled={loading}
              aria-label="Continue with Apple"
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill border-2 border-earthy-divider bg-earthy-ivory px-4 py-3 text-sm font-extrabold text-earthy-cocoa transition-colors hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-divider"
            >
              <span aria-hidden="true" className="text-base">A</span>
              Continue with Apple
            </button>
            <button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              aria-label="Continue with Google"
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill border-2 border-earthy-divider bg-earthy-ivory px-4 py-3 text-sm font-extrabold text-earthy-cocoa transition-colors hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-divider"
            >
              <span aria-hidden="true" className="text-base">G</span>
              Continue with Google
            </button>
          </div>

          <p className="mt-7 text-center text-sm font-bold text-earthy-cocoaSoft">
            No account?{' '}
            <Link to="/signup" className="text-earthy-cocoa underline underline-offset-2">
              Create one
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-earthy-cocoaSoft">
            <a
              href="mailto:hello@winkingstar.com?subject=Help%20signing%20in%20to%20Winking%20Star"
              className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
            >
              Need help?
            </a>
          </p>
        </form>
      </div>
    </main>
  )
}
