import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { findUserBoards } from '../lib/boards'
import { formatAuthError, isSilentAuthError } from '../lib/authErrors'
import {
  extractRecoveryInfo,
  getExistingSignInMethods,
  linkPendingCredential,
} from '../lib/accountLinkRecovery'
import { safeRedirect } from '../lib/safeRedirect'
import { supportMailto } from '../lib/support'
import PrimaryButton from '../components/PrimaryButton'
import Logo from '../components/Logo'
import LinkAccountModal from '../components/LinkAccountModal'
import TrustPills from '../components/TrustPills'

const HERO_BASE = '/onboarding-art/intro-house'

// First-time OAuth users on the SignIn page have no board yet. Do not create
// one here: board creation collects child data and must go through onboarding's
// parental consent gate.
async function ensureBoardForOAuthUser(user) {
  const boards = await findUserBoards(user.uid)
  if (boards.length > 0) return boards[0].id
  const error = new Error('Create your family board first, then sign in here next time.')
  error.code = 'auth/no-family-board'
  throw error
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
  const [recovery, setRecovery] = useState(null)
  const [linking, setLinking] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)

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

  const completeOAuthSignIn = async (user) => {
    if (next) {
      navigate(next, { replace: true })
      return
    }
    const boardId = await ensureBoardForOAuthUser(user)
    navigate(`/board/${boardId}`, { replace: true })
  }

  const onOAuth = async (provider, attemptedProviderId) => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, provider)
      await completeOAuthSignIn(cred.user)
    } catch (err) {
      const info = extractRecoveryInfo(err, attemptedProviderId)
      if (info) {
        try {
          const existingMethods = await getExistingSignInMethods(info.email)
          setRecovery({ ...info, existingMethods })
          setShowEmailForm(true)
        } catch {
          setError(formatAuthError(err))
        }
      } else if (!isSilentAuthError(err)) {
        setError(formatAuthError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const onConfirmLink = async (originalProviderId) => {
    if (!recovery || linking) return
    setLinking(true)
    setRecoveryError('')
    try {
      const provider =
        originalProviderId === 'google.com'
          ? new GoogleAuthProvider()
          : (() => {
              const p = new OAuthProvider('apple.com')
              p.addScope('email')
              p.addScope('name')
              return p
            })()
      const cred = await signInWithPopup(auth, provider)
      await linkPendingCredential(cred.user, recovery.pendingCredential)
      setRecovery(null)
      await completeOAuthSignIn(cred.user)
    } catch (err) {
      if (!isSilentAuthError(err)) setRecoveryError(formatAuthError(err))
    } finally {
      setLinking(false)
    }
  }

  const onApple = () => {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    onOAuth(provider, 'apple.com')
  }
  const onGoogle = () => onOAuth(new GoogleAuthProvider(), 'google.com')

  return (
    <main id="main" className="min-h-screen bg-earthy-ivory px-5 py-6 sm:py-10 font-jakarta">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-5 lg:grid-cols-[1fr_0.86fr]">
        <section
          className="hidden overflow-hidden rounded-3xl border border-earthy-divider bg-earthy-card shadow-earthy-lifted lg:flex lg:flex-col"
          aria-label="Winking Star"
        >
          <div className="h-[320px] overflow-hidden bg-earthy-cream">
            <picture>
              <source
                type="image/webp"
                srcSet={`${HERO_BASE}-376w.webp 376w, ${HERO_BASE}-768w.webp 768w`}
                sizes="(min-width: 1024px) 540px, 100vw"
              />
              <img
                src={`${HERO_BASE}.png`}
                alt="Illustrated cozy house with a hot-air balloon floating above"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>
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
                Welcome back to your family board.
              </h1>
              <p className="mt-4 max-w-lg text-base font-bold leading-relaxed text-earthy-cocoaSoft">
                Open today's chart, add stars, and celebrate the wins waiting for your superstar.
              </p>
            </div>
            <TrustPills className="mt-8" />
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
            Keep today's stars moving from any device.
          </p>

          {/* Social auth: primary path per spec Q2 */}
          <div className="mt-7 grid gap-3">
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

          {/* Email-collapse toggle: defaults closed; expands on click */}
          <div className="mt-5 flex items-center gap-3" role="presentation">
            <span className="h-px flex-1 bg-earthy-divider" />
            <button
              type="button"
              onClick={() => setShowEmailForm((open) => !open)}
              aria-expanded={showEmailForm}
              aria-controls="signin-email-form"
              className="text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft hover:text-earthy-cocoa transition-colors"
            >
              {showEmailForm ? 'Hide email form' : 'Use email instead'}
            </button>
            <span className="h-px flex-1 bg-earthy-divider" />
          </div>

          {showEmailForm && (
            <div id="signin-email-form">
              <div className="mt-5">
                <label htmlFor="signin-email" className="block text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft mb-2">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required={showEmailForm}
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
                    required={showEmailForm}
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
                <div role="alert" className="mt-4 rounded-2xl bg-semantic-errorBg px-4 py-3 text-sm font-bold text-semantic-errorText">
                  {error}
                </div>
              )}

              <PrimaryButton type="submit" disabled={loading} className="mt-6 min-h-[54px]">
                {loading ? 'Signing in...' : 'Sign in'}
              </PrimaryButton>
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-earthy-divider bg-earthy-ivory p-4 text-center">
            <p className="text-sm font-extrabold text-earthy-cocoa">
              New to Winking Star?
            </p>
            <Link
              to="/signup?guest=1"
              className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center rounded-pill bg-earthy-cocoa px-4 py-3 text-sm font-extrabold text-earthy-cream shadow-earthy-soft transition-all hover:-translate-y-0.5 hover:bg-earthy-cocoaDark active:translate-y-0"
            >
              Try a sample board
            </Link>
            <p className="mt-3 text-xs font-bold text-earthy-cocoaSoft">
              Ready to save one? <Link to="/signup" className="underline underline-offset-2 hover:text-earthy-cocoa">Create account</Link>
            </p>
          </div>

          <p className="mt-3 text-center text-xs text-earthy-cocoaSoft">
            <a
              href={supportMailto('Help signing in to Winking Star')}
              className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
            >
              Need help?
            </a>
          </p>
        </form>
      </div>
      <LinkAccountModal
        open={!!recovery}
        email={recovery?.email}
        existingMethods={recovery?.existingMethods}
        attemptedProviderId={recovery?.attemptedProviderId}
        busy={linking}
        error={recoveryError}
        onConfirm={onConfirmLink}
        onClose={() => {
          if (linking) return
          setRecovery(null)
          setRecoveryError('')
        }}
      />
    </main>
  )
}
