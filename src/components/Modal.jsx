import { useEffect, useRef, useId } from 'react'

// Module-level reference count so multiple modals (nested or stacked)
// correctly lock/unlock body scroll exactly once.
let lockCount = 0
function lockBody() {
  if (lockCount === 0) document.body.style.overflow = 'hidden'
  lockCount++
}
function unlockBody() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) document.body.style.overflow = ''
}

// Selector matching every focusable element a sighted keyboard user
// would tab through. Used by the focus trap to find the first/last
// focusable inside the modal and to know what to cycle between.
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function Modal({ open, onClose, title, emoji, emojiClassName, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  // Where focus was BEFORE the modal opened — restored when we close
  // so the keyboard user lands back on the trigger button instead of
  // jumping to the top of the document.
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current = document.activeElement
    lockBody()

    // Focus the first focusable inside the dialog. If nothing's
    // focusable (rare — a content-only modal), focus the dialog itself
    // so screen readers still announce it.
    const node = dialogRef.current
    if (node) {
      const first = node.querySelector(FOCUSABLE)
      if (first instanceof HTMLElement) first.focus()
      else node.focus()
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }
      // Focus trap — cycle Tab within the modal so the user can't tab
      // back to the underlying page.
      if (e.key === 'Tab' && node) {
        const focusables = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
          (el) => el instanceof HTMLElement && !el.hasAttribute('disabled'),
        )
        if (focusables.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockBody()
      // Restore focus to the trigger on close. setTimeout 0 lets React
      // finish unmounting before we move focus, otherwise focus can
      // briefly land on body in some browsers.
      const target = previouslyFocusedRef.current
      if (target instanceof HTMLElement) {
        setTimeout(() => target.focus(), 0)
      }
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center px-5 fade-in"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-earthy-pop modal-in font-jakarta outline-none"
      >
        {(title || emoji) && (
          <div className="text-center mb-4">
            {emoji && <div className={emojiClassName || 'text-4xl mb-2'} aria-hidden="true">{emoji}</div>}
            {title && <h2 id={titleId} className="text-lg font-extrabold text-earthy-cocoa">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
