// Web port of weekly-superstar-ios/components/banner-effects.ts
// Same EFFECT_PROFILES shape — keep in sync if iOS version changes.

const DEFAULT_OPACITY = {
  input: [0, 0.16, 0.82, 1],
  output: [0.04, 0.32, 0.26, 0.04],
}

const DEFAULT_SCALE = {
  input: [0, 0.5, 1],
  output: [0.94, 1.08, 0.96],
}

export const NEUTRAL_THEME = { accent: '#C8B89A', deeper: '#7A6B58' }

export const EFFECT_PROFILES = {
  bubbles: {
    shape: 'round',
    positions: [
      { left: 11, top: 70, size: 8, drift: 8, rise: 28, rotate: 0 },
      { left: 28, top: 62, size: 10, drift: 6, rise: 30, rotate: 0 },
      { left: 52, top: 30, size: 7, drift: -6, rise: 24, rotate: 0 },
      { left: 73, top: 66, size: 8, drift: 7, rise: 28, rotate: 0 },
      { left: 89, top: 38, size: 9, drift: -7, rise: 26, rotate: 0 },
    ],
    colorize: () => ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    opacityCurve: DEFAULT_OPACITY,
    scaleCurve: DEFAULT_SCALE,
    hero: {
      position: { left: 50, top: 80, size: 18, drift: 4, rise: 70, rotate: 0 },
      duration: 24000,
      color: () => '#FFFFFF',
    },
  },

  stars: {
    shape: 'diamond',
    positions: [
      { left: 10, top: 24, size: 7, drift: 4, rise: 9, rotate: 45 },
      { left: 32, top: 20, size: 6, drift: -3, rise: 10, rotate: 45 },
      { left: 55, top: 52, size: 6, drift: 3, rise: 11, rotate: 45 },
      { left: 74, top: 18, size: 8, drift: -4, rise: 10, rotate: 45 },
      { left: 91, top: 30, size: 6, drift: 3, rise: 9, rotate: 45 },
    ],
    colorize: (theme) => ['#FFFFFF', theme.accent, theme.deeper, '#FFE08A', '#FFFFFF'],
    opacityCurve: DEFAULT_OPACITY,
    scaleCurve: DEFAULT_SCALE,
    hero: {
      position: { left: 60, top: 22, size: 14, drift: 2, rise: 4, rotate: 45 },
      duration: 20000,
      color: () => '#FFE08A',
    },
  },

  confetti: {
    shape: 'tall-rect',
    positions: [
      { left: 8, top: 24, size: 7, drift: 7, rise: -15, rotate: 16 },
      { left: 26, top: 18, size: 8, drift: 6, rise: -16, rotate: 22 },
      { left: 47, top: 36, size: 7, drift: -6, rise: -14, rotate: -12 },
      { left: 69, top: 28, size: 7, drift: -7, rise: -15, rotate: -20 },
      { left: 90, top: 32, size: 7, drift: 6, rise: -15, rotate: 18 },
    ],
    colorize: (theme) => [theme.accent, '#8DD7FF', theme.deeper, '#A7D676', '#FFB86B'],
    opacityCurve: DEFAULT_OPACITY,
    scaleCurve: DEFAULT_SCALE,
    hero: {
      position: { left: 42, top: 18, size: 16, drift: 6, rise: -38, rotate: 28 },
      duration: 24000,
      color: (theme) => theme.accent,
    },
  },

  petals: {
    shape: 'oval',
    positions: [
      { left: 9, top: 30, size: 8, drift: 10, rise: -8, rotate: 22 },
      { left: 27, top: 60, size: 7, drift: -10, rise: -7, rotate: -18 },
      { left: 46, top: 38, size: 8, drift: 9, rise: -9, rotate: 28 },
      { left: 67, top: 64, size: 7, drift: -9, rise: -8, rotate: -14 },
      { left: 88, top: 36, size: 8, drift: 10, rise: -8, rotate: 18 },
    ],
    colorize: (theme) => [theme.accent, theme.deeper, '#FFFFFF', theme.accent, '#FFF7E6'],
    opacityCurve: { input: [0, 0.18, 0.78, 1], output: [0.05, 0.28, 0.22, 0.05] },
    scaleCurve: { input: [0, 0.5, 1], output: [0.92, 1.05, 0.94] },
    hero: {
      position: { left: 50, top: 30, size: 18, drift: 16, rise: -22, rotate: 30 },
      duration: 24000,
      color: (theme) => theme.accent,
    },
  },

  steam: {
    shape: 'puff',
    positions: [
      { left: 12, top: 60, size: 10, drift: 2, rise: -28, rotate: 0 },
      { left: 30, top: 52, size: 12, drift: -2, rise: -30, rotate: 0 },
      { left: 50, top: 64, size: 9, drift: 3, rise: -26, rotate: 0 },
      { left: 70, top: 50, size: 11, drift: -3, rise: -28, rotate: 0 },
      { left: 88, top: 60, size: 10, drift: 2, rise: -27, rotate: 0 },
    ],
    colorize: () => ['#FFFFFF', '#F5F0E6', '#FFFFFF', '#F5F0E6', '#FFFFFF'],
    opacityCurve: { input: [0, 0.2, 0.6, 1], output: [0, 0.3, 0.16, 0] },
    scaleCurve: { input: [0, 0.5, 1], output: [1.0, 1.3, 1.6] },
    hero: {
      position: { left: 50, top: 60, size: 24, drift: 0, rise: -55, rotate: 0 },
      duration: 22000,
      color: () => '#FFFFFF',
    },
  },

  embers: {
    shape: 'round',
    positions: [
      { left: 14, top: 70, size: 5, drift: 3, rise: -22, rotate: 0 },
      { left: 30, top: 64, size: 6, drift: -2, rise: -24, rotate: 0 },
      { left: 50, top: 72, size: 5, drift: 4, rise: -20, rotate: 0 },
      { left: 70, top: 66, size: 6, drift: -3, rise: -22, rotate: 0 },
      { left: 86, top: 70, size: 5, drift: 2, rise: -21, rotate: 0 },
    ],
    colorize: () => ['#FF7B3A', '#FFB259', '#FF5236', '#FFC97A', '#FFA044'],
    opacityCurve: { input: [0, 0.15, 0.55, 1], output: [0, 0.42, 0.18, 0] },
    scaleCurve: { input: [0, 0.5, 1], output: [1.2, 0.85, 0.5] },
    hero: {
      position: { left: 50, top: 72, size: 12, drift: 0, rise: -55, rotate: 0 },
      duration: 20000,
      color: () => '#FF7B3A',
    },
  },

  sparkles: {
    shape: 'diamond',
    positions: [
      { left: 14, top: 26, size: 6, drift: 2, rise: 2, rotate: 45 },
      { left: 32, top: 56, size: 5, drift: -2, rise: -2, rotate: 45 },
      { left: 54, top: 30, size: 7, drift: 2, rise: 1, rotate: 45 },
      { left: 72, top: 50, size: 5, drift: -1, rise: -2, rotate: 45 },
      { left: 90, top: 28, size: 6, drift: 2, rise: 2, rotate: 45 },
    ],
    colorize: (theme) => [theme.accent, theme.deeper, '#FFE08A', '#FFFFFF', theme.accent],
    opacityCurve: {
      input: [0, 0.2, 0.21, 0.5, 0.51, 0.8, 0.81, 1],
      output: [0, 0, 0.4, 0.4, 0.05, 0.05, 0.45, 0],
    },
    scaleCurve: { input: [0, 0.5, 1], output: [0.9, 1.1, 0.9] },
    hero: {
      position: { left: 52, top: 38, size: 14, drift: 0, rise: 0, rotate: 45 },
      duration: 22000,
      color: () => '#FFE08A',
    },
  },
}

export const EFFECT_BY_THEME = {
  ocean: 'bubbles',
  football: 'confetti',
  rugby: 'confetti',
  rocket: 'stars',
  magic: 'stars',
  robot: 'stars',
  dinosaur: 'embers',
  train: 'steam',
  unicorn: 'sparkles',
  princess: 'sparkles',
  fairy: 'sparkles',
  animals: 'petals',
  garden: 'petals',
  bear: 'petals',
  deer: 'petals',
  elephant: 'bubbles',
  fox: 'petals',
}
