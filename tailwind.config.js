/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'confetti-fall': 'confettiFall 2s ease-in forwards',
        'pet-bounce': 'petBounce 1.2s ease-in-out infinite',
        'pet-sleep': 'petSleep 3s ease-in-out infinite',
        'pet-wiggle': 'petWiggle 1.5s ease-in-out infinite',
        'pet-dance': 'petDance 1s ease-in-out infinite',
        'pet-jump': 'petJump 0.8s ease-in-out infinite',
        'pet-party': 'petParty 1.2s ease-in-out infinite',
        'flame-pulse': 'flamePulse 0.8s ease-in-out infinite',
        'badge-pulse': 'badgePulse 1.5s ease-in-out infinite',
        'reward-wiggle': 'rewardWiggle 1s ease-in-out infinite',
        'sticker-pop': 'stickerPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        confettiFall: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        petSleep: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(-5deg) scale(0.95)' },
          '75%': { transform: 'rotate(5deg) scale(0.95)' },
        },
        petWiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-12deg)' },
          '40%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-8deg)' },
          '80%': { transform: 'rotate(6deg)' },
        },
        petDance: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-4px) rotate(-10deg)' },
          '50%': { transform: 'translateX(4px) rotate(10deg)' },
          '75%': { transform: 'translateX(-2px) rotate(-5deg)' },
        },
        petJump: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(-12px) scale(1.1)' },
          '50%': { transform: 'translateY(0) scale(0.95, 1.05)' },
          '70%': { transform: 'translateY(-6px) scale(1.05)' },
        },
        petParty: {
          '0%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
          '20%': { transform: 'translateY(-10px) rotate(-15deg) scale(1.15)' },
          '40%': { transform: 'translateY(0) rotate(12deg) scale(1)' },
          '60%': { transform: 'translateY(-8px) rotate(-10deg) scale(1.1)' },
          '80%': { transform: 'translateY(0) rotate(8deg) scale(1)' },
          '100%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
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
      },
    },
  },
  plugins: [],
}
