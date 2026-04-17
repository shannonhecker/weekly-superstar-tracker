/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      transitionDuration: {
        '400': '400ms',
      },
      animation: {
        'confetti-fall': 'confettiFall 2s ease-in forwards',
        'pet-bounce': 'petBounce 1.2s ease-in-out infinite',
        'flame-pulse': 'flamePulse 0.8s ease-in-out infinite',
        'badge-pulse': 'badgePulse 1.5s ease-in-out infinite',
        'reward-wiggle': 'rewardWiggle 1s ease-in-out infinite',
        'sticker-pop': 'stickerPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'egg-wobble': 'eggWobble 1.6s ease-in-out infinite',
        'stage-pop-in': 'stagePopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'sparkle-float': 'sparkleFloat 1.1s ease-out forwards',
      },
      keyframes: {
        confettiFall: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        petBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        flamePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        badgePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        rewardWiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
        stickerPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1.1)' },
        },
        eggWobble: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        stagePopIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '60%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        sparkleFloat: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '25%': { opacity: '1' },
          '100%': { transform: 'translateY(-28px) scale(1.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
