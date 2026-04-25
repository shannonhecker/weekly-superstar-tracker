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
        <label className="text-xs font-bold text-earthy-cocoaSoft mb-1 block uppercase tracking-wide">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
          className="w-full px-3 py-3 rounded-xl border-2 border-earthy-divider bg-earthy-ivory focus:border-earthy-terracotta focus:outline-none text-base font-bold text-earthy-cocoa"
        />

        {/* Theme */}
        <label className="text-xs font-bold text-earthy-cocoaSoft mb-1 mt-4 block uppercase tracking-wide">Theme</label>
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
                  background: `${t.accent}55`,
                  border: active ? `3px solid ${t.deeper}` : '3px solid transparent',
                  boxShadow: active ? `0 2px 8px ${t.deeper}33` : 'none',
                }}
              >
                {t.emoji}
              </button>
            )
          })}
        </div>

        {/* Reorder */}
        <label className="text-xs font-bold text-earthy-cocoaSoft mb-1 mt-4 block uppercase tracking-wide">Position</label>
        <div className="flex gap-2">
          <button
            onClick={() => swapOrder('up')}
            disabled={isFirst}
            className="flex-1 py-2.5 rounded-pill bg-earthy-terracottaSoft text-earthy-cocoa font-bold disabled:opacity-40"
          >
            ← Move left
          </button>
          <button
            onClick={() => swapOrder('down')}
            disabled={isLast}
            className="flex-1 py-2.5 rounded-pill bg-earthy-terracottaSoft text-earthy-cocoa font-bold disabled:opacity-40"
          >
            Move right →
          </button>
        </div>

        {/* Edit tasks */}
        <button
          type="button"
          onClick={() => setTasksOpen(true)}
          className="w-full mt-4 py-3 px-3 rounded-xl bg-earthy-ivory hover:bg-earthy-terracottaSoft/40 border border-earthy-divider flex items-center gap-2 text-left active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-earthy-terracotta"
        >
          <span className="text-lg">📝</span>
          <span className="font-bold flex-1 text-earthy-cocoa">Edit tasks</span>
          <span className="text-xs font-bold text-earthy-cocoaSoft mr-1">
            {(kid.activities?.length ?? 0)} of 10
          </span>
          <span className="text-earthy-cocoaSoft">›</span>
        </button>

        {/* Delete */}
        <div className="mt-6 pt-4 border-t border-earthy-divider">
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="w-full py-3 rounded-pill border-2 border-[#B85450]/40 text-[#B85450] font-bold hover:bg-[#B85450]/05"
            >
              🗑 Delete this superstar
            </button>
          ) : (
            <div className="bg-[#B85450]/10 rounded-xl p-3">
              <p className="text-sm font-bold text-[#B85450] mb-2">
                This cannot be undone. Type <span className="font-extrabold">{kid.name}</span> to confirm.
              </p>
              <input
                value={deleteTyped}
                onChange={(e) => setDeleteTyped(e.target.value)}
                placeholder={kid.name}
                autoFocus
                className="w-full px-3 py-2 rounded-lg border-2 border-[#B85450]/30 focus:border-[#B85450] focus:outline-none font-bold bg-earthy-ivory text-earthy-cocoa"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setConfirmingDelete(false); setDeleteTyped('') }}
                  disabled={busy}
                  className="flex-1 py-2 rounded-pill bg-earthy-ivory border-2 border-earthy-divider font-bold text-earthy-cocoaSoft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || busy}
                  className="flex-1 py-2 rounded-pill text-earthy-ivory font-bold bg-[#B85450] disabled:opacity-40"
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
        className="w-full mt-4 py-2 rounded-pill text-earthy-cocoaSoft font-bold text-sm hover:text-earthy-cocoa"
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
