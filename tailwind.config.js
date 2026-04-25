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
        display: typography.fonts.display,
        body: typography.fonts.body,
      },
      colors: {
        brand: colors.brand,
        fav: colors.fav,
        surface: colors.surface,
        earthy: colors.earthy,
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
        'earthy-pop': '0 2px 6px rgba(90, 58, 46, 0.07), 0 14px 32px rgba(90, 58, 46, 0.14)',
        // Subtler tier for cards that sit inside the active-kid surface.
        'earthy-card': '0 1px 2px rgba(90, 58, 46, 0.04), 0 6px 16px rgba(90, 58, 46, 0.08)',
      },
      transitionTimingFunction: {
        spring: motion.springCss,
      },
    },
  },
  plugins: [],
}
