import { useEffect, useRef, useState } from 'react'
import { verifyBoardPin } from '../firebase/boards'

// Numeric PIN entry modal. Used either to unlock parent mode (existing
// PIN check) or to set/change a PIN (no check, just collect digits).
// When `mode === 'verify'`, resolves successfully only if the entered
// PIN hashes to board.pinHash.
const PinPrompt = ({ board, mode = 'verify', title, onSuccess, onCancel }) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const submit = async (e) => {
    e.preventDefault()
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'verify') {
        const ok = await verifyBoardPin(board, pin)
        if (!ok) {
          setError('Wrong PIN')
          setBusy(false)
          return
        }
      }
      onSuccess(pin)
    } catch (err) {
      setError(err.message || 'Could not verify')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9997] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-title"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xs p-5 sm:p-6"
      >
        <h2 id="pin-title" className="text-lg font-black font-display text-gray-800 mb-1">
          🔒 {title || (mode === 'verify' ? 'Enter parent PIN' : 'Set parent PIN')}
        </h2>
        <p className="text-xs text-gray-400 font-semibold mb-4">
          {mode === 'verify'
            ? 'Unlocks editing, deletes, and settings for this session.'
            : 'At least 4 digits. Leave blank to remove the PIN.'}
        </p>
        <label htmlFor="pin-input" className="sr-only">PIN</label>
        <input
          id="pin-input"
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-center text-2xl font-extrabold outline-none focus:border-purple-400 tracking-[0.5em]"
        />
        {error && <div className="text-red-500 text-xs font-bold mt-2" role="alert">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white font-extrabold text-sm text-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500 disabled:opacity-50"
          >
            {busy ? 'Checking...' : mode === 'verify' ? 'Unlock' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PinPrompt
