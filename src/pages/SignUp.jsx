import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithCredential,
  linkWithPopup,
  signInWithPopup,
} from 'firebase/auth'
import { createBoardForNewUser, findUserBoards } from '../lib/boards'
import { auth } from '../lib/firebase'
import { formatAuthError, isSilentAuthError } from '../lib/authErrors'
import PrimaryButton from '../components/PrimaryButton'
import HeroStar from '../components/HeroStar'

// Direction B onboarding — 4 self-paced steps that replace the legacy single-form
// signup. The page intentionally renders without a heavy white card: just cream,
// generous breathing room, and one decision per screen. Step state is local —
// no extra routes — so back/next preserves selections without re-mounting.
//
// `?upgrade=1` short-circuits the wizard: the user is already an anonymous
// guest with a seeded board (from /try), so we skip theme + kid name and
// jump straight to the credentials screen, then call linkWithCredential /
// linkWithPopup to convert the anonymous account in place — UID and
// memberIds are preserved.
const TOTAL_STEPS = 4

export default function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isUpgrade = searchParams.get('upgrade') === '1'

  // Upgrade flow skips the wizard — the guest already has a seeded board
  // from /try, so theme + kid name are already chosen. Drop straight to
  // step 4 (the credentials screen).
  const [step, setStep] = useState(isUpgrade ? TOTAL_STEPS : 1)
  // Track previous step so we know whether to slide forwards or backwards.
  const [direction, setDirection] = useState('forward')
  const prevStepRef = useRef(isUpgrade ? TOTAL_STEPS : 1)

  // Onboarding answers — preserved across step navigation.
  const [theme, setTheme] = useState(null)
  const [kidName, setKidName] = useState('')
  const [birthday, setBirthday] = useState('')

  // Final-step credentials.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prev = prevStepRef.current
    setDirection(step >= prev ? 'forward' : 'back')
    prevStepRef.current = step
  }, [step])

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const onCreate = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      // Upgrade path: anonymous guest converting to email/password. Preserves
      // UID + memberIds + the demo board they already seeded at /try.
      if (isUpgrade && auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email.trim(), password)
        const linked = await linkWithCredential(auth.currentUser, credential)
        const existing = await findUserBoards(linked.user.uid)
        navigate(existing[0] ? `/board/${existing[0].id}` : '/', { replace: true })
        return
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const boardId = await createBoardForNewUser(cred.user, { theme, kidName, birthday })
      navigate(`/board/${boardId}`, { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
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
  const onOAuth = async (provider) => {
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
        navigate(existing[0] ? `/board/${existing[0].id}` : '/', { replace: true })
        return
      }
      const cred = await signInWithPopup(auth, provider)
      // Existing-user guard: if Firestore has any board where this user is a
      // member (admin or family member), route to their original — earliest
      // by createdAt — so a returning user doesn't get a fresh duplicate
      // board on top of their existing data. (See PR #30 incident.)
      const existing = await findUserBoards(cred.user.uid)
      if (existing.length > 0) {
        navigate(`/board/${existing[0].id}`, { replace: true })
        return
      }
      const boardId = await createBoardForNewUser(cred.user, { theme, kidName, birthday })
      navigate(`/board/${boardId}`, { replace: true })
    } catch (err) {
      // Treat duplicate popup-request as a no-op — the user just clicked twice
      // before the first popup resolved. No banner, just clear the spinner.
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

  // Subtle slide+fade. Tailwind transition utilities on a key'd wrapper —
  // re-mount per step keeps each screen's enter animation predictable.
  const enterClasses =
    direction === 'forward'
      ? 'animate-[onb-slide-in-right_220ms_ease-out]'
      : 'animate-[onb-slide-in-left_220ms_ease-out]'

  return (
    <main id="main" className="min-h-screen bg-earthy-cream flex flex-col px-5 py-6">
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
          Hidden in upgrade mode: there's no wizard to step back through and the
          "4/4" counter would be confusing for a one-screen flow. */}
      {!isUpgrade && (
        <div className="w-full max-w-lg mx-auto flex items-center justify-between min-h-[28px]">
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
          <span className="text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center w-full">
        <div key={step} className={`w-full max-w-lg ${enterClasses}`}>
          {step === 1 && <StepIntro onStart={goNext} />}
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
              onNext={goNext}
              onSkip={() => { setBirthday(''); goNext() }}
            />
          )}
          {step === 4 && (
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
            />
          )}
        </div>
      </div>

      {/* Sign-in escape hatch lives outside the per-step container so it's
          always reachable — first-time visitors with an existing account
          shouldn't have to walk through 4 screens to find it. */}
      <p className="w-full max-w-lg mx-auto text-center text-sm text-earthy-cocoaSoft mt-6">
        Already have an account?{' '}
        <Link to="/signin" className="text-earthy-cocoa font-bold underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </main>
  )
}

