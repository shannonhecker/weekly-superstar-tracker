import {
  colors,
  radii,
  shadowsCss,
  typography,
  motion,
} from '@weekly-superstar/shared/tokens'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Legacy direction (Fredoka + Nunito) — still used by every existing
        // surface. Earthy direction adds 'jakarta' as the new default-ish
        // family that future surfaces consume.
        display: typography.fonts.display,
        body: typography.fonts.body,
        jakarta: typography.earthy.body,
      },
      colors: {
        // Legacy
        brand: colors.brand,
        fav: colors.fav,
        surface: colors.surface,
        // Earthy (Phase 0 onward) — exposed as a flat namespace so utility
        // classes work as `bg-earthy-cream`, `text-earthy-cocoa`, etc.
        earthy: colors.earthy,
        semantic: colors.semantic,
      },
      borderRadius: {
        pill: radii.pill,
      },
      boxShadow: {
        card: shadowsCss.card,
        pop: shadowsCss.pop,
        'earthy-soft': shadowsCss.earthySoft,
        'earthy-lifted': shadowsCss.earthyLifted,
      },
      transitionTimingFunction: {
        spring: motion.springCss,
      },
    },
  },
  plugins: [],
}
