import { useEffect, useRef } from 'react'

// Minimal accessible confirm dialog. Shows a backdrop + titled card with
// Cancel and Confirm buttons. Confirm is auto-focused for fast keyboard
// completion; Escape cancels; clicks outside the card cancel.
const ConfirmModal = ({
  show,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (show && confirmRef.current) {
      const t = setTimeout(() => confirmRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [show])

  useEffect(() => {
    if (!show) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, onCancel])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-lg font-black font-display text-gray-800 mb-2">
          {title}
        </h2>
        {body && <p className="text-sm text-gray-500 font-semibold mb-5">{body}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white font-extrabold text-sm text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-extrabold text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-r from-green-500 to-purple-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
