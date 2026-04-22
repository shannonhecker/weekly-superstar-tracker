// Simple Web Audio API sound synthesis — no external MP3 files, no licenses.
// Good enough for playful feedback on ages 5–7 taps.

const MUTE_KEY = 'weeklysuperstar-muted'

let ctx = null
function getCtx() {
  if (ctx) return ctx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  } catch { ctx = null }
  return ctx
}

export function isMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false }
}

export function setMuted(val) {
  try { localStorage.setItem(MUTE_KEY, val ? '1' : '0') } catch {}
}

function tone({ freq, duration = 0.12, type = 'sine', volume = 0.15, slideTo = null }) {
  const ac = getCtx()
  if (!ac) return
  // Resume on first user gesture (autoplay policies).
  if (ac.state === 'suspended') ac.resume()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration)
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function play(kind) {
  if (isMuted()) return
  switch (kind) {
    case 'sticker':
      // Short chirp: C# up to E
      tone({ freq: 880, slideTo: 1320, duration: 0.09, type: 'triangle', volume: 0.12 })
      break
    case 'hatch':
      // Ascending arpeggio: C E G C (major triad up an octave)
      tone({ freq: 523, duration: 0.14, type: 'triangle', volume: 0.18 })
      setTimeout(() => tone({ freq: 659, duration: 0.14, type: 'triangle', volume: 0.18 }), 120)
      setTimeout(() => tone({ freq: 784, duration: 0.18, type: 'triangle', volume: 0.2 }), 240)
      setTimeout(() => tone({ freq: 1047, duration: 0.3, type: 'triangle', volume: 0.22 }), 380)
      break
    case 'cheer':
      // Kids-cheer approximation: quick rising sweep + trill
      tone({ freq: 600, slideTo: 1000, duration: 0.25, type: 'sawtooth', volume: 0.1 })
      setTimeout(() => tone({ freq: 800, duration: 0.08, type: 'triangle', volume: 0.12 }), 260)
      setTimeout(() => tone({ freq: 1000, duration: 0.08, type: 'triangle', volume: 0.12 }), 340)
      setTimeout(() => tone({ freq: 1200, duration: 0.15, type: 'triangle', volume: 0.14 }), 420)
      break
    case 'badge':
      // Ding: high triangle with a tiny slide
      tone({ freq: 1500, slideTo: 2000, duration: 0.25, type: 'triangle', volume: 0.14 })
      break
    case 'box':
      // Mystery box ping: 2 descending then ascending
      tone({ freq: 800, duration: 0.08, type: 'triangle', volume: 0.12 })
      setTimeout(() => tone({ freq: 600, duration: 0.08, type: 'triangle', volume: 0.12 }), 90)
      setTimeout(() => tone({ freq: 1000, duration: 0.2, type: 'triangle', volume: 0.16 }), 200)
      break
    default:
      break
  }
}
