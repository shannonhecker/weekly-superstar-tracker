import { useState } from 'react'

export default function ShareModal({ open, onClose, shareCode }) {
  const [copied, setCopied] = useState(false)
  if (!open) return null
  const url = `${window.location.origin}/join/${shareCode}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center px-5 fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-earthy-lifted ring-1 ring-earthy-divider modal-in font-jakarta"
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔗</div>
          <h2 className="text-lg font-extrabold text-earthy-cocoa">Invite family with this link</h2>
        </div>
        <div className="bg-earthy-ivory border border-earthy-divider rounded-xl p-3 text-sm font-bold text-earthy-cocoa break-all mb-3">
          {url}
        </div>
        <button
          onClick={copy}
          className="w-full py-3 rounded-pill text-earthy-ivory font-bold bg-earthy-cocoa hover:bg-[#4A2E25] active:scale-[0.99] transition-all"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <p className="text-center text-xs text-earthy-cocoaSoft mt-3 font-bold">
          Code: {shareCode}
        </p>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-pill text-earthy-cocoaSoft font-bold text-sm hover:text-earthy-cocoa"
        >
          Close
        </button>
      </div>
    </div>
  )
}
