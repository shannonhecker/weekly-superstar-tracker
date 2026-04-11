const dinosaur = {
  key: 'dinosaur',
  name: 'Nathan',
  avatar: '🦕',
  bgGradient: 'from-purple-50 via-indigo-50 to-sky-50',
  bgStyle: 'linear-gradient(135deg, #EDE7F6 0%, #E8EAF6 40%, #E1F5FE 100%)',
  accent: '#7E57C2',
  accentLight: '#D1C4E9',
  accentDark: '#4527A0',
  headerGradient: 'linear-gradient(135deg, #7E57C2, #9575CD, #5C6BC0)',
  stickers: ['🦕', '🦖', '🌋', '🥚', '🦴', '🌿', '💎', '⭐', '🔥', '🌟', '🪨', '🌴', '💜', '✨', '🎉', '👑'],
  petStates: [
    { min: 0, max: 14, face: '🥚', mood: 'Egg Stage', bg: '#F3E5F5', msg: 'Almost hatching!' },
    { min: 15, max: 28, face: '🐣', mood: 'Baby Dino', bg: '#EDE7F6', msg: 'Rawr! Growing!' },
    { min: 29, max: 45, face: '🦕', mood: 'Getting Big!', bg: '#E8EAF6', msg: 'STOMP STOMP!' },
    { min: 46, max: 60, face: '🦖', mood: 'T-REX Mode!', bg: '#E3F2FD', msg: 'ROARRR!' },
    { min: 61, max: 70, face: '👑', mood: 'DINO KING!', bg: '#FFF3E0', msg: 'RULER OF ALL!' },
  ],
  badgeIcons: { diamond: '👑', gold: '🦖', silver: '🦕', bronze: '🥚' },
  decorEmojis: ['🦕', '🌋', '🦴'],
  streakIcon: '🦖',
  resetLabel: '🔄 Next Era',
}

export default dinosaur
