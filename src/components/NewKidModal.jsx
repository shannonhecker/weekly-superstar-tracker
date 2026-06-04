import { useEffect, useRef, useState } from 'react'
import { THEMES, KID_AVATARS } from '../lib/themes'
import Modal from './Modal'
import EarthyDatePicker from './EarthyDatePicker'
import ParentConsentGate from './ParentConsentGate'
import { useI18n } from '../lib/i18n'
import ThemeBannerArt from './ThemeBannerArt'
import Icon from './Icon'
import FluentEmoji from './FluentEmoji'

const THEME_KEYS = Object.keys(THEMES)

function themeForEmoji(emoji) {
  for (const [key, value] of Object.entries(THEMES)) {
    if (value.emoji === emoji) return key
  }
  return null
}

// Single-screen "Add a superstar" modal: name + avatar emoji + theme +
// optional birthday. Only the name is required. Replaces the legacy
// "just-a-name prompt" path that auto-cycled themes. Now the parent
// gets to pick all three choices up front.
//
// Defaults: theme cycles based on kid count (so siblings start visually
// distinct); avatar defaults to "theme" mode (no explicit emoji picked,
// KidAvatar falls back to the theme emoji).
export default function NewKidModal({ open, onClose, onSubmit, kidCount = 0 }) {
  const { t, themeLabel } = useI18n()
  const defaultTheme = THEME_KEYS[kidCount % THEME_KEYS.length]

  const [name, setName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState(null)
  const [theme, setTheme] = useState(defaultTheme)
  const [themeManuallySet, setThemeManuallySet] = useState(false)
  const [birthday, setBirthday] = useState('')
  const [parentConsent, setParentConsent] = useState(false)
  const [busy, setBusy] = useState(false)

  // Reset every time the modal re-opens so a previously-cancelled draft
  // doesn't leak into the next add.
  useEffect(() => {
    if (!open) return
    setName('')
    setAvatarEmoji(null)
    setTheme(THEME_KEYS[kidCount % THEME_KEYS.length])
    setThemeManuallySet(false)
    setBirthday('')
    setParentConsent(false)
    setBusy(false)
  }, [open, kidCount])

  const trimmedName = name.trim()
  const canSubmit = trimmedName.length > 0 && !busy

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canSubmit) return
    setBusy(true)
    try {
      await onSubmit({
        name: trimmedName,
        avatarEmoji,
        theme,
        birthday: birthday || '',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      emoji="⭐"
      title={t('kid.addTitle')}
      panelClassName="!max-w-[920px] !overflow-hidden"
    >
      {!parentConsent ? (
        <div className="mx-auto max-w-xl">
          <ParentConsentGate compact onAccept={() => setParentConsent(true)} />
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="flex h-[calc(100vh-14.5rem)] max-h-[720px] flex-col sm:h-auto sm:max-h-[calc(100vh-9.5rem)]">
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1 sm:pr-2 lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden lg:pr-0">
          <section className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-4 lg:self-start">
            <label htmlFor="new-kid-name" className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
              {t('kid.name')}
            </label>
            <input
              id="new-kid-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('kid.namePlaceholder')}
              autoFocus
              required
              maxLength={30}
              className="mb-5 w-full rounded-xl border-2 border-earthy-divider bg-earthy-card px-4 py-3 font-bold text-earthy-cocoa outline-none transition-colors focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20"
            />

            <label className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
              {t('kid.avatar')} <span className="font-normal normal-case text-earthy-cocoaSoft/70">({t('signup.kid.optional')})</span>
            </label>
            <div className="mb-5 rounded-2xl border border-earthy-divider bg-earthy-card p-3">
              <div className="flex flex-wrap gap-2">
              {KID_AVATARS.map((emoji) => {
                const active = avatarEmoji === emoji
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      const next = active ? null : emoji
                      setAvatarEmoji(next)
                      if (next && !themeManuallySet) {
                        const matchedTheme = themeForEmoji(next)
                        if (matchedTheme) setTheme(matchedTheme)
                      }
                    }}
                    aria-pressed={active}
                    aria-label={t('kid.avatarA11y', { emoji })}
                    className="h-10 w-10 rounded-full text-xl flex items-center justify-center transition-all active:scale-[0.96]"
                    style={{
                      background: active ? `${THEMES[theme]?.accent}55` : '#FFFAF0',
                      border: active ? `2px solid ${THEMES[theme]?.deeper}` : '2px solid #E8DDD0',
                    }}
                  >
                  <FluentEmoji emoji={emoji} size={24} />
                </button>
              )
            })}
              </div>
            </div>

            <label htmlFor="new-kid-birthday" className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
              {t('signup.kid.birthday')} <span className="font-normal normal-case text-earthy-cocoaSoft/70">({t('signup.kid.optional')})</span>
            </label>
            <EarthyDatePicker
              value={birthday}
              onChange={setBirthday}
              placeholder={t('signup.kid.birthdayPlaceholder')}
              ariaLabel={t('signup.kid.birthdayA11y')}
            />
          </section>

          <section className="min-h-0 rounded-2xl border border-earthy-divider bg-earthy-ivory p-4 lg:max-h-[calc(100vh-14.5rem)] lg:overflow-y-auto lg:pr-3">
            <ThemeCardPicker
              selected={theme}
              onSelect={(key) => {
                setTheme(key)
                setThemeManuallySet(true)
              }}
              name={trimmedName || t('kid.superstar')}
              themeLabel={themeLabel}
              t={t}
            />
          </section>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-earthy-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex min-h-11 w-full items-center justify-center rounded-pill px-5 font-bold text-earthy-cocoaSoft transition-all hover:text-earthy-cocoa active:scale-[0.99] disabled:opacity-50 sm:w-auto"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            style={canSubmit
              ? { color: '#FFFAF0', backgroundColor: '#5A3A2E' }
              : undefined}
            className={`flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold transition-all sm:w-auto sm:min-w-44 ${
              canSubmit
                ? 'hover:bg-earthy-cocoaDark active:scale-[0.99]'
                : 'bg-earthy-divider text-earthy-cocoaSoft cursor-not-allowed'
            }`}
          >
            {busy ? t('kid.adding') : t('kid.addSuperstar')}
          </button>
        </div>
      </form>
      )}
    </Modal>
  )
}

