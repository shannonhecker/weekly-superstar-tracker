const RANDOM_PETS = [
  { name: 'Kitty', states: [
    { face: '🐱', mood: 'Curious Kitty', msg: 'What\'s that?!' },
    { face: '😺', mood: 'Happy Kitty', msg: 'Purrrr!' },
    { face: '😸', mood: 'Super Kitty!', msg: 'ZOOM ZOOM!' },
    { face: '🦁', mood: 'LION MODE!', msg: 'I AM THE KING!' },
  ]},
  { name: 'Puppy', states: [
    { face: '🐶', mood: 'Waggy Pup', msg: 'Wag wag wag!' },
    { face: '🦮', mood: 'Good Boy!', msg: 'FETCH! FETCH!' },
    { face: '🐺', mood: 'Super Dog!', msg: 'AWOOOO!' },
    { face: '🌟', mood: 'LEGENDARY DOG!', msg: 'BEST BOY EVER!' },
  ]},
  { name: 'Bunny', states: [
    { face: '🐰', mood: 'Hoppy Bunny', msg: 'Hop hop!' },
    { face: '🐾', mood: 'Bouncy Bunny!', msg: 'BOING BOING!' },
    { face: '⚡', mood: 'Turbo Bunny!', msg: 'ZOOM HOP!' },
    { face: '🌈', mood: 'MAGIC BUNNY!', msg: 'RAINBOW POWER!' },
  ]},
  { name: 'Panda', states: [
    { face: '🐼', mood: 'Munchy Panda', msg: 'Nom nom nom!' },
    { face: '🎋', mood: 'Happy Panda!', msg: 'Bamboo party!' },
    { face: '🥋', mood: 'Kung Fu Panda!', msg: 'HIYA!' },
    { face: '👑', mood: 'PANDA EMPEROR!', msg: 'SKADOOSH!' },
  ]},
  { name: 'Dragon', states: [
    { face: '🐉', mood: 'Baby Dragon', msg: 'Tiny roar!' },
    { face: '🔥', mood: 'Fire Breather!', msg: 'FLAME ON!' },
    { face: '🐲', mood: 'Sky Dragon!', msg: 'SOARING HIGH!' },
    { face: '⭐', mood: 'DRAGON LORD!', msg: 'BOW BEFORE ME!' },
  ]},
  { name: 'Penguin', states: [
    { face: '🐧', mood: 'Sliding Penguin', msg: 'Wheee!' },
    { face: '🐟', mood: 'Fish Hunter!', msg: 'Got one!' },
    { face: '❄️', mood: 'Ice Master!', msg: 'BELLY SLIDE!' },
    { face: '🏔️', mood: 'PENGUIN KING!', msg: 'TOP OF THE WORLD!' },
  ]},
  { name: 'Monkey', states: [
    { face: '🐵', mood: 'Peek-a-boo!', msg: 'Can you see me?' },
    { face: '🙉', mood: 'Silly Monkey!', msg: 'Ooh ooh ahh!' },
    { face: '🐒', mood: 'Swing King!', msg: 'TREE TO TREE!' },
    { face: '👑', mood: 'JUNGLE KING!', msg: 'KING OF THE JUNGLE!' },
  ]},
  { name: 'Unicorn', states: [
    { face: '🦄', mood: 'Baby Unicorn', msg: 'Sparkle sparkle!' },
    { face: '🌈', mood: 'Rainbow Rider!', msg: 'MAGICAL!' },
    { face: '💫', mood: 'Star Unicorn!', msg: 'SHOOTING STARS!' },
    { face: '✨', mood: 'MEGA UNICORN!', msg: 'PURE MAGIC!' },
  ]},
  { name: 'Octopus', states: [
    { face: '🐙', mood: 'Squirty!', msg: 'Splish splash!' },
    { face: '🌊', mood: 'Wave Rider!', msg: 'SURF\'S UP!' },
    { face: '🧜', mood: 'Sea Hero!', msg: 'OCEAN POWER!' },
    { face: '🔱', mood: 'SEA KING!', msg: 'RULER OF WAVES!' },
  ]},
  { name: 'Alien', states: [
    { face: '👽', mood: 'UFO Pilot!', msg: 'Beep boop!' },
    { face: '🌍', mood: 'Earth Friend!', msg: 'I love Earth!' },
    { face: '🚀', mood: 'Space Racer!', msg: 'ZOOM TO MARS!' },
    { face: '🌟', mood: 'GALAXY BOSS!', msg: 'RULER OF SPACE!' },
  ]},
  { name: 'Pikachu', states: [
    { face: '🐭', mood: 'Pika Pika!', msg: 'Pika pika!' },
    { face: '⚡', mood: 'Thundershock!', msg: 'PIKA CHUUU!' },
    { face: '🌩️', mood: 'Thunder Bolt!', msg: 'FEEL THE POWER!' },
    { face: '👑', mood: 'PIKA LEGEND!', msg: 'I CHOOSE YOU!' },
  ]},
  { name: 'Charmander', states: [
    { face: '🦎', mood: 'Char Char!', msg: 'Getting warmer!' },
    { face: '🔥', mood: 'Charmeleon!', msg: 'FIRE SPIN!' },
    { face: '🐉', mood: 'Charizard!', msg: 'FLAMETHROWER!' },
    { face: '🌋', mood: 'MEGA CHARIZARD!', msg: 'BLAST BURN!' },
  ]},
  { name: 'Squirtle', states: [
    { face: '🐢', mood: 'Squirtle Squad!', msg: 'Water gun!' },
    { face: '🌊', mood: 'Wartortle!', msg: 'HYDRO PUMP!' },
    { face: '🐚', mood: 'Blastoise!', msg: 'SURF\'S UP!' },
    { face: '💎', mood: 'MEGA BLASTOISE!', msg: 'TIDAL WAVE!' },
  ]},
  { name: 'Bulbasaur', states: [
    { face: '🍃', mood: 'Bulba Bulba!', msg: 'Vine whip!' },
    { face: '🌿', mood: 'Ivysaur!', msg: 'RAZOR LEAF!' },
    { face: '🌸', mood: 'Venusaur!', msg: 'SOLAR BEAM!' },
    { face: '🌺', mood: 'MEGA VENUSAUR!', msg: 'NATURE POWER!' },
  ]},
  { name: 'Eevee', states: [
    { face: '🦊', mood: 'Playful Eevee!', msg: 'Who will I be?' },
    { face: '🔥', mood: 'Flareon!', msg: 'FIRE BLAST!' },
    { face: '⚡', mood: 'Jolteon!', msg: 'THUNDERBOLT!' },
    { face: '🌈', mood: 'SYLVEON!', msg: 'FAIRY POWER!' },
  ]},
]

