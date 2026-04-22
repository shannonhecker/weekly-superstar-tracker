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
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔗</div>
          <h2 className="text-lg font-black font-display">Invite family with this link</h2>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-sm font-bold text-purple-700 break-all mb-3">
          {url}
        </div>
        <button
          onClick={copy}
          className="w-full py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-green-400 to-purple-500"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3 font-bold">
          Code: {shareCode}
        </p>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-xl text-gray-400 font-bold text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
