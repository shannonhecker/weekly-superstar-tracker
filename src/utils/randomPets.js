const RANDOM_PETS = [
  {
    name: 'Kitty',
    states: [
      { face: '🐱', mood: 'Curious Kitty', msg: 'What\'s that?!' },
      { face: '😺', mood: 'Happy Kitty', msg: 'Purrrr!' },
      { face: '😸', mood: 'Super Kitty!', msg: 'ZOOM ZOOM!' },
      { face: '🦁', mood: 'LION MODE!', msg: 'I AM THE KING!' },
    ],
  },
  {
    name: 'Puppy',
    states: [
      { face: '🐶', mood: 'Waggy Pup', msg: 'Wag wag wag!' },
      { face: '🦮', mood: 'Good Boy!', msg: 'FETCH! FETCH!' },
      { face: '🐺', mood: 'Super Dog!', msg: 'AWOOOO!' },
      { face: '🌟', mood: 'LEGENDARY DOG!', msg: 'BEST BOY EVER!' },
    ],
  },
  {
    name: 'Bunny',
    states: [
      { face: '🐰', mood: 'Hoppy Bunny', msg: 'Hop hop!' },
      { face: '🐾', mood: 'Bouncy Bunny!', msg: 'BOING BOING!' },
      { face: '⚡', mood: 'Turbo Bunny!', msg: 'ZOOM HOP!' },
      { face: '🌈', mood: 'MAGIC BUNNY!', msg: 'RAINBOW POWER!' },
    ],
  },
  {
    name: 'Panda',
    states: [
      { face: '🐼', mood: 'Munchy Panda', msg: 'Nom nom nom!' },
      { face: '🎋', mood: 'Happy Panda!', msg: 'Bamboo party!' },
      { face: '🥋', mood: 'Kung Fu Panda!', msg: 'HIYA!' },
      { face: '👑', mood: 'PANDA EMPEROR!', msg: 'SKADOOSH!' },
    ],
  },
  {
    name: 'Dragon',
    states: [
      { face: '🐉', mood: 'Baby Dragon', msg: 'Tiny roar!' },
      { face: '🔥', mood: 'Fire Breather!', msg: 'FLAME ON!' },
      { face: '🐲', mood: 'Sky Dragon!', msg: 'SOARING HIGH!' },
      { face: '⭐', mood: 'DRAGON LORD!', msg: 'BOW BEFORE ME!' },
    ],
  },
  {
    name: 'Penguin',
    states: [
      { face: '🐧', mood: 'Sliding Penguin', msg: 'Wheee!' },
      { face: '🐟', mood: 'Fish Hunter!', msg: 'Got one!' },
      { face: '❄️', mood: 'Ice Master!', msg: 'BELLY SLIDE!' },
      { face: '🏔️', mood: 'PENGUIN KING!', msg: 'TOP OF THE WORLD!' },
    ],
  },
  {
    name: 'Monkey',
    states: [
      { face: '🐵', mood: 'Peek-a-boo!', msg: 'Can you see me?' },
      { face: '🙉', mood: 'Silly Monkey!', msg: 'Ooh ooh ahh!' },
      { face: '🐒', mood: 'Swing King!', msg: 'TREE TO TREE!' },
      { face: '👑', mood: 'JUNGLE KING!', msg: 'KING OF THE JUNGLE!' },
    ],
  },
  {
    name: 'Unicorn',
    states: [
      { face: '🦄', mood: 'Baby Unicorn', msg: 'Sparkle sparkle!' },
      { face: '🌈', mood: 'Rainbow Rider!', msg: 'MAGICAL!' },
      { face: '💫', mood: 'Star Unicorn!', msg: 'SHOOTING STARS!' },
      { face: '✨', mood: 'MEGA UNICORN!', msg: 'PURE MAGIC!' },
    ],
  },
  {
    name: 'Octopus',
    states: [
      { face: '🐙', mood: 'Squirty!', msg: 'Splish splash!' },
      { face: '🌊', mood: 'Wave Rider!', msg: 'SURF\'S UP!' },
      { face: '🧜', mood: 'Sea Hero!', msg: 'OCEAN POWER!' },
      { face: '🔱', mood: 'SEA KING!', msg: 'RULER OF WAVES!' },
    ],
  },
  {
    name: 'Alien',
    states: [
      { face: '👽', mood: 'UFO Pilot!', msg: 'Beep boop!' },
      { face: '🌍', mood: 'Earth Friend!', msg: 'I love Earth!' },
      { face: '🚀', mood: 'Space Racer!', msg: 'ZOOM TO MARS!' },
      { face: '🌟', mood: 'GALAXY BOSS!', msg: 'RULER OF SPACE!' },
    ],
  },
  {
    name: 'Pikachu',
    states: [
      { face: '🐭', mood: 'Pika Pika!', msg: 'Pika pika!' },
      { face: '⚡', mood: 'Thundershock!', msg: 'PIKA CHUUU!' },
      { face: '🌩️', mood: 'Thunder Bolt!', msg: 'FEEL THE POWER!' },
      { face: '👑', mood: 'PIKA LEGEND!', msg: 'I CHOOSE YOU!' },
    ],
  },
  {
    name: 'Charmander',
    states: [
      { face: '🦎', mood: 'Char Char!', msg: 'Getting warmer!' },
      { face: '🔥', mood: 'Charmeleon!', msg: 'FIRE SPIN!' },
      { face: '🐉', mood: 'Charizard!', msg: 'FLAMETHROWER!' },
      { face: '🌋', mood: 'MEGA CHARIZARD!', msg: 'BLAST BURN!' },
    ],
  },
  {
    name: 'Squirtle',
    states: [
      { face: '🐢', mood: 'Squirtle Squad!', msg: 'Water gun!' },
      { face: '🌊', mood: 'Wartortle!', msg: 'HYDRO PUMP!' },
      { face: '🐚', mood: 'Blastoise!', msg: 'SURF\'S UP!' },
      { face: '💎', mood: 'MEGA BLASTOISE!', msg: 'TIDAL WAVE!' },
    ],
  },
  {
    name: 'Bulbasaur',
    states: [
      { face: '🍃', mood: 'Bulba Bulba!', msg: 'Vine whip!' },
      { face: '🌿', mood: 'Ivysaur!', msg: 'RAZOR LEAF!' },
      { face: '🌸', mood: 'Venusaur!', msg: 'SOLAR BEAM!' },
      { face: '🌺', mood: 'MEGA VENUSAUR!', msg: 'NATURE POWER!' },
    ],
  },
  {
    name: 'Eevee',
    states: [
      { face: '🦊', mood: 'Playful Eevee!', msg: 'Who will I be?' },
      { face: '🔥', mood: 'Flareon!', msg: 'FIRE BLAST!' },
      { face: '⚡', mood: 'Jolteon!', msg: 'THUNDERBOLT!' },
      { face: '🌈', mood: 'SYLVEON!', msg: 'FAIRY POWER!' },
    ],
  },
]

