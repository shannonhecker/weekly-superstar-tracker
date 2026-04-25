import { useEffect } from 'react'

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

export default function Modal({ open, onClose, title, emoji, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    lockBody()
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockBody()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center px-5 fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-earthy-lifted ring-1 ring-earthy-divider modal-in font-jakarta"
      >
        {(title || emoji) && (
          <div className="text-center mb-4">
            {emoji && <div className="text-4xl mb-2">{emoji}</div>}
            {title && <h2 className="text-lg font-extrabold text-earthy-cocoa">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
