import Modal from './Modal'

const PROVIDER_LABEL = {
  'google.com': 'Google',
  'apple.com': 'Apple',
  password: 'email and password',
}

function labelFor(providerId) {
  return PROVIDER_LABEL[providerId] || providerId
}

function pickOriginalOAuthProvider(existingMethods) {
  if (!Array.isArray(existingMethods)) return null
  for (const m of existingMethods) {
    if (m === 'google.com' || m === 'apple.com') return m
  }
  return null
}

export default function LinkAccountModal({
  open,
  email,
  existingMethods,
  attemptedProviderId,
  onConfirm,
  onClose,
  busy = false,
  error = '',
}) {
  const originalOAuth = pickOriginalOAuthProvider(existingMethods)
  const hasPassword = Array.isArray(existingMethods) && existingMethods.includes('password')
  const canLinkInModal = !!originalOAuth

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title="Link your accounts?"
      emoji="🔗"
    >
      <div className="text-sm font-bold text-earthy-cocoa space-y-3">
        <p>
          We already have an account for <span className="text-earthy-cocoa">{email}</span>
          {hasPassword
            ? ' using email and password.'
            : originalOAuth
              ? ` using ${labelFor(originalOAuth)}.`
              : '.'}
        </p>
        {canLinkInModal ? (
          <p className="text-earthy-cocoaSoft">
            Sign in with {labelFor(originalOAuth)} once, and we&apos;ll link {labelFor(attemptedProviderId)} for next time.
          </p>
        ) : (
          <p className="text-earthy-cocoaSoft">
            Sign in with {labelFor(existingMethods?.[0] || 'your original method')} to continue. You can link {labelFor(attemptedProviderId)} from settings later.
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-2xl bg-[#F8E5DF] px-4 py-3 text-sm font-bold text-[#8A3A2E]"
        >
          {error}
        </div>
      )}

      {canLinkInModal && (
        <button
          type="button"
          onClick={() => onConfirm(originalOAuth)}
          disabled={busy}
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="w-full mt-4 py-3 rounded-pill font-bold hover:bg-[#4A2E25] active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {busy ? 'Linking…' : `Sign in with ${labelFor(originalOAuth)}`}
        </button>
      )}

      <button
        type="button"
        onClick={onClose}
        disabled={busy}
        className="w-full mt-2 py-2 rounded-pill text-earthy-cocoaSoft font-bold text-sm hover:text-earthy-cocoa disabled:opacity-60"
      >
        Cancel
      </button>
    </Modal>
  )
}
