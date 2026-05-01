import { useEffect, useState } from 'react'
import { THEMES, KID_AVATARS } from '../lib/themes'
import Modal from './Modal'
import EarthyDatePicker from './EarthyDatePicker'

// Single-screen "Add a superstar" modal: name + avatar emoji + theme +
// optional birthday. Only the name is required. Replaces the legacy
// "just-a-name prompt" path that auto-cycled themes — now the parent
// gets to pick all three choices up front.
//
// Defaults: theme cycles based on kid count (so siblings start visually
// distinct); avatar defaults to "theme" mode (no explicit emoji picked,
// KidAvatar falls back to the theme emoji).
export default function NewKidModal({ open, onClose, onSubmit, kidCount = 0 }) {
  const themeKeys = Object.keys(THEMES)
  const defaultTheme = themeKeys[kidCount % themeKeys.length]

  const [name, setName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState(null)
  const [theme, setTheme] = useState(defaultTheme)
  const [birthday, setBirthday] = useState('')
  const [busy, setBusy] = useState(false)

  // Reset every time the modal re-opens so a previously-cancelled draft
  // doesn't leak into the next add.
  useEffect(() => {
    if (!open) return
    setName('')
    setAvatarEmoji(null)
    setTheme(themeKeys[kidCount % themeKeys.length])
    setBirthday('')
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
    <Modal open={open} onClose={busy ? undefined : onClose} emoji="⭐" title="Add a superstar">
      <form onSubmit={handleSubmit}>
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          {/* Name */}
          <label htmlFor="new-kid-name" className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
            Name
          </label>
          <input
            id="new-kid-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Leo"
            autoFocus
            required
            maxLength={30}
            className="w-full px-4 py-3 mb-5 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors"
          />

          {/* Avatar */}
          <label className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
            Avatar <span className="font-normal normal-case text-earthy-cocoaSoft/70">— optional</span>
          </label>
          <div className="bg-earthy-ivory border border-earthy-divider rounded-xl p-2 mb-5 grid grid-cols-8 gap-1">
            {KID_AVATARS.map((emoji) => {
              const active = avatarEmoji === emoji
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(active ? null : emoji)}
                  aria-pressed={active}
                  className="aspect-square rounded-lg text-xl flex items-center justify-center transition-all"
                  style={{
                    background: active ? `${THEMES[theme]?.accent}55` : 'transparent',
                    border: active ? `2px solid ${THEMES[theme]?.deeper}` : '2px solid transparent',
                  }}
                >
                  {emoji}
                </button>
              )
            })}
          </div>

          {/* Theme */}
          <label className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
            Theme
          </label>
          <div
            role="radiogroup"
            aria-label="Pick a theme"
            className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5"
          >
            {themeKeys.map((key) => {
              const t = THEMES[key]
              const isSelected = theme === key
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setTheme(key)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 bg-earthy-ivory border-2 transition-all active:scale-[0.98]"
                  style={{
                    borderColor: isSelected ? t.deeper : '#E8DDD0',
                    boxShadow: isSelected ? `0 2px 8px ${t.deeper}33` : 'none',
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: t.accent }}
                    aria-hidden="true"
                  >
                    {t.emoji}
                  </span>
                  <span className="font-bold text-earthy-cocoa text-[11px] tracking-tight truncate max-w-full">
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Birthday — optional */}
          <label htmlFor="new-kid-birthday" className="text-xs font-bold text-earthy-cocoaSoft mb-2 block uppercase tracking-wide">
            Birthday <span className="font-normal normal-case text-earthy-cocoaSoft/70">— optional</span>
          </label>
          <EarthyDatePicker
            value={birthday}
            onChange={setBirthday}
            placeholder="Add a birthday"
            ariaLabel="Pick a birthday"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            style={canSubmit
              ? { color: '#FFFAF0', backgroundColor: '#5A3A2E' }
              : undefined}
            className={`w-full py-3 rounded-pill font-bold transition-all ${
              canSubmit
                ? 'hover:bg-[#4A2E25] active:scale-[0.99]'
                : 'bg-earthy-divider text-earthy-cocoaSoft cursor-not-allowed'
            }`}
          >
            {busy ? 'Adding…' : 'Add superstar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-full py-3 rounded-pill text-earthy-cocoaSoft font-bold hover:text-earthy-cocoa active:scale-[0.99] transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
