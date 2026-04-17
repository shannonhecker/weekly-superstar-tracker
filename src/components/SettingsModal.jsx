import { useEffect, useState } from 'react'
import { updateBoard, regenerateShareCode, removeMember, setBoardPin } from '../firebase/boards'
import PinPrompt from './PinPrompt'
import ConfirmModal from './ConfirmModal'

// Settings modal — rename board, regenerate invite code, manage members,
// set/clear parent PIN. Only the board admin can remove members or
// regenerate the code; other members can read state and set their own
// local PIN unlock.
const SettingsModal = ({ board, user, onClose }) => {
  const [name, setName] = useState(board.name || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)
  const [pinPrompt, setPinPrompt] = useState(null) // 'set' | 'clear' | null
  const [toast, setToast] = useState('')

  const isAdmin = board.adminId === user?.uid

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const saveName = async () => {
    if (!name.trim() || name === board.name) return
    setSaving(true)
    try {
      await updateBoard(board.id, { name: name.trim() })
      setToast('Board renamed')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const regen = async () => {
    setConfirmRegen(false)
    try {
      const code = await regenerateShareCode(board.id)
      setToast(`New invite code: ${code}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (memberId) => {
    setConfirmRemoveId(null)
    try {
      await removeMember(board.id, memberId)
      setToast('Member removed')
    } catch (err) {
      setError(err.message)
    }
  }

  const clearPin = async () => {
    try {
      await setBoardPin(board.id, null)
      setToast('PIN removed')
    } catch (err) {
      setError(err.message)
    }
  }

  const url = `${window.location.origin}/join/${board.shareCode}`

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 id="settings-title" className="text-lg font-black font-display text-gray-800">
                ⚙️ Board settings
              </h2>
              <button onClick={onClose} aria-label="Close" className="text-gray-400 text-2xl leading-none">×</button>
            </div>

            {/* Rename */}
            <section className="mb-5">
              <label htmlFor="board-name" className="block text-xs font-extrabold text-gray-500 mb-1">Board name</label>
              <div className="flex gap-2">
                <input
                  id="board-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isAdmin}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none focus:border-purple-400 disabled:bg-gray-50"
                />
                {isAdmin && (
                  <button
                    onClick={saveName}
                    disabled={saving || !name.trim() || name === board.name}
                    className="px-4 py-3 rounded-xl font-extrabold text-white text-xs bg-gradient-to-r from-green-500 to-purple-500 disabled:opacity-50"
                  >
                    Save
                  </button>
                )}
              </div>
            </section>

            {/* Invite code */}
            <section className="mb-5">
              <label className="block text-xs font-extrabold text-gray-500 mb-1">Invite link</label>
              <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono text-gray-700 break-all mb-2">{url}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(url).then(
                      () => setToast('Link copied'),
                      () => setToast('Copy failed')
                    )
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-purple-300 text-purple-600 font-bold text-xs"
                >
                  Copy link
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setConfirmRegen(true)}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-red-200 text-red-500 font-bold text-xs"
                  >
                    Regenerate
                  </button>
                )}
              </div>
              {isAdmin && (
                <p className="text-[10px] text-gray-400 font-semibold mt-2">
                  Regenerating invalidates the current link. Guests stay in the board until they sign out.
                </p>
              )}
            </section>

            {/* Parent PIN */}
            <section className="mb-5">
              <label className="block text-xs font-extrabold text-gray-500 mb-1">Parent PIN</label>
              <p className="text-[11px] text-gray-400 font-semibold mb-2">
                Set a 4+ digit PIN to stop kids editing activities, removing stickers, or opening settings.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPinPrompt('set')}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-purple-300 text-purple-600 font-bold text-xs"
                >
                  {board.pinHash ? 'Change PIN' : 'Set PIN'}
                </button>
                {board.pinHash && (
                  <button
                    onClick={clearPin}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-red-200 text-red-500 font-bold text-xs"
                  >
                    Remove PIN
                  </button>
                )}
              </div>
            </section>

            {/* Members */}
            <section className="mb-2">
              <label className="block text-xs font-extrabold text-gray-500 mb-2">Members ({board.memberIds?.length || 0})</label>
              <div className="space-y-1">
                {(board.memberIds || []).map((mid) => (
                  <div key={mid} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                    <span className="text-xl">{mid === board.adminId ? '👑' : '👤'}</span>
                    <span className="flex-1 text-xs font-mono text-gray-600 truncate">
                      {mid === user?.uid ? 'You' : mid.slice(0, 10) + '...'}
                      {mid === board.adminId && <span className="ml-2 text-[10px] text-purple-500 font-bold">admin</span>}
                    </span>
                    {isAdmin && mid !== board.adminId && (
                      <button
                        onClick={() => setConfirmRemoveId(mid)}
                        className="text-red-500 text-xs font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {error && <div className="text-red-500 text-xs font-bold mt-3" role="alert">{error}</div>}

            {toast && (
              <div className="mt-4 p-2 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 text-xs font-bold text-center">
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirmRegen}
        title="Regenerate invite link?"
        body="The current link will stop working. You'll need to share the new one."
        confirmLabel="Regenerate"
        danger
        onCancel={() => setConfirmRegen(false)}
        onConfirm={regen}
      />

      <ConfirmModal
        show={!!confirmRemoveId}
        title="Remove this member?"
        body="They'll lose access to this board immediately."
        confirmLabel="Remove"
        danger
        onCancel={() => setConfirmRemoveId(null)}
        onConfirm={() => remove(confirmRemoveId)}
      />

      {pinPrompt === 'set' && (
        <PinPrompt
          board={board}
          mode="set"
          title="Set parent PIN"
          onSuccess={async (pin) => {
            try {
              await setBoardPin(board.id, pin)
              setToast('PIN saved')
            } catch (err) {
              setError(err.message)
            } finally {
              setPinPrompt(null)
            }
          }}
          onCancel={() => setPinPrompt(null)}
        />
      )}
    </>
  )
}

export default SettingsModal
