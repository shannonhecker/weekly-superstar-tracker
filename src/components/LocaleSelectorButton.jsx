import { useState } from 'react'
import Icon from './Icon'
import LocaleSettingsModal from './LocaleSettingsModal'
import { useI18n } from '../lib/i18n'

export default function LocaleSelectorButton({ className = '', compact = false }) {
  const [open, setOpen] = useState(false)
  const { t, localeSummary } = useI18n()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t('locale.buttonLabel')}: ${localeSummary}`}
        title={localeSummary}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-pill border border-earthy-dividerCream bg-earthy-card px-3 py-2 text-xs font-extrabold text-earthy-cocoaSoft transition-colors hover:border-earthy-cocoaSoft hover:text-earthy-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 ${className}`}
      >
        <Icon name="language" size={18} className="shrink-0" />
        {compact ? (
          <span className="max-w-[10rem] truncate">{localeSummary}</span>
        ) : (
          <>
            <span className="hidden max-w-[13rem] truncate sm:inline">{localeSummary}</span>
            <span className="max-w-[11rem] truncate sm:hidden">{localeSummary}</span>
          </>
        )}
      </button>
      <LocaleSettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