// Random egg styles — each egg has a unique color and pattern emoji
const EGG_STYLES = [
  { face: '🥚', color: '#FFD700', label: 'Golden Egg' },
  { face: '🥚', color: '#FF6B6B', label: 'Red Egg' },
  { face: '🥚', color: '#48DBFB', label: 'Blue Egg' },
  { face: '🥚', color: '#FF9FF3', label: 'Pink Egg' },
  { face: '🥚', color: '#54E346', label: 'Green Egg' },
  { face: '🥚', color: '#A29BFE', label: 'Purple Egg' },
  { face: '🥚', color: '#FFA502', label: 'Orange Egg' },
  { face: '🥚', color: '#00D2D3', label: 'Teal Egg' },
  { face: '🪺', color: '#C8A86E', label: 'Nest Egg' },
  { face: '🥚', color: '#FF6348', label: 'Fire Egg' },
  { face: '🥚', color: '#7BED9F', label: 'Mint Egg' },
  { face: '🥚', color: '#E056A0', label: 'Sparkle Egg' },
]

const BG_COLORS = ['#FFF8E1', '#F1F8E9', '#E8F5E9', '#E3F2FD', '#FFF3E0']

const CHILD_KEYS = ['football', 'dinosaur']

function _ensurePairGenerated() {
  const weekKey = _getWeekKey()
  const pairWeekKey = 'tracker-pairWeek'
  if (localStorage.getItem(pairWeekKey) === weekKey) return

  // Pick two different pets
  const petA = Math.floor(Math.random() * RANDOM_PETS.length)
  let petB = Math.floor(Math.random() * (RANDOM_PETS.length - 1))
  if (petB >= petA) petB++

  // Pick two different egg colors
  const eggA = Math.floor(Math.random() * EGG_STYLES.length)
  let eggB = Math.floor(Math.random() * (EGG_STYLES.length - 1))
  if (eggB >= eggA) eggB++

  localStorage.setItem(`tracker-${CHILD_KEYS[0]}-weekPet`, String(petA))
  localStorage.setItem(`tracker-${CHILD_KEYS[0]}-eggStyle`, String(eggA))
  localStorage.setItem(`tracker-${CHILD_KEYS[1]}-weekPet`, String(petB))
  localStorage.setItem(`tracker-${CHILD_KEYS[1]}-eggStyle`, String(eggB))
  localStorage.setItem(pairWeekKey, weekKey)
}

export function getRandomPetForWeek(themeKey) {
  _ensurePairGenerated()
  const idx = parseInt(localStorage.getItem(`tracker-${themeKey}-weekPet`), 10)
  const eggIdx = parseInt(localStorage.getItem(`tracker-${themeKey}-eggStyle`), 10)
  const pet = (!isNaN(idx) && idx >= 0 && idx < RANDOM_PETS.length) ? RANDOM_PETS[idx] : RANDOM_PETS[0]
  const egg = (!isNaN(eggIdx) && eggIdx >= 0 && eggIdx < EGG_STYLES.length) ? EGG_STYLES[eggIdx] : EGG_STYLES[0]
  return { ...pet, egg }
}

export function getRandomPetState(score, pet) {
  // Tier 0: egg (score 0-10)
  // Tiers 1-4: the pet's 4 evolution states
  const thresholds = [0, 11, 21, 33, 43]
  let tier = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) { tier = i; break }
  }

  if (tier === 0) {
    return {
      face: pet.egg.face,
      mood: pet.egg.label,
      msg: 'What\'s inside? Do tasks to find out!',
      bg: BG_COLORS[0],
      eggColor: pet.egg.color,
    }
  }

  const state = pet.states[tier - 1]
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