/* ---------- Step 1 — value prop ---------- */
function StepIntro({ onStart }) {
  return (
    <div className="text-center pt-6">
      <div className="flex justify-center mb-6">
        <HeroStar size={88} />
      </div>
      <h1 className="font-display font-black text-earthy-cocoa text-4xl sm:text-5xl tracking-tight leading-[1.05] mb-5">
        meet your<br />weekly superstar.
      </h1>
      <p className="text-earthy-cocoaSoft text-base sm:text-lg leading-relaxed max-w-sm mx-auto mb-10">
        a tiny ritual for kids who are crushing their week.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-pill bg-earthy-cocoa text-earthy-cream font-bold text-base shadow-earthy-soft hover:bg-[color:var(--earthy-cocoa-hover,#4A2E25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all"
        style={{ ['--earthy-cocoa-hover']: '#4A2E25' }}
      >
        Start <span aria-hidden="true">▶</span>
      </button>
    </div>
  )
}

/* ---------- Step 2 — pick theme ---------- */
function StepTheme({ selected, onSelect, onContinue }) {
  const entries = Object.entries(THEMES)
  return (
    <div>
      <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
        Pick a theme<br />for them
      </h2>
      <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-6">
        You can change this anytime — it sets the vibe of their board.
      </p>

      <div
        role="radiogroup"
        aria-label="Choose a theme"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8"
      >
        {entries.map(([key, t]) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(key)}
              className={[
                'group relative flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 min-h-[112px]',
                'bg-earthy-ivory border-2 transition-all',
                'hover:-translate-y-0.5 active:translate-y-0',
                isSelected
                  ? 'border-earthy-cocoa ring-2 ring-earthy-cocoa shadow-earthy-card'
                  : 'border-earthy-divider hover:border-earthy-cocoaSoft',
              ].join(' ')}
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: t.accent }}
                aria-hidden="true"
              >
                {t.emoji}
              </span>
              <span className="font-display font-black text-earthy-cocoa text-sm tracking-tight">
                {t.label}
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 text-earthy-cocoa text-xs" aria-hidden="true">●</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
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
function StepKid({ name, setName, birthday, setBirthday, onNext, onSkip }) {
  const canContinue = name.trim().length > 0
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canContinue) onNext() }}
      className="pt-2"
    >
      <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
        Tell me about<br />them
      </h2>
      <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-7">
        For ages 3–12. You can add more kids after this.
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

      <label htmlFor="kid-birthday" className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2">
        Birthday <span className="font-normal normal-case tracking-normal text-earthy-cocoaSoft/70">— optional</span>
      </label>
      <input
        id="kid-birthday"
        type="date"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        aria-describedby="birthday-help"
        className="w-full px-4 py-3 mb-2 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
      />
      <p id="birthday-help" className="text-xs text-earthy-cocoaSoft/80 mb-8 leading-relaxed">
        We use this to celebrate their birthday-week with a special banner. Skip if you'd rather not.
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
}) {
  return (
    <form onSubmit={onSubmit} className="pt-2">
      <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
        {isUpgrade ? 'Save your board.' : 'One last step.'}
      </h2>
      <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-7">
        {isUpgrade
          ? 'Add an email so you can come back to it from any device.'
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
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 mb-2 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
      />
      <p className="text-xs text-earthy-cocoaSoft/80 mb-5">At least 6 characters.</p>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-[#F8E5DF] text-[#8A3A2E] text-sm font-bold">
          {error}
        </div>
      )}

      <PrimaryButton type="submit" disabled={loading}>
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

      <p className="text-center mt-6 text-xs text-earthy-cocoaSoft">
        <a
          href="mailto:hello@winkingstar.com?subject=Help%20with%20Winking%20Star%20signup"
          className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
        >
          Need help?
        </a>
      </p>
    </form>
  )
}
