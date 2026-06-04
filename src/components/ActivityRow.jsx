import { useEffect, useState } from 'react'
import Icon from './Icon'

// Single row inside ActivitiesModal: emoji + label input + colour chip + up/down + delete.
// Mirrors iOS components/ActivityRow.tsx — same shape (id, label, emoji, color), same
// onBlur-saves pattern, same chevron reorder (no drag library to keep it light).
export default function ActivityRow({
  activity,
  displayLabel,
  isFirst,
  isLast,
  labels,
  onLabelChange,
  onPickEmoji,
  onPickColor,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  const visibleLabel = displayLabel ?? activity.label ?? ''
  const [label, setLabel] = useState(visibleLabel)

  // Reset local state if the prop label changes externally (preset apply, undo).
  useEffect(() => {
    setLabel(visibleLabel)
  }, [activity.id, visibleLabel])

  const commit = () => {
    const trimmed = label.trim()
    if (trimmed !== visibleLabel) onLabelChange(activity.id, trimmed)
  }

  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_36px_32px_36px] items-center gap-2 rounded-2xl border border-earthy-divider bg-earthy-ivory px-2 py-2 font-jakarta md:grid-cols-[56px_minmax(260px,1fr)_72px_92px_52px] md:gap-3 md:px-3">
      <button
        type="button"
        onClick={() => onPickEmoji(activity.id)}
        aria-label={labels?.changeEmoji || 'Change task emoji'}
        className="h-11 w-11 rounded-full bg-earthy-cream flex items-center justify-center text-2xl active:scale-[0.96] transition-transform focus-visible:ring-2 focus-visible:ring-earthy-terracotta md:h-12 md:w-12"
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
        placeholder={labels?.taskName || 'Task name'}
        maxLength={18}
        className="min-h-11 min-w-0 rounded-xl border-2 border-earthy-divider bg-earthy-cream px-3 py-2 text-sm font-bold text-earthy-cocoa focus:border-earthy-terracotta focus:outline-none md:text-base"
      />

      <div className="flex justify-center md:justify-start">
        <button
          type="button"
          onClick={() => onPickColor(activity.id)}
          aria-label={labels?.changeColor || 'Change task colour'}
          className="h-9 w-9 rounded-full border-2 border-earthy-cream shadow-earthy-soft active:scale-[0.96] transition-transform focus-visible:ring-2 focus-visible:ring-earthy-terracotta md:h-10 md:w-10"
          style={{ background: activity.color || '#E8DCC4' }}
        />
      </div>

      <div className="flex flex-col gap-0.5 md:flex-row md:gap-1.5">
        <button
          type="button"
          onClick={() => onMoveUp(activity.id)}
          disabled={isFirst}
          aria-label={labels?.moveUp || 'Move up'}
          className="flex h-5 w-7 items-center justify-center rounded-md bg-earthy-cream text-xs font-bold text-earthy-cocoa disabled:opacity-30 active:scale-[0.94] md:h-9 md:w-9"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(activity.id)}
          disabled={isLast}
          aria-label={labels?.moveDown || 'Move down'}
          className="flex h-5 w-7 items-center justify-center rounded-md bg-earthy-cream text-xs font-bold text-earthy-cocoa disabled:opacity-30 active:scale-[0.94] md:h-9 md:w-9"
        >
          ▼
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(activity.id)}
        aria-label={labels?.delete || 'Delete task'}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-semantic-danger/10 text-semantic-danger active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-semantic-danger/40"
      >
        <Icon name="delete" size={16} />
      </button>
    </div>
  )
}
