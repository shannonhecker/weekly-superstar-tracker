import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { formatAuthError } from '../lib/authErrors'
import Logo from '../components/Logo'
import PrimaryButton from '../components/PrimaryButton'

// Branded handler for Firebase email-action links (?mode=...&oobCode=...).
// Replaces Firebase's stock Material card so the user lands on something
// that reads as Winking Star, not a generic Google surface. Each mode
// dispatches to its own sub-component but they share the same chrome
// (cream page bg + ivory card) so the visual language stays consistent.
//
// The route is intentionally outside <ProtectedRoute>: the user arrives
// here from an email and is by definition signed-out for password reset
// and may or may not be signed in for verifyEmail.
const VALID_MODES = new Set([
  'resetPassword',
  'verifyEmail',
  'recoverEmail',
  'verifyAndChangeEmail',
])

export default function AuthAction() {
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const oobCode = params.get('oobCode') || ''

  // Unknown / malformed link — bail out with a friendly fallback rather
  // than silently rendering nothing. We deliberately don't echo the raw
  // mode param back to the user (could be attacker-controlled).
  if (!mode || !VALID_MODES.has(mode) || !oobCode) {
    return (
      <PageShell>
        <Card>
          <CardHeader
            title="This link doesn't look right"
            subtitle="It may be incomplete or already used. You can ask for a new one any time."
          />
          <PrimaryButton as={Link} to="/signin">
            Back to sign in
          </PrimaryButton>
          <HelpFooter />
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Card>
        {mode === 'resetPassword' && <ResetPassword oobCode={oobCode} />}
        {mode === 'verifyEmail' && (
          <ApplyCode
            oobCode={oobCode}
            verifyingCopy="Confirming your email…"
            successTitle="Email confirmed"
            successBody="You're all set — your inbox is locked in."
          />
        )}
        {mode === 'verifyAndChangeEmail' && (
          <ApplyCode
            oobCode={oobCode}
            verifyingCopy="Confirming the change…"
            successTitle="Email change confirmed"
            successBody="Your new address is now the one on file."
          />
        )}
        {mode === 'recoverEmail' && <RecoverEmail oobCode={oobCode} />}
        <HelpFooter />
      </Card>
    </PageShell>
  )
}

/* ---------- mode: resetPassword ---------- */

function ResetPassword({ oobCode }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('verifying') // verifying | form | success | invalid
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const e = await verifyPasswordResetCode(auth, oobCode)
        if (cancelled) return
        setEmail(e || '')
        setPhase('form')
      } catch (err) {
        if (cancelled) return
        setError(formatAuthError(err))
        setPhase('invalid')
      }
    })()
    return () => { cancelled = true }
  }, [oobCode])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (pw.length < 6) {
      setError('Use at least 6 characters.')
      return
    }
    if (pw !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, pw)
      setPhase('success')
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'verifying') return <VerifyingState label="Checking your link…" />

  if (phase === 'invalid') {
    return (
      <>
        <CardHeader
          title="This link has expired"
          subtitle={error || 'Reset links are single-use and time out for safety. Request a fresh one and we’ll send it right over.'}
        />
        <PrimaryButton as={Link} to="/forgot-password">
          Request a new link
        </PrimaryButton>
        <SecondaryLink to="/signin">Back to sign in</SecondaryLink>
      </>
    )
  }

  if (phase === 'success') {
    return (
      <>
        <div className="text-4xl mb-4 text-center" aria-hidden="true">✨</div>
        <CardHeader
          title="Your password is updated"
          subtitle="Sign in with your new password to get back to the board."
        />
        <PrimaryButton onClick={() => navigate('/signin', { replace: true })}>
          Sign in
        </PrimaryButton>
      </>
    )
  }

  // phase === 'form'
  // Don't reveal the verified email back to the page. The user knows
  // which account they're resetting (they clicked the link from their
  // own inbox), and surfacing it here turns a stolen oobCode into a
  // mini email-enumeration primitive. Audit S7.
  return (
    <form onSubmit={onSubmit} noValidate>
      <CardHeader
        title="Set a new password"
        subtitle="for your Winking Star account"
      />

      <FieldLabel htmlFor="auth-new-password">New password</FieldLabel>
      <EarthyInput
        id="auth-new-password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        autoFocus
      />
      <p className="text-xs text-earthy-cocoaSoft/80 mb-4">At least 6 characters.</p>

      <FieldLabel htmlFor="auth-confirm-password">Confirm</FieldLabel>
      <EarthyInput
        id="auth-confirm-password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {error && <ErrorPill>{error}</ErrorPill>}

      <PrimaryButton type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Saving…' : 'Save new password →'}
      </PrimaryButton>
    </form>
  )
}

