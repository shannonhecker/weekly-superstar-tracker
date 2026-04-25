import { useEffect, useState } from 'react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { THEMES } from '../lib/themes'
import { useToast } from '../contexts/ToastContext'
import Modal from './Modal'
import ActivitiesModal from './ActivitiesModal'

export default function KidEditModal({ open, onClose, kid, kids, boardId, onDeleted }) {
  const [name, setName] = useState(kid?.name || '')
  const [theme, setTheme] = useState(kid?.theme || 'football')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteTyped, setDeleteTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    setName(kid?.name || '')
    setTheme(kid?.theme || 'football')
    setConfirmingDelete(false)
    setDeleteTyped('')
    setTasksOpen(false)
  }, [open, kid?.id])

  if (!kid) return null

  const sorted = [...(kids || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  const idx = sorted.findIndex((k) => k.id === kid.id)
  const isFirst = idx <= 0
  const isLast = idx >= sorted.length - 1

  const ref = doc(db, 'boards', boardId, 'kids', kid.id)

  const saveName = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === kid.name) return
    try { await updateDoc(ref, { name: trimmed }) }
    catch { toast.error('Could not save name') }
  }

  const saveTheme = async (newTheme) => {
    if (newTheme === theme) return
    setTheme(newTheme)
    try { await updateDoc(ref, { theme: newTheme }) }
    catch { toast.error('Could not save theme'); setTheme(kid.theme) }
  }

  const swapOrder = async (direction) => {
    const other = direction === 'up' ? sorted[idx - 1] : sorted[idx + 1]
    if (!other) return
    try {
      await Promise.all([
        updateDoc(ref, { order: other.order ?? 0 }),
        updateDoc(doc(db, 'boards', boardId, 'kids', other.id), { order: kid.order ?? 0 }),
      ])
    } catch { toast.error('Could not reorder — try again') }
  }

  const canDelete = deleteTyped.trim().toLowerCase() === kid.name.trim().toLowerCase()
  const handleDelete = async () => {
    if (!canDelete) return
    setBusy(true)
    try {
      await deleteDoc(ref)
      onDeleted?.(kid.id)
      onClose?.()
    } catch { toast.error('Could not delete — try again') }
    setBusy(false)
  }

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} emoji="✏️" title={`Edit ${kid.name}`}>
      <div className="max-h-[65vh] overflow-y-auto">
        {/* Name */}
        <label className="text-xs font-bold text-gray-500 mb-1 block">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
          className="w-full px-3 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-base font-bold"
        />

        {/* Theme */}
        <label className="text-xs font-bold text-gray-500 mb-1 mt-4 block">Theme</label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(THEMES).map(([key, t]) => {
            const active = theme === key
            return (
              <button
                key={key}
                onClick={() => saveTheme(key)}
                aria-label={t.label}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all"
                style={{
                  background: `${t.accent}33`,
                  border: active ? `3px solid ${t.accent}` : '3px solid transparent',
                  boxShadow: active ? `0 2px 8px ${t.accent}55` : 'none',
                }}
              >
                {t.emoji}
              </button>
            )
          })}
        </div>

        {/* Reorder */}
        <label className="text-xs font-bold text-gray-500 mb-1 mt-4 block">Position</label>
        <div className="flex gap-2">
          <button
            onClick={() => swapOrder('up')}
            disabled={isFirst}
            className="flex-1 py-2 rounded-xl bg-purple-50 text-purple-600 font-bold disabled:opacity-40"
          >
            ← Move left
          </button>
          <button
            onClick={() => swapOrder('down')}
            disabled={isLast}
            className="flex-1 py-2 rounded-xl bg-purple-50 text-purple-600 font-bold disabled:opacity-40"
          >
            Move right →
          </button>
        </div>

        {/* Edit tasks */}
        <button
          type="button"
          onClick={() => setTasksOpen(true)}
          className="w-full mt-4 py-3 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 flex items-center gap-2 text-left active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-purple-300"
        >
          <span className="text-lg">📝</span>
          <span className="font-bold flex-1 text-gray-800">Edit tasks</span>
          <span className="text-xs font-bold text-gray-500 mr-1">
            {(kid.activities?.length ?? 0)} of 10
          </span>
          <span className="text-gray-400">›</span>
        </button>

        {/* Delete */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold"
            >
              🗑 Delete this superstar
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-sm font-bold text-red-700 mb-2">
                This cannot be undone. Type <span className="font-bold font-display">{kid.name}</span> to confirm.
              </p>
              <input
                value={deleteTyped}
                onChange={(e) => setDeleteTyped(e.target.value)}
                placeholder={kid.name}
                autoFocus
                className="w-full px-3 py-2 rounded-lg border-2 border-red-200 focus:border-red-400 focus:outline-none font-bold"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setConfirmingDelete(false); setDeleteTyped('') }}
                  disabled={busy}
                  className="flex-1 py-2 rounded-xl bg-white border-2 border-gray-200 font-bold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || busy}
                  className="flex-1 py-2 rounded-xl text-white font-bold bg-red-500 disabled:opacity-40"
                >
                  {busy ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        disabled={busy}
        className="w-full mt-4 py-2 rounded-xl text-gray-500 font-bold text-sm"
      >
        Done
      </button>

      <ActivitiesModal
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        kid={kid}
        boardId={boardId}
      />
    </Modal>
  )
}
