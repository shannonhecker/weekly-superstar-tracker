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
        // Spread the shared earthy palette and add a local `card` token —
        // #FFFDF7 was hardcoded in 15 surfaces (audit Q5). Promoting it
        // here removes the literal repetition. When the shared package
        // adds `earthy.card`, drop this override and let it flow through.
        earthy: { ...colors.earthy, card: '#FFFDF7' },
        semantic: colors.semantic,
      },
      borderRadius: {
        pill: radii.pill,
      },
      boxShadow: {
        card: shadowsCss.card,
        pop: shadowsCss.pop,
        'earthy-flat': shadowsCss.earthyFlat,
        'earthy-soft': shadowsCss.earthySoft,
        'earthy-lifted': shadowsCss.earthyLifted,
        // Two-layer drop shadow for floating surfaces (modals, dropdowns) —
        // tight lower layer for definition, wide soft layer for lift.
        'earthy-pop': '0 2px 6px rgba(90, 58, 46, 0.04), 0 14px 32px rgba(90, 58, 46, 0.09)',
        // Subtler tier for cards that sit inside the active-kid surface.
        'earthy-card': '0 1px 2px rgba(90, 58, 46, 0.03), 0 6px 16px rgba(90, 58, 46, 0.05)',
      },
      transitionTimingFunction: {
        spring: motion.springCss,
      },
    },
  },
  plugins: [],
}
