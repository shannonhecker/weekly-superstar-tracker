import { useState } from 'react'
import Modal from './Modal'
import { useI18n } from '../lib/i18n'

export default function ShareModal({ open, onClose, shareCode }) {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()
  if (!open) return null
  const url = `${window.location.origin}/join/${shareCode}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      emoji="🔗"
      title={t('share.title')}
      panelClassName="!max-w-xl !overflow-hidden"
    >
      <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
        <div className="rounded-xl border border-earthy-divider bg-earthy-card p-3 text-sm font-bold text-earthy-cocoa break-all">
          {url}
        </div>
        <p className="mt-3 text-center text-xs text-earthy-cocoaSoft font-bold">
          {t('share.code', { code: shareCode })}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onClose}
          className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] sm:w-auto"
        >
          {t('common.close')}
        </button>
        <button
          onClick={copy}
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold transition-all hover:bg-earthy-cocoaDark active:scale-[0.99] sm:w-auto sm:min-w-36"
        >
          {copied ? t('share.copied') : t('share.copy')}
        </button>
      </div>
    </Modal>
  )
}
