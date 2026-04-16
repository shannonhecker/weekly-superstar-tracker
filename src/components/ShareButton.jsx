import { useState } from 'react'

const ShareButton = ({ board }) => {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  if (!board?.shareCode) return null

  const url = `${window.location.origin}/join/${board.shareCode}`

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
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-xl bg-white border-2 border-purple-300 text-xs font-extrabold text-purple-600 flex items-center gap-1"
      >
        🔗 Share
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl p-4 w-72 border border-gray-100">
            <div className="text-xs font-extrabold text-gray-500 mb-2">Invite family with this link</div>
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono text-gray-700 break-all mb-3">
              {url}
            </div>
            <button
              onClick={copy}
              className="w-full py-2 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500"
            >
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
            <div className="text-[10px] font-semibold text-gray-400 mt-2 text-center">
              Code: <span className="font-mono font-bold text-gray-600">{board.shareCode}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ShareButton
