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
      },
      transitionTimingFunction: {
        spring: motion.springCss,
      },
    },
  },
  plugins: [],
}
