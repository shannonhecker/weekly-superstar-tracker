import Modal from './Modal'
import Icon from './Icon'
import {
  LANGUAGE_OPTIONS,
  REGION_OPTIONS,
  useI18n,
} from '../lib/i18n'

export default function LocaleSettingsModal({ open, onClose }) {
  const {
    languageSetting,
    regionSetting,
    systemLanguage,
    systemRegion,
    intlLocale,
    t,
    languageName,
    regionName,
    setLanguageSetting,
    setRegionSetting,
    formatDate,
    formatNumber,
  } = useI18n()

  const sampleDate = formatDate(new Date(2026, 4, 31), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const sampleNumber = formatNumber(1234.5)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('locale.title')}
      emojiClassName="hidden"
      panelClassName="!max-w-[940px] !overflow-hidden"
    >
      <div className="flex h-[calc(100vh-8.5rem)] max-h-[720px] flex-col sm:h-auto sm:max-h-[calc(100vh-8.5rem)]">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <section aria-labelledby="locale-language-title" className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
              <div className="mb-3">
                <h3 id="locale-language-title" className="text-sm font-extrabold text-earthy-cocoa">
                  {t('locale.language')}
                </h3>
                <p className="mt-1 text-xs font-bold leading-relaxed text-earthy-cocoaSoft">
                  {t('locale.languageSubtitle')}
                </p>
              </div>
              <div role="radiogroup" aria-labelledby="locale-language-title" className="grid gap-2">
            {LANGUAGE_OPTIONS.map((option) => {
              const active = option.code === languageSetting
              const isSystem = option.code === 'system'
              const title = languageName(option.code)
              const subtitle = isSystem
                ? `${t('locale.currentLanguage')}: ${languageName(systemLanguage)}`
                : languageName(option.code, 'english')
              return (
                <button
                  key={option.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLanguageSetting(option.code)}
                  className={`flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 ${
                    active
                      ? 'border-earthy-cocoa bg-earthy-cream'
                      : 'border-earthy-divider bg-earthy-card hover:bg-earthy-ivory'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block leading-snug text-sm font-extrabold text-earthy-cocoa">{title}</span>
                    <span className="mt-0.5 block leading-snug text-xs font-bold text-earthy-cocoaSoft">
                      {isSystem ? t('locale.languageSystemSubtitle') : subtitle}
                    </span>
                  </span>
                  {active ? <Icon name="check" size={20} className="shrink-0 text-earthy-cocoa" /> : null}
                </button>
              )
            })}
              </div>
            </section>

            <section aria-labelledby="locale-region-title" className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4">
              <div className="mb-3">
                <h3 id="locale-region-title" className="text-sm font-extrabold text-earthy-cocoa">
                  {t('locale.region')}
                </h3>
                <p className="mt-1 text-xs font-bold leading-relaxed text-earthy-cocoaSoft">
                  {t('locale.regionSubtitle')}
                </p>
              </div>
              <div role="radiogroup" aria-labelledby="locale-region-title" className="grid gap-2 sm:grid-cols-2">
            {REGION_OPTIONS.map((option) => {
              const active = option.code === regionSetting
              const isSystem = option.code === 'system'
              const title = regionName(option.code)
              const subtitle = isSystem
                ? `${t('locale.currentRegion')}: ${regionName(systemRegion)}`
                : regionName(option.code, 'english')
              return (
                <button
                  key={option.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRegionSetting(option.code)}
                  className={`flex min-h-[52px] w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 ${
                    active
                      ? 'border-earthy-cocoa bg-earthy-cream'
                      : 'border-earthy-divider bg-earthy-card hover:bg-earthy-ivory'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block leading-snug text-sm font-extrabold text-earthy-cocoa">{title}</span>
                    <span className="mt-0.5 block leading-snug text-[11px] font-bold text-earthy-cocoaSoft">
                      {isSystem ? t('locale.regionSystemSubtitle') : subtitle}
                    </span>
                  </span>
                  {active ? <Icon name="check" size={18} className="shrink-0 text-earthy-cocoa" /> : null}
                </button>
              )
            })}
              </div>
            </section>
          </div>

        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory px-4 py-3 sm:min-w-[320px]">
            <p className="text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft">
              {t('locale.preview')}
            </p>
            <p className="mt-1 text-sm font-bold text-earthy-cocoa">
              {t('locale.previewBody', { locale: intlLocale })}
            </p>
            <p className="mt-1 text-xs font-bold text-earthy-cocoaSoft">
              {sampleDate} · {sampleNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
            className="flex min-h-[48px] w-full items-center justify-center rounded-pill px-6 py-3 text-sm font-extrabold shadow-earthy-soft transition-all hover:bg-earthy-cocoaDark active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 sm:w-auto sm:min-w-40"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
