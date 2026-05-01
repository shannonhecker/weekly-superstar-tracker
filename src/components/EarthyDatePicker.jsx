import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import './EarthyDatePicker.css'
import Icon from './Icon'

// Themed wrapper around react-day-picker. We don't fork the lib's
// styles — we rely on its v9 CSS-variable surface and override only
// what the earthy palette demands. The result is a single .earthy-rdp
// scope that paints accent/today/hover in cocoa & cream.
//
// Stores YYYY-MM-DD strings (Firestore-friendly), not Date objects.

function toIso(date) {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromIso(value) {
  if (!value) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return undefined
  // Use local-time noon to dodge DST/timezone day-flip surprises.
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0)
}

function formatHuman(date) {
  if (!date) return ''
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EarthyDatePicker({
  value,
  onChange,
  placeholder = 'Add a birthday',
  ariaLabel = 'Select a date',
}) {
  const [open, setOpen] = useState(false)
  const selected = fromIso(value)
  const popoverRef = useRef(null)

  // Scroll the popover into view when it opens — the picker is rendered
  // inside a modal's overflow-y scroll container, so otherwise the
  // calendar can land below the visible viewport and look like the
  // click did nothing.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      popoverRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 30)
    return () => window.clearTimeout(id)
  }, [open])

  const toggle = () => setOpen((v) => !v)

  const onSelect = (next) => {
    if (!next) {
      onChange('')
      setOpen(false)
      return
    }
    onChange(toIso(next))
    setOpen(false)
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={toggle}
        aria-label={ariaLabel}
        aria-expanded={open}
        className="w-full px-4 py-3 rounded-xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-cocoa focus:ring-2 focus:ring-earthy-cocoa/20 outline-none font-bold text-earthy-cocoa transition-colors text-left flex items-center justify-between gap-3"
      >
        <span className={selected ? '' : 'text-earthy-cocoaSoft/70'}>
          {selected ? formatHuman(selected) : placeholder}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              onClick={clear}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clear(e) } }}
              className="text-xs font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa underline underline-offset-2"
            >
              Clear
            </span>
          )}
          <span aria-hidden="true" className="text-earthy-cocoaSoft flex items-center">
            <Icon name="calendar" size={20} />
          </span>
        </span>
      </button>

      {open && (
        <div ref={popoverRef} className="earthy-rdp mt-2 rounded-2xl bg-earthy-card border border-earthy-divider shadow-earthy-card p-2 inline-block">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={onSelect}
            captionLayout="dropdown"
            startMonth={new Date(1990, 0)}
            endMonth={new Date(new Date().getFullYear(), 11)}
            weekStartsOn={1}
            showOutsideDays
          />
        </div>
      )}
    </div>
  )
}