const EGG_STYLES = [
  { color: '#FFD700', label: 'Golden Egg' },
  { color: '#FF6B6B', label: 'Red Egg' },
  { color: '#48DBFB', label: 'Blue Egg' },
  { color: '#FF9FF3', label: 'Pink Egg' },
  { color: '#54E346', label: 'Green Egg' },
  { color: '#A29BFE', label: 'Purple Egg' },
  { color: '#FFA502', label: 'Orange Egg' },
  { color: '#00D2D3', label: 'Teal Egg' },
  { color: '#C8A86E', label: 'Nest Egg' },
  { color: '#FF6348', label: 'Fire Egg' },
  { color: '#7BED9F', label: 'Mint Egg' },
  { color: '#E056A0', label: 'Sparkle Egg' },
]

const BG_COLORS = ['#FFF8E1', '#F1F8E9', '#E8F5E9', '#E3F2FD', '#FFF3E0']

export function getPetByIndex(idx) {
  return RANDOM_PETS[idx % RANDOM_PETS.length]
}

export function getEggByIndex(idx) {
  return EGG_STYLES[idx % EGG_STYLES.length]
}

export function pickRandomPetIndex() {
  return Math.floor(Math.random() * RANDOM_PETS.length)
}

export function pickRandomEggIndex() {
  return Math.floor(Math.random() * EGG_STYLES.length)
}

export function getPetTier(score) {
  const thresholds = [0, 11, 21, 33, 43]
  let tier = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) { tier = i; break }
  }
  return tier
}

export function getPetStateByTier(tier, petIdx, eggIdx) {
  const pet = getPetByIndex(petIdx)
  const egg = getEggByIndex(eggIdx)
  if (tier === 0) {
    return {
      face: '?',
      mood: egg.label,
      msg: 'What\'s inside? Do tasks to find out!',
      bg: BG_COLORS[0],
      eggColor: egg.color,
      isEgg: true,
      petName: pet.name,
    }
  }
  const s = pet.states[tier - 1]
  return { face: s.face, mood: s.mood, msg: s.msg, bg: BG_COLORS[tier], isEgg: false, petName: pet.name }
}

export { RANDOM_PETS, EGG_STYLES }
