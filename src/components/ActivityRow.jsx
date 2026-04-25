import { useEffect, useState } from 'react'

// Single row inside ActivitiesModal: emoji + label input + colour chip + up/down + delete.
// Mirrors iOS components/ActivityRow.tsx — same shape (id, label, emoji, color), same
// onBlur-saves pattern, same chevron reorder (no drag library to keep it light).
export default function ActivityRow({
  activity,
  isFirst,
  isLast,
  onLabelChange,
  onPickEmoji,
  onPickColor,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  const [label, setLabel] = useState(activity.label || '')

  // Reset local state if the prop label changes externally (preset apply, undo).
  useEffect(() => {
    setLabel(activity.label || '')
  }, [activity.id, activity.label])

  const commit = () => {
    const trimmed = label.trim()
    if (trimmed !== (activity.label || '')) onLabelChange(activity.id, trimmed)
  }

  return (
    <div className="flex items-center gap-1.5 rounded-2xl px-2 py-2 bg-purple-50">
      <button
        type="button"
        onClick={() => onPickEmoji(activity.id)}
        aria-label="Change task emoji"
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl active:scale-[0.96] transition-transform focus-visible:ring-2 focus-visible:ring-purple-300"
      >
        {activity.emoji || '⭐'}
      </button>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        placeholder="Task name"
        maxLength={18}
        className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-sm font-bold"
      />

      <button
        type="button"
        onClick={() => onPickColor(activity.id)}
        aria-label="Change task colour"
        className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 active:scale-[0.96] transition-transform focus-visible:ring-2 focus-visible:ring-purple-300"
        style={{ background: activity.color || '#E9D5FF' }}
      />

      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onMoveUp(activity.id)}
          disabled={isFirst}
          aria-label="Move up"
          className="w-7 h-5 rounded-md bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center disabled:opacity-30 active:scale-[0.94]"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(activity.id)}
          disabled={isLast}
          aria-label="Move down"
          className="w-7 h-5 rounded-md bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center disabled:opacity-30 active:scale-[0.94]"
        >
          ▼
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(activity.id)}
        aria-label="Delete task"
        className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-sm shrink-0 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-red-300"
      >
        🗑
      </button>
    </div>
  )
}
