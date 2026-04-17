import { useEffect, useRef } from 'react'

// Accessible undo snackbar. Auto-dismisses after `duration` ms unless the
// user clicks Undo. Caller controls visibility via `show`.
const UndoToast = ({ show, message, onUndo, onDismiss, duration = 5000 }) => {
  const timerRef = useRef(null)
  useEffect(() => {
    if (!show) return
    timerRef.current = setTimeout(() => onDismiss?.(), duration)
    return () => clearTimeout(timerRef.current)
  }, [show, duration, onDismiss])

  if (!show) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-xl"
    >
      <span className="text-sm font-semibold">{message}</span>
      {onUndo && (
        <button
          type="button"
          onClick={() => { clearTimeout(timerRef.current); onUndo() }}
          className="text-sm font-extrabold text-amber-300 hover:text-amber-200 focus:outline-none focus-visible:underline px-1"
        >
          Undo
        </button>
      )}
      <button
        type="button"
        onClick={() => { clearTimeout(timerRef.current); onDismiss?.() }}
        aria-label="Dismiss"
        className="text-gray-400 hover:text-white focus:outline-none text-lg leading-none px-1"
      >
        ×
      </button>
    </div>
  )
}

export default UndoToast
