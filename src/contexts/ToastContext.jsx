import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((ts) => [...ts, { id, type, message }])
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3500)
  }, [])

  // Memoize so consumers' useEffect deps that include `toast` don't re-run
  // every time a toast is added/removed. push is already stable via
  // useCallback so this just stabilises the wrapping object.
  const api = useMemo(() => ({
    error: (m) => push('error', m),
    success: (m) => push('success', m),
    info: (m) => push('info', m),
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`fade-in px-4 py-2 rounded-2xl shadow-lg font-bold text-sm ${
              t.type === 'error' ? 'bg-red-100 text-red-700' :
              t.type === 'success' ? 'bg-green-100 text-green-700' :
              'bg-white text-gray-700'
            }`}
          >
            {t.type === 'error' && '⚠️ '}
            {t.type === 'success' && '✅ '}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback so consumers never crash in isolated tests / storybooks
    return { error: () => {}, success: () => {}, info: () => {} }
  }
  return ctx
}