/* ---------- mode: verifyEmail / verifyAndChangeEmail ---------- */
// Both modes are pure status surfaces — no input. They share an
// auto-applied action code on mount, then show a result + Continue.
function ApplyCode({ oobCode, verifyingCopy, successTitle, successBody }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('verifying') // verifying | success | invalid
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await applyActionCode(auth, oobCode)
        if (cancelled) return
        setPhase('success')
      } catch (err) {
        if (cancelled) return
        setError(formatAuthError(err))
        setPhase('invalid')
      }
    })()
    return () => { cancelled = true }
  }, [oobCode])

  if (phase === 'verifying') return <VerifyingState label={verifyingCopy} />

  if (phase === 'invalid') {
    return (
      <>
        <CardHeader
          title="This link has expired"
          subtitle={error || 'Confirmation links are single-use. Sign in and we can send a fresh one.'}
        />
        <PrimaryButton as={Link} to="/signin">
          Back to sign in
        </PrimaryButton>
      </>
    )
  }

  return (
    <>
      <div className="text-4xl mb-4 text-center" aria-hidden="true">✨</div>
      <CardHeader title={successTitle} subtitle={successBody} />
      <PrimaryButton onClick={() => navigate('/signin', { replace: true })}>
        Continue
      </PrimaryButton>
    </>
  )
}

/* ---------- mode: recoverEmail ---------- */
// Two-step: peek at the action code (so we can show the previous email),
// then explicitly confirm. Doing the apply on mount would silently revert
// the change; we want the user to opt in.
function RecoverEmail({ oobCode }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('verifying') // verifying | confirm | reverting | success | invalid
  const [previousEmail, setPreviousEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const info = await checkActionCode(auth, oobCode)
        if (cancelled) return
        setPreviousEmail(info?.data?.email || '')
        setPhase('confirm')
      } catch (err) {
        if (cancelled) return
        setError(formatAuthError(err))
        setPhase('invalid')
      }
    })()
    return () => { cancelled = true }
  }, [oobCode])

  const onRevert = async () => {
    setError('')
    setPhase('reverting')
    try {
      await applyActionCode(auth, oobCode)
      setPhase('success')
    } catch (err) {
      setError(formatAuthError(err))
      setPhase('invalid')
    }
  }

  if (phase === 'verifying') return <VerifyingState label="Checking your link…" />

  if (phase === 'invalid') {
    return (
      <>
        <CardHeader
          title="This link has expired"
          subtitle={error || 'Recovery links time out for safety. Sign in and we can help from there.'}
        />
        <PrimaryButton as={Link} to="/signin">
          Back to sign in
        </PrimaryButton>
      </>
    )
  }

  if (phase === 'success') {
    return (
      <>
        <div className="text-4xl mb-4 text-center" aria-hidden="true">✨</div>
        <CardHeader
          title="Your email was reverted"
          subtitle={previousEmail
            ? <>Sign in with <span className="font-bold text-earthy-cocoa">{previousEmail}</span> to keep going.</>
            : 'Sign in to keep going.'}
        />
        <PrimaryButton onClick={() => navigate('/signin', { replace: true })}>
          Sign in
        </PrimaryButton>
      </>
    )
  }

  // phase === 'confirm' or 'reverting'
  return (
    <>
      <CardHeader
        title="Revert your email?"
        subtitle={previousEmail
          ? <>We'll switch your account back to <span className="font-bold text-earthy-cocoa">{previousEmail}</span>.</>
          : "We'll switch your account back to your previous email."}
      />
      <PrimaryButton onClick={onRevert} disabled={phase === 'reverting'}>
        {phase === 'reverting' ? 'Reverting…' : 'Revert email'}
      </PrimaryButton>
      <SecondaryLink to="/signin">Cancel</SecondaryLink>
    </>
  )
}

