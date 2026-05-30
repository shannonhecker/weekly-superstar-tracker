import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithCredential,
  linkWithPopup,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth'
import { createBoardForNewUser, findUserBoards } from '../lib/boards'
import { auth } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { THEMES } from '../lib/themes'
import ThemeBannerArt from '../components/ThemeBannerArt'
import ProductPreview from '../components/wizard/ProductPreview'
import { flagUpgradeSuccess } from '../lib/upgrade-flag'
import { formatAuthError, isSilentAuthError } from '../lib/authErrors'
import {
  extractRecoveryInfo,
  getExistingSignInMethods,
  linkPendingCredential,
} from '../lib/accountLinkRecovery'
import { safeRedirect } from '../lib/safeRedirect'
import { supportMailto } from '../lib/support'
import PrimaryButton from '../components/PrimaryButton'
import ParentConsentGate from '../components/ParentConsentGate'
import LinkAccountModal from '../components/LinkAccountModal'
import EarthyDatePicker from '../components/EarthyDatePicker'
import WizardShell from '../components/wizard/WizardShell'
import WizardStepCard from '../components/wizard/WizardStepCard'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import TrustPills from '../components/TrustPills'

// Direction B onboarding — 4 self-paced steps that replace the legacy single-form
// signup. The page intentionally renders without a heavy white card: just cream,
// generous breathing room, and one decision per screen. Step state is local —
// no extra routes — so back/next preserves selections without re-mounting.
//
// `?guest=1` runs the full wizard but step 4 is a "Start your board" CTA
// instead of credentials — on submit we signInAnonymously + create a board
// using the picked theme/kid/birthday. Same onboarding parity as a real
// signup, just without the email gate.
//
// `?upgrade=1` short-circuits the wizard: the user is already an anonymous
// guest with a seeded board, so we skip steps 1-3 and jump straight to
// credentials, then call linkWithCredential / linkWithPopup to convert
// the anonymous account in place — UID and memberIds are preserved.
const TOTAL_STEPS = 4

