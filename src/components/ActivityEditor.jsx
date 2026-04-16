import { useState } from 'react'

const COLORS = ['#7C6FF7', '#4ECDC4', '#45B7D1', '#F7B731', '#FC5C65', '#FF6348', '#26DE81', '#FD9644', '#9C27B0', '#FF9F43']
const EMOJI_SUGGESTIONS = ['⭐', '🎯', '🎨', '🎵', '🧩', '🌳', '🏃', '🚴', '🧘', '💧', '🥗', '🧸', '📝', '🧹', '💤']

const ActivityEditor = ({ activities, onChange }) => {
  const [showAdd, setShowAdd] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')

  const toggle = (id) => {
    const enabled = activities.some((a) => a.id === id)
    // For the editor, toggle is just remove-if-present
    if (enabled) onChange(activities.filter((a) => a.id !== id))
  }

  const addCustom = () => {
    if (!newLabel.trim()) return
    const id = `custom-${Date.now()}`
    const color = COLORS[activities.length % COLORS.length]
    onChange([...activities, { id, emoji: newEmoji, label: newLabel.trim(), color }])
    setNewLabel('')
    setNewEmoji('⭐')
    setShowAdd(false)
  }

  return (
    <div>
      <p className="text-xs text-gray-400 font-semibold mb-3">
        Tap to remove. These are the rows on their board.
      </p>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50"
          >
            <span className="text-xl">{a.emoji}</span>
            <span className="flex-1 text-sm font-bold text-gray-700">{a.label}</span>
            <button
              onClick={() => toggle(a.id)}
              className="text-gray-400 text-sm font-bold hover:text-red-500 px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="mt-3 p-3 rounded-xl bg-purple-50 border-2 border-purple-200">
          <div className="flex gap-2 mb-2 flex-wrap">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setNewEmoji(e)}
                className="w-8 h-8 rounded-lg text-lg flex items-center justify-center"
                style={{ background: newEmoji === e ? 'white' : 'transparent', border: newEmoji === e ? '2px solid #7E57C2' : 'none' }}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Activity name"
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold outline-none mb-2"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg text-xs font-extrabold text-gray-400">Cancel</button>
            <button onClick={addCustom} className="flex-1 py-2 rounded-lg bg-purple-500 text-white text-xs font-extrabold">Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-purple-300 text-purple-500 font-bold text-sm"
        >
          + Add activity
        </button>
      )}
    </div>
  )
}

export default ActivityEditor
