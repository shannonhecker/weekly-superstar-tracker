import { useState } from 'react'

// Pure sticker cell. The icon is chosen by the caller (see
// utils/stickerPicker.js) so the emoji is stable across reloads and
// devices. We only own the local tap-pop animation.
const StickerCheck = ({ checked, onClick, color, icon }) => {
  const [pop, setPop] = useState(false)

  const handleClick = () => {
    setPop(true)
    setTimeout(() => setPop(false), 400)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center rounded-full p-0 cursor-pointer w-9 h-9 sm:w-11 sm:h-11"
      style={{
        border: `2px solid ${checked ? color : '#E8E8E8'}`,
        backgroundColor: checked ? `${color}18` : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: pop ? 'scale(1.35)' : checked ? 'scale(1.1)' : 'scale(1)',
        boxShadow: checked ? `0 3px 14px ${color}44` : 'none',
      }}
      aria-label={checked ? 'Uncheck activity' : 'Check activity'}
    >
      <span
        className="transition-all duration-300 text-base sm:text-[22px]"
        style={{
          fontSize: checked ? undefined : 14,
          filter: checked ? 'none' : 'grayscale(1) opacity(0.25)',
        }}
      >
        {checked ? icon : '○'}
      </span>
    </button>
  )
}

export default StickerCheck
