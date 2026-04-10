const football = {
  key: 'football',
  name: 'Leo',
  avatar: '⚽',
  bgGradient: 'from-green-50 via-lime-50 to-yellow-50',
  bgStyle: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 40%, #FFFDE7 100%)',
  accent: '#4CAF50',
  accentLight: '#C8E6C9',
  accentDark: '#2E7D32',
  headerGradient: 'linear-gradient(135deg, #4CAF50, #66BB6A, #43A047)',
  stickers: ['⚽', '🏆', '🥅', '🏅', '💪', '👟', '🎯', '🌟', '🔥', '⭐', '🏟️', '🦁', '💚', '✨', '🎉', '👑'],
  petStates: [
    { min: 0, max: 10, face: '🦁', mood: 'Warming Up', bg: '#FFF8E1', msg: "Let's get training!" },
    { min: 11, max: 20, face: '🏃', mood: 'In Training', bg: '#F1F8E9', msg: 'Good effort!' },
    { min: 21, max: 35, face: '⚽', mood: 'Match Ready', bg: '#E8F5E9', msg: 'Playing great!' },
    { min: 36, max: 49, face: '🥅', mood: 'Scoring Goals!', bg: '#E3F2FD', msg: 'What a player!' },
    { min: 50, max: 56, face: '🏆', mood: 'CHAMPION!', bg: '#FFF3E0', msg: "BALLON D'OR!" },
  ],
  badgeIcons: { diamond: '🏆', gold: '🥇', silver: '🥈', bronze: '🥉' },
  decorEmojis: ['⚽', '🥅', '👟'],
  streakIcon: '⚽',
  resetLabel: '🔄 Next Match',
}

export default football