/* ---------- shared chrome ---------- */

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-earthy-cream flex flex-col items-center px-5 py-10">
      <div className="flex items-center gap-2 mb-7">
        <Logo size={28} />
        <span className="font-display font-black text-earthy-cocoa text-base tracking-tight">
          winking star
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        {children}
      </div>
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="bg-earthy-ivory rounded-3xl shadow-earthy-pop p-7 sm:p-8 max-w-md w-full border border-earthy-divider">
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="font-display font-black text-earthy-cocoa text-2xl sm:text-3xl tracking-tight leading-tight mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-earthy-cocoaSoft text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold tracking-wider uppercase text-earthy-cocoaSoft mb-2"
    >
      {children}
    </label>
  )
}

// Same input visual idiom as onboarding StepKid / StepAccount: ivory fill,
// 2px divider border that thickens to cocoa on focus. Forwarding all props
// keeps the call sites flexible without re-implementing native attributes.
function EarthyInput(props) {
  const { className = '', ...rest } = props
  return (
    <input
      {...rest}
      className={[
        'w-full px-4 py-3 mb-4 rounded-xl bg-earthy-cream border-2 border-earthy-divider',
        'focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none',
        'font-bold text-earthy-cocoa placeholder:text-earthy-cocoaSoft/60 transition-colors',
        className,
      ].join(' ')}
    />
  )
}

function SecondaryLink({ to, children }) {
  return (
    <div className="text-center mt-4">
      <Link
        to={to}
        className="text-sm font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa underline underline-offset-2 transition-colors"
      >
        {children}
      </Link>
    </div>
  )
}

// Soft skeleton that doesn't rely on JS — tells the user something is happening
// without flashing a layout shift when the verify call resolves.
function VerifyingState({ label }) {
  return (
    <div className="py-2" aria-busy="true" aria-live="polite">
      <div className="h-7 w-2/3 rounded-md bg-earthy-cream animate-pulse mb-3" />
      <div className="h-4 w-5/6 rounded-md bg-earthy-cream animate-pulse mb-2" />
      <div className="h-4 w-3/5 rounded-md bg-earthy-cream animate-pulse mb-7" />
      <div className="h-12 w-full rounded-pill bg-earthy-cream animate-pulse" />
      <p className="sr-only">{label}</p>
    </div>
  )
}

// Inline error pill — same colors and shape as the onboarding error strip
// (#F8E5DF fill, #8A3A2E text). These two hex literals match SignUp.jsx
// exactly and intentionally aren't tokenised yet (flagged there too).
function ErrorPill({ children }) {
  return (
    <div
      role="alert"
      className="mb-4 px-4 py-3 rounded-xl bg-[#F8E5DF] text-[#8A3A2E] text-sm font-bold"
    >
      {children}
    </div>
  )
}

function HelpFooter() {
  return (
    <p className="text-center mt-6 text-xs text-earthy-cocoaSoft">
      <a
        href="mailto:hello@winkingstar.com?subject=Help%20with%20Winking%20Star%20account"
        className="underline underline-offset-2 hover:text-earthy-cocoa transition-colors"
      >
        Need help?
      </a>
    </p>
  )
}
