import confetti from 'canvas-confetti'

// Tuned celebration presets. All are fire-and-forget (no await needed).
export function celebrate(kind, opts = {}) {
  const defaults = { origin: { x: 0.5, y: 0.5 } }
  const { origin = defaults.origin } = opts

  if (kind === 'hatch') {
    // Big fanfare — two staggered bursts
    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 45,
      origin,
      colors: ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#F78EB7'],
    })
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 160,
        startVelocity: 25,
        origin,
        colors: ['#FFD166', '#FFE66D', '#ffffff'],
      })
    }, 180)
  } else if (kind === 'day') {
    // Daily clean-sweep — medium burst from a column
    confetti({
      particleCount: 60,
      spread: 70,
      startVelocity: 35,
      origin,
      colors: ['#88D9A2', '#A4B4F0', '#F4A6D9'],
    })
  } else if (kind === 'badge') {
    // Small glint near the badge shelf
    confetti({
      particleCount: 30,
      spread: 50,
      startVelocity: 30,
      origin,
      colors: ['#FFD166', '#FFE066', '#ffffff'],
      shapes: ['star'],
    })
  } else if (kind === 'box') {
    // Mystery box reveal — quick sparkle burst
    confetti({
      particleCount: 40,
      spread: 120,
      startVelocity: 25,
      origin,
      colors: ['#F4A6D9', '#FFD166', '#A4B4F0', '#ffffff'],
    })
  } else if (kind === 'fireworks') {
    // End-of-week recap — canvas-confetti's built-in fireworks recipe.
    // Three bursts over ~2.5s from random origins across the top half.
    // Respects prefers-reduced-motion.
    if (typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const duration = 2500
    const end = Date.now() + duration
    const colors = ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#F78EB7', '#FFE066']
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        startVelocity: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        startVelocity: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    // Extra skyward bursts for the classic "firework" feel.
    const burstAt = (x, delay) => setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 360,
        startVelocity: 30,
        origin: { x, y: 0.45 },
        colors,
        shapes: ['circle', 'star'],
        scalar: 0.9,
      })
    }, delay)
    burstAt(0.25, 200)
    burstAt(0.75, 600)
    burstAt(0.5, 1000)
  }
}
