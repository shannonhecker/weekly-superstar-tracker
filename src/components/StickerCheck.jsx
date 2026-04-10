import { useState } from 'react'

const StickerCheck = ({ checked, onClick, color, stickers }) => {
  const [icon, setIcon] = useState(() => stickers[Math.floor(Math.random() * stickers.length)])
  const [pop, setPop] = useState(false)

  const handleClick = () => {
    if (!checked) setIcon(stickers[Math.floor(Math.random() * stickers.length)])
    setPop(true)
    setTimeout(() => setPop(false), 400)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center rounded-full p-0 cursor-pointer"
      style={{
        width: 44,
        height: 44,
        border: `2.5px solid ${checked ? color : '#E8E8E8'}`,
        backgroundColor: checked ? `${color}18` : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: pop ? 'scale(1.35)' : checked ? 'scale(1.1)' : 'scale(1)',
        boxShadow: checked ? `0 3px 14px ${color}44` : 'none',
      }}
      aria-label={checked ? 'Uncheck activity' : 'Check activity'}
    >
      <span
        className="transition-all duration-300"
        style={{
          fontSize: checked ? 22 : 16,
          filter: checked ? 'none' : 'grayscale(1) opacity(0.25)',
        }}
      >
        {checked ? icon : '○'}
      </span>
    </button>
  )
}

export default StickerCheck
