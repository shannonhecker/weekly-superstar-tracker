const dragon = {
  key: 'dragon',
  name: 'Ember',
  avatar: '🐉',
  bgGradient: 'from-orange-50 via-red-50 to-yellow-50',
  bgStyle: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 40%, #FFCDD2 100%)',
  accent: '#F57C00',
  accentLight: '#FFCC80',
  accentDark: '#E65100',
  headerGradient: 'linear-gradient(135deg, #F57C00, #FF7043, #E53935)',
  stickers: ['🐉', '🐲', '🥚', '🔥', '🌋', '💎', '⭐', '✨', '🪄', '🛡️', '⚔️', '👑', '🌟', '💫', '🎉', '🧡'],
  petStates: [
    { min: 0, max: 11, face: '🥚', mood: 'Cozy Egg', bg: '#FFF3E0', msg: "Shhh... I'm growing!" },
    { min: 12, max: 22, face: '🐣', mood: 'Just Hatched!', bg: '#FFE0B2', msg: 'Peep! Hello world!' },
    { min: 23, max: 33, face: '🦎', mood: 'Little Lizard', bg: '#FFCCBC', msg: 'Spreading tiny wings!' },
    { min: 34, max: 44, face: '🐲', mood: 'Teen Dragon', bg: '#FFAB91', msg: 'Feeling the fire!' },
    { min: 45, max: 56, face: '🐉', mood: 'Mighty Dragon!', bg: '#FFCDD2', msg: 'ROAAAR! I can fly!' },
  ],
  badgeIcons: { diamond: '👑', gold: '🐉', silver: '🐲', bronze: '🥚' },
  decorEmojis: ['🐉', '🔥', '🌋'],
  streakIcon: '🔥',
  resetLabel: '🔄 New Quest',
}

export default dragon
