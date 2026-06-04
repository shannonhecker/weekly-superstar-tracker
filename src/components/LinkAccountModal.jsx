import Modal from './Modal'
import { useI18n } from '../lib/i18n'

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
  const { t } = useI18n()
  const originalOAuth = pickOriginalOAuthProvider(existingMethods)
  const hasPassword = Array.isArray(existingMethods) && existingMethods.includes('password')
  const canLinkInModal = !!originalOAuth

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={t('linkAccount.title')}
      emoji="🔗"
      panelClassName="!max-w-xl !overflow-hidden"
    >
      <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4 text-sm font-bold text-earthy-cocoa space-y-3">
        <p>
          {t('linkAccount.existsPrefix')} <span className="text-earthy-cocoa">{email}</span>
          {hasPassword
            ? t('linkAccount.usingPassword')
            : originalOAuth
              ? t('linkAccount.usingProvider', { provider: labelFor(originalOAuth) })
              : t('linkAccount.existsSuffix')}
        </p>
        {canLinkInModal ? (
          <p className="text-earthy-cocoaSoft">
            {t('linkAccount.linkBody', {
              original: labelFor(originalOAuth),
              attempted: labelFor(attemptedProviderId),
            })}
          </p>
        ) : (
          <p className="text-earthy-cocoaSoft">
            {t('linkAccount.signInBody', {
              original: labelFor(existingMethods?.[0] || t('linkAccount.originalMethod')),
              attempted: labelFor(attemptedProviderId),
            })}
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

      <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onClose}
        disabled={busy}
        className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] disabled:opacity-60 sm:w-auto"
      >
        {t('common.cancel')}
      </button>
      {canLinkInModal && (
        <button
          type="button"
          onClick={() => onConfirm(originalOAuth)}
          disabled={busy}
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold transition-all hover:bg-[#4A2E25] active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:min-w-44"
        >
          {busy ? t('linkAccount.linking') : t('linkAccount.signInWith', { provider: labelFor(originalOAuth) })}
        </button>
      )}
      </div>
    </Modal>
  )
}
