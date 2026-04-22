import { useEffect, useState } from 'react'
import Modal from './Modal'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'

// Two-phase reveal: jitter 600ms → show prize + confetti.
export default function MysteryBox({ open, onClose, prize }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!open) { setRevealed(false); return }
    play('box')
    const t = setTimeout(() => {
      setRevealed(true)
      celebrate('box', { origin: { x: 0.5, y: 0.5 } })
    }, 650)
    return () => clearTimeout(t)
  }, [open])

  return (
    <Modal open={open} onClose={onClose} emoji={revealed ? '🎉' : '🎁'} title={revealed ? 'Surprise!' : 'A mystery box appeared…'}>
      <div className="flex flex-col items-center py-4">
        {!revealed ? (
          <div className="text-7xl box-jitter">🎁</div>
        ) : (
          <div className="text-center">
            <div className="text-7xl animate-bounce">{prize?.emoji || '✨'}</div>
            <div className="font-bold font-display text-gray-700 mt-3">{prize?.label}</div>
          </div>
        )}
      </div>
      {revealed && (
        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-pink-400 to-purple-500"
        >
          Awesome!
        </button>
      )}
    </Modal>
  )
}