export default function SignUp() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const isUpgrade = searchParams.get('upgrade') === '1'
  const isGuest = searchParams.get('guest') === '1' && !isUpgrade
  const next = safeRedirect(searchParams.get('next'), '')
  const isInviteSignup = next.startsWith('/join/') && !isUpgrade

  // ?upgrade=1 only makes sense for anonymous guests. If a fully signed-in
  // user lands here (e.g., bookmark, stale link), route them to their
  // existing board. If a signed-out user lands here (anonymous session
  // expired or never existed), drop them onto the regular wizard so they
  // pick theme + kid name properly instead of a default-named board.
  useEffect(() => {
    if (!isUpgrade || authLoading) return
    let cancelled = false
    if (user && !user.isAnonymous) {
      ;(async () => {
        const existing = await findUserBoards(user.uid)
        if (cancelled) return
        navigate(existing[0] ? `/board/${existing[0].id}` : '/', { replace: true })
      })()
      return () => { cancelled = true }
    }
    if (!user) {
      navigate('/signup', { replace: true })
    }
  }, [isUpgrade, authLoading, user, navigate])

  // Upgrade flow skips the wizard — the guest already has a seeded board
  // from /try, so theme + kid name are already chosen. Drop straight to
  // step 4 (the credentials screen).
  const [step, setStep] = useState(isUpgrade || isInviteSignup ? TOTAL_STEPS : 1)
  // Track previous step so we know whether to slide forwards or backwards.
  const [direction, setDirection] = useState('forward')
  const prevStepRef = useRef(isUpgrade || isInviteSignup ? TOTAL_STEPS : 1)

  // Onboarding answers — preserved across step navigation.
  const [theme, setTheme] = useState(null)
  const [kidName, setKidName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [parentConsent, setParentConsent] = useState(false)

  // Final-step credentials.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recovery, setRecovery] = useState(null)
  const [linking, setLinking] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')

  useEffect(() => {
    const prev = prevStepRef.current
    setDirection(step >= prev ? 'forward' : 'back')
    prevStepRef.current = step
  }, [step])

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const goBack = () => setStep((s) => Math.max(1, s - 1))
  const goGuest = () => {
    setError('')
    if (!isGuest) navigate('/signup?guest=1')
    setStep((s) => (s === 1 ? 2 : s))
  }

  const onCreate = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    if (!isGuest && password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (!isUpgrade && !isInviteSignup && !parentConsent) {
      setError('A grown-up needs to accept the family data notice before creating a board.')
      return
    }
    setLoading(true)
    try {
      // Upgrade path: anonymous guest converting to email/password. Preserves
      // UID + memberIds + the demo board they already seeded at /try.
      if (isUpgrade && auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email.trim(), password)
        const linked = await linkWithCredential(auth.currentUser, credential)
        const existing = await findUserBoards(linked.user.uid)
        flagUpgradeSuccess()
        navigate(existing[0] ? `/board/${existing[0].id}` : '/', { replace: true })
        return
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (next) {
        navigate(next, { replace: true })
        return
      }
      const boardId = await createBoardForNewUser(cred.user, {
        theme,
        kidName,
        birthday,
        parentConsentAccepted: parentConsent,
      })
      navigate(`/board/${boardId}`, { replace: true })
    } catch (err) {
      setError(friendlyAuthError(err, isUpgrade))
    } finally {
      setLoading(false)
    }
  }

  // OAuth signups land here from screen 4, where theme + kid name are already
  // collected from screens 2 & 3. Critical: a returning user (already has an
  // account + board) must NOT get a brand-new board created on top of their
  // existing data. Without this guard, signing in via Google/Apple from the
  // /signup flow orphans the original board and the user perceives data loss.
  // (One real user lost visibility of "The Hecker Family" board this way on
  // 2026-04-28 — board still in Firestore but app routed to a fresh duplicate.)
  const completeOAuthSignUp = async (user) => {
    if (next) {
      navigate(next, { replace: true })
      return
    }
    const existing = await findUserBoards(user.uid)
    if (existing.length > 0) {
      navigate(`/board/${existing[0].id}`, { replace: true })
      return
    }
    if (!parentConsent) {
      setError('A grown-up needs to accept the family data notice before creating a board.')
      return
    }
    const boardId = await createBoardForNewUser(user, {
      theme,
      kidName,
      birthday,
      parentConsentAccepted: parentConsent,
    })
    navigate(`/board/${boardId}`, { replace: true })
  }

  const onOAuth = async (provider, attemptedProviderId) => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      // Upgrade path: link the OAuth provider to the existing anonymous user
      // so the UID survives. Skip the duplicate-board guard — by definition
      // we already have a board (the demo seeded at /try).
      if (isUpgrade && auth.currentUser?.isAnonymous) {
        const linked = await linkWithPopup(auth.currentUser, provider)
        const existing = await findUserBoards(linked.user.uid)
        flagUpgradeSuccess()
        navigate(existing[0] ? `/board/${existing[0].id}` : '/', { replace: true })
        return
      }
      const cred = await signInWithPopup(auth, provider)
      await completeOAuthSignUp(cred.user)
    } catch (err) {
      const info = !isUpgrade ? extractRecoveryInfo(err, attemptedProviderId) : null
      if (info) {
        try {
          const existingMethods = await getExistingSignInMethods(info.email)
          setRecovery({ ...info, existingMethods })
        } catch {
          setError(friendlyAuthError(err, isUpgrade))
        }
      } else if (!isSilentAuthError(err)) {
        setError(friendlyAuthError(err, isUpgrade))
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
      await completeOAuthSignUp(cred.user)
    } catch (err) {
      if (!isSilentAuthError(err)) setRecoveryError(friendlyAuthError(err, isUpgrade))
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

  // Surface a friendlier message in upgrade mode when the parent's email
  // (or Google/Apple account) is already a Winking Star user. The "Use
  // existing account" link below the form is the action — this just tells
  // them why their input bounced.
  function friendlyAuthError(err, upgrading) {
    const code = err?.code
    if (upgrading && (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use')) {
      return 'This email is already a Winking Star account. Use it below ↓'
    }
    return formatAuthError(err)
  }

  // Guest path: signInAnonymously + seed a board using the wizard answers.
  // Same kid/board shape as a real signup — only the credential is anonymous.
  // Defends against a non-anonymous user hitting ?guest=1 by mistake: if
  // they're already signed in for real, route to their existing board
  // instead of replacing their session with an anon UID.
  const onGuestStart = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        const existing = await findUserBoards(auth.currentUser.uid)
        navigate(existing[0] ? `/board/${existing[0].id}` : '/', { replace: true })
        return
      }
      let currentUser = auth.currentUser
      if (!currentUser) {
        const cred = await signInAnonymously(auth)
        currentUser = cred.user
      }
      // Returning anonymous user with a board already → don't seed twice.
      const existing = await findUserBoards(currentUser.uid)
      if (existing.length > 0) {
        navigate(`/board/${existing[0].id}`, { replace: true })
        return
      }
      if (!parentConsent) {
        setError('A grown-up needs to accept the family data notice before starting a board.')
        return
      }
      const boardId = await createBoardForNewUser(currentUser, {
        theme,
        kidName,
        birthday,
        parentConsentAccepted: parentConsent,
      })
      navigate(`/board/${boardId}`, { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  // Subtle slide+fade. Tailwind transition utilities on a key'd wrapper —
  // re-mount per step keeps each screen's enter animation predictable.
  const enterClasses =
    direction === 'forward'
      ? 'animate-[onb-slide-in-right_220ms_ease-out]'
      : 'animate-[onb-slide-in-left_220ms_ease-out]'

  return (
    <WizardShell step={step} direction={direction}>
    <main
      id="main"
      className="min-h-screen flex flex-col px-5 pb-6 relative bg-earthy-card lg:min-h-[720px] lg:px-0 lg:py-8"
    >
      {/* Inline keyframes — keeps the file self-contained without touching tailwind config.
          Scoped to (prefers-reduced-motion: no-preference) so reduced-motion users
          get no enter animation: the .animate-[...] class still applies but the
          referenced keyframes don't exist for them, so each step renders immediately
          without the slide-fade. Audit A6. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes onb-slide-in-right {
            from { opacity: 0; transform: translate3d(16px, 0, 0); }
            to   { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          @keyframes onb-slide-in-left {
            from { opacity: 0; transform: translate3d(-16px, 0, 0); }
            to   { opacity: 1; transform: translate3d(0, 0, 0); }
          }
        }
      `}</style>

      {/* Top bar — back link (steps 2-4) + step counter on the right for orientation.
          It stays in normal layout flow so the row has breathing room above
          the card/banner instead of overlaying the full-bleed artwork. Hidden
          in upgrade mode: there's no wizard to step back through and the
          "4/4" counter would be confusing for a one-screen flow. */}
      {step > 1 && !isUpgrade && !isInviteSignup && (
        <div className="z-10 w-full max-w-lg mx-auto pt-5 mb-5 lg:pt-0">
          <div className="mx-auto flex min-h-[28px] w-full max-w-lg items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="text-earthy-cocoaSoft hover:text-earthy-cocoa font-bold text-sm flex items-center gap-1 transition-colors"
                aria-label="Go to previous step"
              >
                <span aria-hidden="true">←</span> Back
              </button>
            ) : <span />}
            <div
              className="flex items-center gap-1.5"
              role="progressbar"
              aria-label={`Step ${step} of ${TOTAL_STEPS}`}
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
            >
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={[
                    'block h-1.5 rounded-full transition-all',
                    i + 1 <= step ? 'w-6 bg-earthy-cocoa' : 'w-1.5 bg-earthy-divider',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-start justify-center w-full lg:items-center">
        <div key={step} className={`w-full max-w-lg ${enterClasses}`}>
          {step === 1 && (
            <StepIntro
              isGuest={isGuest}
              onStart={goNext}
              onTryGuest={!isGuest && !isUpgrade && !isInviteSignup ? goGuest : null}
            />
          )}
          {step === 2 && (
            <StepTheme
              selected={theme}
              onSelect={setTheme}
              onContinue={goNext}
            />
          )}
          {step === 3 && (
            <StepKid
              name={kidName}
              setName={setKidName}
              birthday={birthday}
              setBirthday={setBirthday}
              parentConsent={parentConsent}
              onConsent={() => setParentConsent(true)}
              onNext={goNext}
              onSkip={() => { setBirthday(''); goNext() }}
            />
          )}
          {step === 4 && isGuest && (
            <StepGuestStart
              kidName={kidName}
              error={error}
              loading={loading}
              onStart={onGuestStart}
            />
          )}
          {step === 4 && !isGuest && (
            <StepAccount
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
              onSubmit={onCreate}
              onApple={onApple}
              onGoogle={onGoogle}
              isUpgrade={isUpgrade}
              isInviteSignup={isInviteSignup}
              onTryGuest={!isUpgrade && !isInviteSignup ? goGuest : null}
            />
          )}
        </div>
      </div>

      {/* Sign-in escape hatch lives outside the per-step container so it's
          always reachable. In upgrade mode the framing is different: the
          parent isn't a brand-new visitor, they're an anon guest who may
          already have a Winking Star account elsewhere. Clicking the link
          will throw away their demo board, so we say so plainly. */}
      <p className="w-full max-w-lg mx-auto text-center text-sm text-earthy-cocoaSoft mt-6">
        {isUpgrade ? (
          <>
            Already a member?{' '}
            <Link to="/signin" className="text-earthy-cocoa font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill">
              Use your existing account →
            </Link>
            <br />
            <span className="text-xs">(your demo won't transfer)</span>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link to="/signin" className="text-earthy-cocoa font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill">
              Sign in
            </Link>
          </>
        )}
      </p>
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
    </WizardShell>
  )
}

/* ---------- Step 4 (guest) — start without an account ---------- */
function StepGuestStart({ kidName, error, loading, onStart }) {
  const trimmed = (kidName || '').trim()
  return (
    <div className="pt-2">
      <WizardStepCard illustration="intro-cake" heroHeight={178}>
        <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
          Ready when you are.
        </h2>
        <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-7">
          {trimmed
            ? `${trimmed}’s board is set up. You can save it with an email any time.`
            : 'Your board is set up. You can save it with an email any time.'}
        </p>

        {error && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-semantic-errorBg text-semantic-errorText text-sm font-bold">
            {error}
          </div>
        )}

        <PrimaryButton type="button" onClick={onStart} disabled={loading} aria-disabled={loading}>
          {loading ? 'Setting up…' : 'Start your board'}
        </PrimaryButton>
      </WizardStepCard>
    </div>
  )
}

/* ---------- Step 1 — value prop ---------- */
function StepIntro({ isGuest, onStart, onTryGuest }) {
  return (
    <div className="text-center">
      <div className="mb-6 max-w-md mx-auto lg:hidden">
        <ProductPreview compact />
      </div>
      <div className="mb-5 flex items-center justify-center gap-3">
        <Logo size={48} />
        <span className="text-2xl font-black text-earthy-cocoa">Winking Star</span>
      </div>
      <h1 className="font-display font-black text-earthy-cocoa text-4xl sm:text-5xl tracking-tight leading-[1.05] mb-5">
        Meet your weekly superstar.
      </h1>
      <p className="text-earthy-cocoaSoft text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-5">
        <span className="block text-xl font-black leading-snug text-earthy-cocoa sm:text-2xl">
          A family achievement board.
        </span>
        <span className="mt-3 block">
          Open the weekly chart, switch superstars, and keep today&apos;s stars moving with your child nearby.
        </span>
      </p>
      <TrustPills className="mb-4" />
      <p className="mb-9 text-[11px] font-extrabold uppercase tracking-[0.12em] text-earthy-cocoaSoft sm:text-xs">
        Web app · Also available on iPhone
      </p>
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-pill bg-earthy-cocoa text-earthy-cream font-bold text-base shadow-earthy-soft hover:bg-earthy-cocoaDark hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all"
        >
          {isGuest ? 'Set up a test board' : 'Start'} <span aria-hidden="true">▶</span>
        </button>
        {onTryGuest ? (
          <button
            type="button"
            onClick={onTryGuest}
            className="text-sm font-extrabold text-earthy-cocoaSoft underline underline-offset-4 transition-colors hover:text-earthy-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill"
          >
            Try the board first, no sign-up
          </button>
        ) : null}
      </div>
    </div>
  )
}

/* ---------- Step 2 — pick theme ---------- */
function StepTheme({ selected, onSelect, onContinue }) {
  const entries = Object.entries(THEMES)
  const scrollerRef = useRef(null)
  const itemRefs = useRef({})

  // On mount, auto-select the first theme if none chosen yet so Continue
  // works as soon as the user lands. They can swipe to change it.
  useEffect(() => {
    if (!selected && entries.length > 0) {
      onSelect(entries[0][0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track which banner is centered in the scroller — that's the selected theme.
  // IntersectionObserver scoped to the scroller's root so we ignore the rest
  // of the page. We use intersectionRatio (not isIntersecting) so we pick the
  // card that's MOST in view, not just any partially-visible card.
  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      () => {
        let bestKey = null
        let bestRatio = 0
        const rootRect = root.getBoundingClientRect()
        const rootCenter = rootRect.left + rootRect.width / 2
        for (const [key, el] of Object.entries(itemRefs.current)) {
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const cardCenter = rect.left + rect.width / 2
          // Score by inverse distance from the scroller's center
          const distance = Math.abs(cardCenter - rootCenter)
          const score = 1 / (1 + distance)
          if (score > bestRatio) {
            bestRatio = score
            bestKey = key
          }
        }
        if (bestKey) onSelect(bestKey)
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    Object.values(itemRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [onSelect])

  // Click a card OR a pagination dot → scroll-snap that card into view.
  const scrollToTheme = (key) => {
    const el = itemRefs.current[key]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const selectedTheme = selected ? THEMES[selected] : null
  const selectedIdx = selected ? entries.findIndex(([k]) => k === selected) : 0
  const activeIdx = Math.max(0, selectedIdx)
  const canGoPrevious = activeIdx > 0
  const canGoNext = activeIdx < entries.length - 1

  const moveTheme = (delta) => {
    if (entries.length === 0) return
    const nextIdx = Math.min(entries.length - 1, Math.max(0, activeIdx + delta))
    const [nextKey] = entries[nextIdx]
    if (!nextKey || nextIdx === activeIdx) return
    onSelect(nextKey)
    scrollToTheme(nextKey)
  }

  return (
    <div className="pt-14">
      <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
        Pick a theme for them.
      </h2>
      <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-5">
        Swipe to explore. You can change this anytime.
      </p>

      {/* Horizontal swipe. Scroll-snap centers whichever card is in view; the
          IntersectionObserver above updates `selected` to match. Negative margin
          + matching px lets the scroller extend edge-to-edge of the wizard
          padding without breaking the snap math. */}
      <div className="relative">
        <div
          ref={scrollerRef}
          role="radiogroup"
          aria-label="Choose a theme"
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[15%] pb-2 sm:px-[20%]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <style>{`
            /* Hide native scrollbar inside the swiper without affecting other scrollers. */
            [role="radiogroup"][aria-label="Choose a theme"]::-webkit-scrollbar { display: none; }
          `}</style>
          {entries.map(([key, t]) => {
            const isSelected = selected === key
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${t.label} theme`}
                ref={(el) => { itemRefs.current[key] = el }}
                onClick={() => { onSelect(key); scrollToTheme(key) }}
                className={[
                  'block snap-center shrink-0 w-[260px] sm:w-[340px]',
                  'rounded-3xl overflow-hidden transition-all',
                  'border-2',
                  isSelected
                    ? 'border-earthy-cocoa shadow-earthy-card scale-100'
                    : 'border-transparent opacity-70 scale-95',
                ].filter(Boolean).join(' ')}
              >
                <ThemeBannerArt
                  themeKey={key}
                  height={200}
                  animated={isSelected}
                  loading={isSelected ? 'eager' : 'lazy'}
                  imageScale={1.14}
                />
              </button>
            )
          })}
        </div>

        {entries.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => moveTheme(-1)}
              disabled={!canGoPrevious}
              aria-label="Previous theme"
              className={[
                'absolute left-[12%] top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
                'border border-earthy-dividerCream bg-white/95 text-earthy-cocoa shadow-earthy-card backdrop-blur-sm transition-all sm:flex',
                canGoPrevious
                  ? 'hover:border-earthy-cocoaSoft hover:bg-white hover:shadow-earthy-soft active:scale-95'
                  : 'cursor-not-allowed opacity-35',
              ].join(' ')}
            >
              <Icon name="chevron-left" size={24} />
            </button>
            <button
              type="button"
              onClick={() => moveTheme(1)}
              disabled={!canGoNext}
              aria-label="Next theme"
              className={[
                'absolute right-[12%] top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
                'border border-earthy-dividerCream bg-white/95 text-earthy-cocoa shadow-earthy-card backdrop-blur-sm transition-all sm:flex',
                canGoNext
                  ? 'hover:border-earthy-cocoaSoft hover:bg-white hover:shadow-earthy-soft active:scale-95'
                  : 'cursor-not-allowed opacity-35',
              ].join(' ')}
            >
              <Icon name="chevron-right" size={24} />
            </button>
          </>
        )}
      </div>

      {/* Selected theme label + pagination dots */}
      <div className="text-center mt-4 mb-6">
        <p
          className="font-display font-black text-earthy-cocoa text-2xl tracking-tight min-h-[2rem]"
          aria-live="polite"
        >
          {selectedTheme?.label || ' '}
        </p>
        <div className="flex justify-center items-center gap-1.5 mt-3" aria-hidden="true">
          {entries.map(([key], idx) => (
            <button
              key={key}
              type="button"
              tabIndex={-1}
              onClick={() => scrollToTheme(key)}
              className={[
                'block h-1.5 rounded-full transition-all',
                idx === activeIdx ? 'w-4 bg-earthy-cocoa' : 'w-1.5 bg-earthy-divider hover:bg-earthy-cocoaSoft',
              ].join(' ')}
              aria-label={`Jump to theme ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        aria-disabled={!selected}
        className={[
          'w-full py-4 rounded-pill font-bold text-base transition-all',
          selected
            ? 'bg-earthy-cocoa text-earthy-cream shadow-earthy-soft hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-earthy-divider text-earthy-cocoaSoft cursor-not-allowed',
        ].join(' ')}
      >
        {selected ? 'Continue ▶' : 'Pick one to continue'}
      </button>
    </div>
  )
}

/* ---------- Step 3 — first kid ---------- */
function StepKid({ name, setName, birthday, setBirthday, parentConsent, onConsent, onNext, onSkip }) {
  if (!parentConsent) {
    return <ParentConsentGate onAccept={onConsent} />
  }

  const canContinue = name.trim().length > 0
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canContinue) onNext() }}
      className="pt-2"
    >
      <WizardStepCard illustration="intro-friend" heroHeight={184}>
        <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
          Tell me about them.
        </h2>
        <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-7">
          For ages 3 to 12. You can add more kids after this.
        </p>

        <label htmlFor="kid-name" className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
          Their name
        </label>
        <input
          id="kid-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          autoFocus
          placeholder="What do they go by?"
          required
          className="w-full px-4 py-3 mb-5 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa placeholder:text-earthy-cocoaSoft/60 transition-colors"
        />

        <label className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
          Birthday <span className="font-normal normal-case tracking-normal text-earthy-cocoaSoft/70">(optional)</span>
        </label>
        <div className="mb-2">
          <EarthyDatePicker
            value={birthday}
            onChange={setBirthday}
            placeholder="Add a birthday"
            ariaLabel="Pick a birthday"
          />
        </div>
        <p className="text-xs text-earthy-cocoaSoft/80 mb-8 leading-relaxed">
          We use this to celebrate their birthday-week with a special banner. Skip if you’d rather not.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-earthy-cocoaSoft hover:text-earthy-cocoa font-bold text-sm underline underline-offset-2 transition-colors"
          >
            Skip birthday
          </button>
          <button
            type="submit"
            disabled={!canContinue}
            aria-disabled={!canContinue}
            className={[
              'ml-auto px-7 py-3 rounded-pill font-bold text-base transition-all',
              canContinue
                ? 'bg-earthy-cocoa text-earthy-cream shadow-earthy-soft hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-earthy-divider text-earthy-cocoaSoft cursor-not-allowed',
            ].join(' ')}
          >
            Next ▶
          </button>
        </div>
      </WizardStepCard>
    </form>
  )
}

/* ---------- Step 4 — sign up ---------- */
function StepAccount({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  onApple,
  onGoogle,
  isUpgrade,
  isInviteSignup,
  onTryGuest,
}) {
  return (
    <form onSubmit={onSubmit} className="pt-2">
      <WizardStepCard illustration="intro-cake" heroHeight={184}>
        <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
          {isUpgrade ? 'Save your board.' : isInviteSignup ? 'Join your family.' : 'One last step.'}
        </h2>
        <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-7">
          {isUpgrade
            ? 'Add an email so you can come back to it from any device.'
            : isInviteSignup
              ? 'Create a parent account, then we will add you to the shared board.'
              : 'Create your account so we can save their board.'}
        </p>

        <label htmlFor="signup-email" className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
        />

        <label htmlFor="signup-password" className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-2 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
        />
        <p className="text-xs text-earthy-cocoaSoft/80 mb-5">At least 8 characters.</p>

        {error && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-semantic-errorBg text-semantic-errorText text-sm font-bold">
            {error}
          </div>
        )}

        <PrimaryButton type="submit" disabled={loading} aria-disabled={loading}>
          {loading ? 'Creating…' : 'Create →'}
        </PrimaryButton>

        {/* Divider */}
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
            aria-disabled={loading}
            aria-label="Continue with Apple"
            className="w-full py-3.5 rounded-pill bg-earthy-ivory border-2 border-earthy-divider text-earthy-cocoa font-bold text-sm hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-divider transition-colors flex items-center justify-center gap-2"
          >
            <span aria-hidden="true"></span> Continue with Apple
          </button>
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            aria-disabled={loading}
            aria-label="Continue with Google"
            className="w-full py-3.5 rounded-pill bg-earthy-ivory border-2 border-earthy-divider text-earthy-cocoa font-bold text-sm hover:border-earthy-cocoaSoft disabled:opacity-60 disabled:hover:border-earthy-divider transition-colors flex items-center justify-center gap-2"
          >
            <span aria-hidden="true">G</span> Continue with Google
          </button>
        </div>

        <p className="text-center mt-6 text-xs text-earthy-cocoaSoft">
          {onTryGuest ? (
            <>
              <button
                type="button"
                onClick={onTryGuest}
                className="mb-4 font-extrabold text-earthy-cocoa underline underline-offset-4 transition-colors hover:text-earthy-cocoaDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill"
              >
                Test the board without signing up
              </button>
              <br />
            </>
          ) : null}
          <a
            href={supportMailto('Help with Winking Star signup')}
            className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
          >
            Need help?
          </a>
        </p>
      </WizardStepCard>
    </form>
  )
}
