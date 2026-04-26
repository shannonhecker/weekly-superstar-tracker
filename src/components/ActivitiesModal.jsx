import { useEffect, useMemo, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ACTIVITY_COLORS, ACTIVITY_EMOJIS, ACTIVITY_PRESETS } from '../lib/themes'
import { useToast } from '../contexts/ToastContext'
import Modal from './Modal'
import ActivityRow from './ActivityRow'

const MAX_ACTIVITIES = 10

function genId(label) {
  const slug =
    (label || 'task')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20) || 'task'
  return `${slug}-${Date.now().toString(36).slice(-5)}`
}

function pickRandomColor(existingColors) {
  const used = new Set(existingColors.filter(Boolean))
  const free = ACTIVITY_COLORS.filter((c) => !used.has(c))
  const pool = free.length > 0 ? free : ACTIVITY_COLORS
  return pool[Math.floor(Math.random() * pool.length)]
}

// Web port of iOS components/ActivitiesModal.tsx. Same three sub-views (list,
// emoji, colour, preset) toggled inside a single Modal — no nested modals.
// Same merge-by-id preset semantics: existing customised activities win,
// new ids append, 10-cap respected.
export default function ActivitiesModal({ open, onClose, kid, boardId }) {
  const toast = useToast()
  const [view, setView] = useState('list')
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setView('list')
    setEditingId(null)
    setBusy(false)
  }, [open, kid?.id])

  const activities = useMemo(
    () => (kid?.activities && kid.activities.length > 0 ? kid.activities : []),
    [kid?.activities],
  )

  if (!kid) return null

  const ref = doc(db, 'boards', boardId, 'kids', kid.id)

  const persist = async (next) => {
    setBusy(true)
    try {
      await updateDoc(ref, { activities: next })
    } catch {
      toast.error('Could not save tasks — try again')
    } finally {
      setBusy(false)
    }
  }

  const updateActivity = (id, patch) => {
    const next = activities.map((a) => (a.id === id ? { ...a, ...patch } : a))
    return persist(next)
  }

  const moveUp = (id) => {
    const idx = activities.findIndex((a) => a.id === id)
    if (idx <= 0) return
    const next = [...activities]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    return persist(next)
  }

  const moveDown = (id) => {
    const idx = activities.findIndex((a) => a.id === id)
    if (idx < 0 || idx >= activities.length - 1) return
    const next = [...activities]
    ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
    return persist(next)
  }

  const deleteActivity = (id) => {
    const next = activities.filter((a) => a.id !== id)
    return persist(next)
  }

  const addActivity = () => {
    if (activities.length >= MAX_ACTIVITIES) return
    const newActivity = {
      id: genId(''),
      label: '',
      emoji: '⭐',
      color: pickRandomColor(activities.map((a) => a.color || '')),
    }
    return persist([...activities, newActivity])
  }

  const applyPreset = (presetKey) => {
    const preset = ACTIVITY_PRESETS[presetKey]
    if (!preset) return
    const byId = new Map(activities.map((a) => [a.id, a]))
    for (const item of preset.activities) {
      if (byId.has(item.id)) continue
      if (byId.size >= MAX_ACTIVITIES) break
      byId.set(item.id, { ...item })
    }
    setView('list')
    return persist(Array.from(byId.values()))
  }

  const renderHeader = (title, showBack) => (
    <div className="flex items-center mb-4 min-h-[32px]">
      {showBack && (
        <button
          type="button"
          onClick={() => setView('list')}
          className="flex items-center text-sm font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa active:scale-[0.98]"
          aria-label="Back"
        >
          <span className="mr-1">←</span> Back
        </button>
      )}
      <h2
        className="font-extrabold text-lg flex-1 text-center text-earthy-cocoa"
        style={{ marginRight: showBack ? '56px' : 0 }}
      >
        {title}
      </h2>
    </div>
  )

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <div className="max-h-[65vh] overflow-y-auto">
        {view === 'list' && (
          <div>
            {renderHeader(kid.name ? `${kid.name}'s tasks` : 'Tasks', false)}

            <div className="flex flex-col gap-2">
              {activities.map((a, i) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  isFirst={i === 0}
                  isLast={i === activities.length - 1}
                  onLabelChange={(id, label) => updateActivity(id, { label })}
                  onPickEmoji={(id) => {
                    setEditingId(id)
                    setView('emoji')
                  }}
                  onPickColor={(id) => {
                    setEditingId(id)
                    setView('color')
                  }}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  onDelete={deleteActivity}
                />
              ))}
              {activities.length === 0 && (
                <div className="text-center text-sm text-earthy-cocoaSoft py-6">
                  No tasks yet. Add one or apply a preset to get started.
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={addActivity}
                disabled={activities.length >= MAX_ACTIVITIES || busy}
                className="flex-1 py-3 rounded-pill bg-earthy-ivory border border-earthy-divider text-earthy-cocoa font-bold flex items-center justify-center gap-1 disabled:opacity-40 active:scale-[0.98]"
              >
                <span>＋</span>
                <span>
                  Add task {activities.length}/{MAX_ACTIVITIES}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setView('preset')}
                className="flex-1 py-3 rounded-pill bg-earthy-ivory border border-earthy-divider text-earthy-cocoa font-bold flex items-center justify-center gap-1 active:scale-[0.98]"
              >
                <span>✨</span>
                <span>Apply preset</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
              className="w-full mt-4 py-3 rounded-pill font-bold hover:bg-[#4A2E25] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              Done
            </button>
          </div>
        )}

        {view === 'emoji' && (
          <div>
            {renderHeader('Pick an emoji', true)}
            <div className="flex flex-wrap justify-center gap-1.5">
              {ACTIVITY_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    if (editingId) updateActivity(editingId, { emoji: e })
                    setView('list')
                  }}
                  className="w-12 h-12 rounded-full bg-earthy-ivory border border-earthy-divider hover:bg-earthy-terracottaSoft/50 flex items-center justify-center text-2xl active:scale-[0.94]"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'color' && (
          <div>
            {renderHeader('Pick a colour', true)}
            <div className="flex flex-wrap justify-center gap-3">
              {ACTIVITY_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    if (editingId) updateActivity(editingId, { color: hex })
                    setView('list')
                  }}
                  aria-label={`Colour ${hex}`}
                  className="w-12 h-12 rounded-full border-[3px] border-earthy-cream shadow-earthy-soft active:scale-[0.94]"
                  style={{ background: hex }}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'preset' && (
          <div>
            {renderHeader('Apply a preset', true)}
            <p className="text-xs text-earthy-cocoaSoft mb-3">
              Adds the preset's tasks to the list. Existing tasks with the same id are
              kept as-is. Cap of {MAX_ACTIVITIES} tasks is respected.
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(ACTIVITY_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="rounded-2xl p-3 bg-earthy-ivory border border-earthy-divider hover:border-earthy-terracotta text-left active:scale-[0.99] transition-all"
                >
                  <div className="font-bold mb-1.5 text-earthy-cocoa">{preset.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.activities.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold text-earthy-cocoa"
                        style={{ background: a.color }}
                      >
                        <span className="mr-1 text-base leading-none">{a.emoji}</span>
                        <span>{a.label}</span>
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
