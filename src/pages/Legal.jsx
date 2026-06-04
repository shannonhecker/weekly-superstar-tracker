import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import LocaleSelectorButton from '../components/LocaleSelectorButton'
import { SUPPORT_EMAIL } from '../lib/support'
import { useI18n, usePageMetadata } from '../lib/i18n'

const UPDATED = 'May 15, 2026'

export function Privacy() {
  const { t } = useI18n()
  usePageMetadata(t('meta.privacy.title'), t('meta.privacy.description'))

  return (
    <LegalPage title={t('legal.privacy.title')}>
      <p>
        {t('legal.privacy.body1')}
      </p>
      <p>
        {t('legal.privacy.body2')}
      </p>
      <p>
        {t('legal.privacy.body3')}
      </p>
      <p>
        {t('legal.privacy.body4')}
      </p>
      <p>
        {t('legal.privacy.body5Prefix')} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  )
}

export function Terms() {
  const { t } = useI18n()
  usePageMetadata(t('meta.terms.title'), t('meta.terms.description'))

  return (
    <LegalPage title={t('legal.terms.title')}>
      <p>
        {t('legal.terms.body1')}
      </p>
      <p>
        {t('legal.terms.body2')}
      </p>
      <p>
        {t('legal.terms.body3')}
      </p>
      <p>
        {t('legal.terms.body4Prefix')} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  )
}

function LegalPage({ title, children }) {
  const { t, formatDate } = useI18n()
  const updated = formatDate(new Date(`${UPDATED} 00:00:00`), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main id="main" className="min-h-screen bg-earthy-ivory px-5 py-8 font-jakarta">
      <article className="max-w-2xl mx-auto bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">Winking Star</p>
              <h1 className="font-display text-3xl font-black tracking-tight text-earthy-cocoa">{title}</h1>
            </div>
          </div>
          <LocaleSelectorButton compact />
        </div>
        <p className="text-xs font-bold text-earthy-cocoaSoft mb-6">
          {t('legal.updated', { date: updated })}
        </p>
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-earthy-cocoaSoft font-bold">
          {children}
        </div>
        <Link
          to="/"
          className="inline-flex mt-8 text-sm font-bold text-earthy-cocoa underline underline-offset-4"
        >
          {t('legal.back')}
        </Link>
      </article>
    </main>
  )
}