function ThemeCardPicker({ selected, onSelect, name, themeLabel, t }) {
  const scrollRef = useRef(null)
  const selectedIndex = Math.max(0, THEME_KEYS.indexOf(selected))
  const [visibleIndex, setVisibleIndex] = useState(selectedIndex)

  useEffect(() => {
    setVisibleIndex(selectedIndex)
    const target = scrollRef.current?.querySelector(`[data-theme-key="${selected}"]`)
    target?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [selected, selectedIndex])

  const goToTheme = (index) => {
    const nextIndex = Math.max(0, Math.min(THEME_KEYS.length - 1, index))
    setVisibleIndex(nextIndex)
    onSelect(THEME_KEYS[nextIndex])
  }

  const updateVisibleFromScroll = () => {
    const node = scrollRef.current
    if (!node) return
    const cards = Array.from(node.querySelectorAll('[data-theme-card]'))
    const center = node.getBoundingClientRect().left + node.getBoundingClientRect().width / 2
    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect()
      const distance = Math.abs(rect.left + rect.width / 2 - center)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    })
    setVisibleIndex(bestIndex)
  }

  return (
    <div className="mb-5">
      <label className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
        {t('kid.bannerTheme')}
      </label>
      <div
        ref={scrollRef}
        role="radiogroup"
        aria-label={t('kid.pickTheme')}
        onScroll={updateVisibleFromScroll}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {THEME_KEYS.map((key) => {
          const item = THEMES[key]
          const isSelected = selected === key
          const label = themeLabel(key, item.label)
          return (
            <button
              key={key}
              type="button"
              data-theme-card
              data-theme-key={key}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${label} ${t('kid.theme')}`}
              onClick={() => onSelect(key)}
              className="w-[min(72vw,292px)] shrink-0 snap-center overflow-hidden rounded-2xl border bg-earthy-ivory text-left transition-all active:scale-[0.99]"
              style={{
                borderColor: isSelected ? item.deeper : '#E8DDD0',
                boxShadow: isSelected ? `0 8px 20px ${item.deeper}22` : '0 2px 8px rgba(90, 58, 46, 0.06)',
              }}
            >
              <ThemeBannerArt
                themeKey={key}
                height={142}
                animated={false}
                loading="lazy"
                objectPosition="center"
                borderRadius={0}
              />
              <div className="flex items-center gap-3 px-4 py-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
                  style={{ backgroundColor: item.accent }}
                  aria-hidden="true"
                >
                  <FluentEmoji emoji={item.emoji} size={30} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-black text-earthy-cocoa">
                    {label}
                  </span>
                  <span className="block truncate text-xs font-bold text-earthy-cocoaSoft">
                    {t('kid.worldForName', { name })}
                  </span>
                </span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: isSelected ? '#12351F' : '#FFFFFF',
                    borderColor: isSelected ? '#12351F' : '#E8DDD0',
                    color: '#FFFAF0',
                  }}
                  aria-hidden="true"
                >
                  {isSelected ? <Icon name="check" size={18} /> : null}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goToTheme(visibleIndex - 1)}
          disabled={visibleIndex <= 0}
          aria-label={t('kid.previousTheme')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-earthy-cocoa text-earthy-cream transition-all disabled:bg-earthy-divider disabled:text-earthy-cocoaSoft disabled:opacity-70"
        >
          <Icon name="chevron-left" size={22} />
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5" aria-hidden="true">
          {THEME_KEYS.map((key, index) => (
            <span
              key={key}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: index === visibleIndex ? 18 : 6,
                backgroundColor: index === visibleIndex ? '#12351F' : '#D9C9B8',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goToTheme(visibleIndex + 1)}
          disabled={visibleIndex >= THEME_KEYS.length - 1}
          aria-label={t('kid.nextTheme')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-earthy-cocoa text-earthy-cream transition-all disabled:bg-earthy-divider disabled:text-earthy-cocoaSoft disabled:opacity-70"
        >
          <Icon name="chevron-right" size={22} />
        </button>
      </div>
    </div>
  )
}
