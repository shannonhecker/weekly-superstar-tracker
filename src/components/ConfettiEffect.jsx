import { useMemo } from 'react'

const ConfettiEffect = ({ show, theme }) => {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: ['#F7B731','#FC5C65','#45B7D1','#26DE81','#7C6FF7','#FD9644','#FF6348','#4ECDC4'][i % 8],
      size: 5 + Math.random() * 10,
      rotation: Math.random() * 360,
      isEmoji: i % 5 === 0,
    })), [])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: -10,
            width: p.isEmoji ? 'auto' : p.size,
            height: p.isEmoji ? 'auto' : p.size,
            backgroundColor: p.isEmoji ? 'transparent' : p.color,
            borderRadius: p.size > 10 ? '50%' : 2,
            fontSize: p.isEmoji ? 20 : 0,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.isEmoji ? theme.decorEmojis[p.id % theme.decorEmojis.length] : ''}
        </div>
      ))}
    </div>
  )
}

export default ConfettiEffect
