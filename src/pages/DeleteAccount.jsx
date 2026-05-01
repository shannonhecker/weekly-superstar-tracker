import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { formatAuthError, isSilentAuthError } from '../lib/authErrors'
import { deleteAccountCascade, primaryProvider } from '../lib/deleteAccount'
import PrimaryButton from '../components/PrimaryButton'
import Icon from '../components/Icon'

const PROVIDER_LABEL = {
  'google.com': 'Google',
  'apple.com': 'Apple',
}

export default function DeleteAccount() {
  const { user, loading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const provider = useMemo(() => primaryProvider(user), [user])
  const isPassword = provider === 'password'

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (loading) return null

  const onDelete = async () => {
    if (!user) return
    setErrorMsg('')
    if (isPassword && !password) {
      setErrorMsg('Enter your password to confirm.')
      return
    }
    setSubmitting(true)
    try {
      await deleteAccountCascade(user, { password })
      toast.success('Your account and board data were deleted.')
      navigate('/signin', { replace: true })
    } catch (err) {
      if (!isSilentAuthError(err)) {
        setErrorMsg(formatAuthError(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      id="main"
      className="min-h-screen px-4 py-10 bg-earthy-ivory font-jakarta"
    >
      <div className="max-w-md mx-auto">
        <Link
          to={-1}
          onClick={(e) => { e.preventDefault(); navigate(-1) }}
          className="inline-flex items-center gap-1 text-earthy-cocoaSoft hover:text-earthy-cocoa font-bold text-sm mb-4"
        >
          <Icon name="back" size={16} />
          <span>Back</span>
        </Link>

        <div
          className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-6 mb-4"
        >
          <h1 className="text-earthy-cocoa font-extrabold text-2xl mb-2">
            Delete your account?
          </h1>
          <p className="text-earthy-cocoaSoft text-sm font-semibold mb-3">
            This will permanently remove:
          </p>
          <ul className="space-y-1.5 mb-4">
            <Bullet>
              Your sign-in for{' '}
              <span className="text-earthy-cocoa font-extrabold">
                {user?.email ?? 'this account'}
              </span>
            </Bullet>
            <Bullet>Every kid, pet, and achievement on boards you admin</Bullet>
            <Bullet>All weekly recaps and streak history</Bullet>
            <Bullet>
              Your membership on any shared boards (the board itself stays if
              someone else is the admin)
            </Bullet>
          </ul>

          <div
            className="flex items-start gap-2 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: '#FFF1F2' }}
          >
            <span aria-hidden className="text-base leading-none mt-0.5">⚠</span>
            <p className="text-sm font-bold" style={{ color: '#9F1239' }}>
              This can't be undone.
              {isPassword
                ? ' Enter your password to confirm.'
                : ` You'll be asked to confirm with ${PROVIDER_LABEL[provider] || 'your provider'}.`}
            </p>
          </div>
        </div>

        <div className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-6">
          {isPassword && (
            <label className="block mb-4">
              <span className="block text-earthy-cocoa font-bold text-sm mb-1.5">
                Confirm with your password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onDelete()
                }}
                placeholder="Your password"
                aria-invalid={errorMsg ? 'true' : 'false'}
                className="w-full px-4 py-3 rounded-pill bg-earthy-ivory border border-earthy-divider text-earthy-cocoa font-semibold text-base focus:outline-none focus:ring-2 focus:ring-earthy-cocoa/40"
              />
            </label>
          )}

          {errorMsg && (
            <p
              role="alert"
              className="text-sm font-bold mb-3"
              style={{ color: '#9F1239' }}
            >
              {errorMsg}
            </p>
          )}

          <PrimaryButton
            type="button"
            onClick={onDelete}
            disabled={submitting}
            style={{ backgroundColor: '#9F1239', color: '#FFF1F2' }}
            className="hover:bg-[#7F102E]"
          >
            {submitting ? 'Deleting…' : 'Delete my account'}
          </PrimaryButton>
        </div>
      </div>
    </main>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2 text-earthy-cocoa text-sm font-semibold">
      <span
        aria-hidden
        className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-earthy-cocoaSoft shrink-0"
      />
      <span className="flex-1">{children}</span>
    </li>
  )
}
