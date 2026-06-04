import { useEffect, useState } from 'react'
import Modal from './Modal'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import { useI18n } from '../lib/i18n'

// Two-phase reveal: jitter 600ms → show prize + confetti.
export default function MysteryBox({ open, onClose, prize }) {
  const [revealed, setRevealed] = useState(false)
  const { t } = useI18n()

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
    <Modal
      open={open}
      onClose={onClose}
      emoji={revealed ? '🎉' : '🎁'}
      title={revealed ? t('mysteryBox.surprise') : t('mysteryBox.appeared')}
      panelClassName="!max-w-lg !overflow-hidden"
    >
      <div className="rounded-2xl border border-earthy-divider bg-earthy-ivory py-6">
        <div className="flex flex-col items-center">
        {!revealed ? (
          <div className="text-7xl box-jitter">🎁</div>
        ) : (
          <div className="text-center">
            <div className="text-7xl animate-bounce">{prize?.emoji || '✨'}</div>
            <div className="font-extrabold text-earthy-cocoa mt-3">{prize?.label}</div>
          </div>
        )}
        </div>
      </div>
      {revealed && (
        <div className="mt-4 flex justify-end border-t border-earthy-divider pt-4">
          <button
            onClick={onClose}
            style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
            className="flex min-h-12 w-full items-center justify-center rounded-pill px-6 font-bold transition-all hover:bg-earthy-cocoaDark active:scale-[0.99] sm:w-auto sm:min-w-36"
          >
            {t('mysteryBox.awesome')}
          </button>
        </div>
      )}
    </Modal>
  )
}
