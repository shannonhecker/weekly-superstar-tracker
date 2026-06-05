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
import LocaleSelectorButton from '../components/LocaleSelectorButton'
import LinkAccountModal from '../components/LinkAccountModal'
import TrustPills from '../components/TrustPills'
import ProductPreview from '../components/wizard/ProductPreview'
import { useI18n } from '../lib/i18n'

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
  const { t } = useI18n()
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
    <main id="main" className="min-h-screen bg-earthy-card font-jakarta text-earthy-cocoa">
      <div className="fixed right-4 top-4 z-20">
        <LocaleSelectorButton compact />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)] lg:gap-14 lg:py-10">
          <div className="order-2 hidden min-w-0 lg:order-1 lg:block">
            <ProductPreview variant="board" className="mx-auto max-w-[560px]" />
          </div>

          <form
            onSubmit={onSubmit}
            className="order-1 mx-auto w-full max-w-md text-center lg:order-2"
          >
            <div className="mx-auto mb-6 max-w-md lg:hidden">
              <ProductPreview compact variant="board" />
            </div>

            <div className="mb-6 flex items-center justify-center gap-3">
              <Logo size={48} />
              <span className="text-2xl font-black text-earthy-cocoa">{t('brand.name')}</span>
            </div>

            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-normal text-earthy-cocoa sm:text-5xl">
              {t('signin.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base font-bold leading-relaxed text-earthy-cocoaSoft sm:text-lg">
              {t('signin.subtitle')}
            </p>
            <TrustPills className="mt-5" />

            {/* Social auth — primary path per spec Q2 */}
            <div className="mt-8 grid gap-3">
              <button
                type="button"
                onClick={onApple}
                disabled={loading}
                aria-label={t('signin.apple')}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill border border-earthy-dividerCream bg-earthy-card px-4 py-3 text-sm font-extrabold text-earthy-cocoa transition-colors hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-dividerCream"
              >
                <span aria-hidden="true" className="text-base">A</span>
                {t('signin.apple')}
              </button>
              <button
                type="button"
                onClick={onGoogle}
                disabled={loading}
                aria-label={t('signin.google')}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill border border-earthy-dividerCream bg-earthy-card px-4 py-3 text-sm font-extrabold text-earthy-cocoa transition-colors hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-dividerCream"
              >
                <span aria-hidden="true" className="text-base">G</span>
                {t('signin.google')}
              </button>
            </div>

            {/* Email-collapse toggle — defaults closed; expands on click */}
            <div className="mt-5 flex items-center gap-3" role="presentation">
              <span className="h-px flex-1 bg-earthy-dividerCream" />
              <button
                type="button"
                onClick={() => setShowEmailForm((open) => !open)}
                aria-expanded={showEmailForm}
                aria-controls="signin-email-form"
                className="text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft hover:text-earthy-cocoa transition-colors"
              >
                {showEmailForm ? t('signin.hideEmail') : t('signin.useEmail')}
              </button>
              <span className="h-px flex-1 bg-earthy-dividerCream" />
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-2xl bg-semantic-errorBg px-4 py-3 text-left text-sm font-bold text-semantic-errorText">
                {error}
              </div>
            )}

            {showEmailForm && (
              <div id="signin-email-form" className="text-left">
                <div className="mt-5">
                  <label htmlFor="signin-email" className="block text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft mb-2">
                    {t('signin.email')}
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    required={showEmailForm}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-[52px] w-full rounded-2xl border border-earthy-dividerCream bg-earthy-card px-4 py-3 text-base font-bold text-earthy-cocoa outline-none transition-colors placeholder:text-earthy-cocoaSoft/60 focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20"
                  />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="signin-password" className="block text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft">
                      {t('signin.password')}
                    </label>
                    <Link
                      to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                      className="text-xs text-earthy-cocoaSoft hover:text-earthy-cocoa font-bold underline underline-offset-2 transition-colors"
                    >
                      {t('signin.forgot')}
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
                      className="min-h-[52px] w-full rounded-2xl border border-earthy-dividerCream bg-earthy-card py-3 pl-4 pr-20 text-base font-bold text-earthy-cocoa outline-none transition-colors focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 min-h-10 -translate-y-1/2 rounded-pill px-3 text-xs font-extrabold text-earthy-cocoaSoft transition-colors hover:bg-earthy-cream hover:text-earthy-cocoa focus-visible:ring-2 focus-visible:ring-earthy-terracotta"
                      aria-label={showPassword ? t('signin.hidePassword') : t('signin.showPassword')}
                    >
                      {showPassword ? t('signin.hide') : t('signin.show')}
                    </button>
                  </div>
                </div>

                <PrimaryButton type="submit" disabled={loading} className="mt-6 min-h-[54px]">
                  {loading ? t('signin.signingIn') : t('signin.title')}
                </PrimaryButton>
              </div>
            )}

            <div className="mt-8 rounded-3xl border border-earthy-dividerCream bg-white/55 p-4">
              <p className="text-sm font-extrabold text-earthy-cocoaSoft">
                {t('signin.new')}
              </p>
              <Link
                to="/signup?guest=1"
                className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-pill bg-earthy-cocoa px-5 py-3 text-sm font-extrabold text-earthy-ivory shadow-earthy-soft transition-all hover:-translate-y-0.5 hover:bg-earthy-cocoaDark active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
              >
                {t('signin.trySample')}
              </Link>
              <p className="mt-3 text-xs font-bold text-earthy-cocoaSoft">
                {t('signin.ready')}{' '}
                <Link to="/signup" className="text-earthy-cocoa underline underline-offset-2">
                  {t('signin.create')}
                </Link>
              </p>
            </div>

            <p className="mt-5 text-xs text-earthy-cocoaSoft">
              <a
                href={supportMailto('Help signing in to Winking Star')}
                className="underline underline-offset-2 transition-colors hover:text-earthy-cocoa"
              >
                {t('signin.needHelp')}
              </a>
            </p>
          </form>
        </section>
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
