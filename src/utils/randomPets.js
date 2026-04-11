const RANDOM_PETS = [
  {
    name: 'Kitty',
    states: [
      { face: '😿', mood: 'Sleepy Kitty', msg: 'Mew... so tired' },
      { face: '🐱', mood: 'Curious Kitty', msg: 'What\'s that?!' },
      { face: '😺', mood: 'Happy Kitty', msg: 'Purrrr!' },
      { face: '😸', mood: 'Super Kitty!', msg: 'ZOOM ZOOM!' },
      { face: '🦁', mood: 'LION MODE!', msg: 'I AM THE KING!' },
    ],
  },
  {
    name: 'Puppy',
    states: [
      { face: '🐶', mood: 'Sleepy Pup', msg: 'Zzz... woof' },
      { face: '🐕', mood: 'Waggy Pup', msg: 'Wag wag wag!' },
      { face: '🦮', mood: 'Good Boy!', msg: 'FETCH! FETCH!' },
      { face: '🐺', mood: 'Super Dog!', msg: 'AWOOOO!' },
      { face: '🌟', mood: 'LEGENDARY DOG!', msg: 'BEST BOY EVER!' },
    ],
  },
  {
    name: 'Bunny',
    states: [
      { face: '🐇', mood: 'Shy Bunny', msg: 'Nose wiggle...' },
      { face: '🐰', mood: 'Hoppy Bunny', msg: 'Hop hop!' },
      { face: '🐾', mood: 'Bouncy Bunny!', msg: 'BOING BOING!' },
      { face: '⚡', mood: 'Turbo Bunny!', msg: 'ZOOM HOP!' },
      { face: '🌈', mood: 'MAGIC BUNNY!', msg: 'RAINBOW POWER!' },
    ],
  },
  {
    name: 'Panda',
    states: [
      { face: '🐼', mood: 'Lazy Panda', msg: 'Bamboo please...' },
      { face: '🐻', mood: 'Munchy Panda', msg: 'Nom nom nom!' },
      { face: '🎋', mood: 'Happy Panda!', msg: 'Bamboo party!' },
      { face: '🥋', mood: 'Kung Fu Panda!', msg: 'HIYA!' },
      { face: '👑', mood: 'PANDA EMPEROR!', msg: 'SKADOOSH!' },
    ],
  },
  {
    name: 'Dragon',
    states: [
      { face: '🥚', mood: 'Dragon Egg', msg: 'Cracking...' },
      { face: '🐉', mood: 'Baby Dragon', msg: 'Tiny roar!' },
      { face: '🔥', mood: 'Fire Breather!', msg: 'FLAME ON!' },
      { face: '🐲', mood: 'Sky Dragon!', msg: 'SOARING HIGH!' },
      { face: '⭐', mood: 'DRAGON LORD!', msg: 'BOW BEFORE ME!' },
    ],
  },
  {
    name: 'Penguin',
    states: [
      { face: '🐧', mood: 'Cold Penguin', msg: 'Brrr so cold!' },
      { face: '🧊', mood: 'Sliding Penguin', msg: 'Wheee!' },
      { face: '🐟', mood: 'Fish Hunter!', msg: 'Got one!' },
      { face: '❄️', mood: 'Ice Master!', msg: 'BELLY SLIDE!' },
      { face: '🏔️', mood: 'PENGUIN KING!', msg: 'TOP OF THE WORLD!' },
    ],
  },
  {
    name: 'Monkey',
    states: [
      { face: '🐵', mood: 'Sleepy Monkey', msg: 'Banana dreams...' },
      { face: '🙈', mood: 'Peek-a-boo!', msg: 'Can you see me?' },
      { face: '🙉', mood: 'Silly Monkey!', msg: 'Ooh ooh ahh!' },
      { face: '🐒', mood: 'Swing King!', msg: 'TREE TO TREE!' },
      { face: '👑', mood: 'JUNGLE KING!', msg: 'KING OF THE JUNGLE!' },
    ],
  },
  {
    name: 'Unicorn',
    states: [
      { face: '🐴', mood: 'Little Pony', msg: 'Neigh...' },
      { face: '🦄', mood: 'Baby Unicorn', msg: 'Sparkle sparkle!' },
      { face: '🌈', mood: 'Rainbow Rider!', msg: 'MAGICAL!' },
      { face: '💫', mood: 'Star Unicorn!', msg: 'SHOOTING STARS!' },
      { face: '✨', mood: 'MEGA UNICORN!', msg: 'PURE MAGIC!' },
    ],
  },
  {
    name: 'Octopus',
    states: [
      { face: '🐙', mood: 'Shy Octopus', msg: 'Hiding in ink...' },
      { face: '🦑', mood: 'Squirty!', msg: 'Splish splash!' },
      { face: '🌊', mood: 'Wave Rider!', msg: 'SURF\'S UP!' },
      { face: '🧜', mood: 'Sea Hero!', msg: 'OCEAN POWER!' },
      { face: '🔱', mood: 'SEA KING!', msg: 'RULER OF WAVES!' },
    ],
  },
  {
    name: 'Alien',
    states: [
      { face: '👽', mood: 'Lost Alien', msg: 'Where am I?' },
      { face: '🛸', mood: 'UFO Pilot!', msg: 'Beep boop!' },
      { face: '🌍', mood: 'Earth Friend!', msg: 'I love Earth!' },
      { face: '🚀', mood: 'Space Racer!', msg: 'ZOOM TO MARS!' },
      { face: '🌟', mood: 'GALAXY BOSS!', msg: 'RULER OF SPACE!' },
    ],
  },
]

const BG_COLORS = ['#FFF8E1', '#F1F8E9', '#E8F5E9', '#E3F2FD', '#FFF3E0']

export function getRandomPetForWeek(themeKey) {
  const weekKey = _getWeekKey()
  const storageKey = `tracker-${themeKey}-weekPet`
  const savedWeekKey = `tracker-${themeKey}-weekPetWeek`
  const savedWeek = localStorage.getItem(savedWeekKey)

  if (savedWeek === weekKey) {
    const idx = parseInt(localStorage.getItem(storageKey), 10)
    if (!isNaN(idx) && idx >= 0 && idx < RANDOM_PETS.length) {
      return RANDOM_PETS[idx]
    }
  }

  // New week — pick a random pet
  const idx = Math.floor(Math.random() * RANDOM_PETS.length)
  localStorage.setItem(storageKey, String(idx))
  localStorage.setItem(savedWeekKey, weekKey)
  return RANDOM_PETS[idx]
}

export function getRandomPetState(score, pet) {
  const thresholds = [0, 11, 21, 33, 43]
  let tier = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) { tier = i; break }
  }
  const state = pet.states[tier]
  return { face: state.face, mood: state.mood, msg: state.msg, bg: BG_COLORS[tier] }
}

function _getWeekKey() {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}
