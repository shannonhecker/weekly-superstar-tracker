import { useState } from 'react'
import { Link } from 'react-router-dom'
import WizardStepCard from './wizard/WizardStepCard'
import { useI18n } from '../lib/i18n'

export default function ParentConsentGate({ onAccept, compact = false }) {
  const { t } = useI18n()
  const [confirmedAdult, setConfirmedAdult] = useState(false)
  const [confirmedConsent, setConfirmedConsent] = useState(false)
  const canContinue = confirmedAdult && confirmedConsent

  const content = (
    <>
      <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
        {t('consent.title')}
      </h2>
      <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-5">
        {t('consent.body')}
      </p>

      <div className="space-y-3 mb-6">
        <label className="flex gap-3 rounded-2xl bg-earthy-ivory border border-earthy-divider p-4 text-left">
          <input
            type="checkbox"
            checked={confirmedAdult}
            onChange={(e) => setConfirmedAdult(e.target.checked)}
            className="mt-1 h-4 w-4 accent-earthy-cocoa"
          />
          <span className="text-sm font-bold text-earthy-cocoa">
            {t('consent.adult')}
          </span>
        </label>
        <label className="flex gap-3 rounded-2xl bg-earthy-ivory border border-earthy-divider p-4 text-left">
          <input
            type="checkbox"
            checked={confirmedConsent}
            onChange={(e) => setConfirmedConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-earthy-cocoa"
          />
          <span className="text-sm font-bold text-earthy-cocoa">
            {t('consent.data')}
          </span>
        </label>
      </div>

      <p className="text-xs text-earthy-cocoaSoft mb-5">
        <Link
          to="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-earthy-cocoa"
        >
          {t('consent.privacy')}
        </Link>
      </p>

      <button
        type="button"
        onClick={onAccept}
        disabled={!canContinue}
        className={[
          'w-full py-4 rounded-pill font-bold text-base transition-all',
          canContinue
            ? 'bg-earthy-cocoa text-earthy-cream shadow-earthy-soft hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-earthy-divider text-earthy-cocoaSoft cursor-not-allowed',
        ].join(' ')}
      >
        {t('consent.continue')}
      </button>
    </>
  )

  if (compact) {
    return <div>{content}</div>
  }

  return (
    <div className="pt-2">
      <WizardStepCard illustration="intro-house" heroHeight={178}>
        {content}
      </WizardStepCard>
    </div>
  )
}
