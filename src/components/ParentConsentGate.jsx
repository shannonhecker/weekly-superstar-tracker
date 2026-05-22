import { useState } from 'react'

export default function ParentConsentGate({ onAccept, compact = false }) {
  const [confirmedAdult, setConfirmedAdult] = useState(false)
  const [confirmedConsent, setConfirmedConsent] = useState(false)
  const canContinue = confirmedAdult && confirmedConsent

  return (
    <div className={compact ? '' : 'pt-2'}>
      <h2 className="font-display font-black text-earthy-cocoa text-3xl sm:text-4xl tracking-tight mb-2">
        Grown-up check.
      </h2>
      <p className="text-earthy-cocoaSoft text-sm sm:text-base mb-5">
        A parent or legal guardian needs to continue before we collect a child’s name, birthday, or photo.
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
            I am the child’s parent or legal guardian and I am at least 18.
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
            I consent to Winking Star saving family board data for app functionality.
          </span>
        </label>
      </div>

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
        Continue
      </button>
    </div>
  )
}
