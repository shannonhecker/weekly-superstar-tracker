// ThemeScene — flat, rounded illustrated banner per kid theme.
// Style references: Reference A (Indonesian-style earthy mood board) and
// Reference B (Learning Animals app). Common art language:
//   - Flat shapes, no outlines, no gradients
//   - Rounded silhouettes (hills, clouds, trees)
//   - Eye-dots only (no pupils, no irises). Single cream cheek-blush.
//   - Layered scenery: sky band → distant hills → background trees →
//     foreground hill → grass tufts → theme prop → mascot character → clouds
//   - Earthy palette only — `accent` + `deeper` per theme, plus the shared
//     cocoa / cocoaSoft / cream / ivory / terracotta / terracottaSoft tokens.
//
// Each scene is its own React function so individual themes can be tweaked
// without touching the others.
import { THEMES } from '../lib/themes'

const SKY = '#FFFAF0'           // earthy.ivory
const SKY_PEACH = '#FBEFE0'     // warm sky band (warm themes)
const SKY_BLUE = '#EAF1F4'      // cool sky band (rocket / ocean)
const SKY_PURPLE = '#EFEAF4'    // cool sky band (magic / unicorn dusk)
const CLOUD = '#F8F1E4'         // earthy.cream
const COCOA = '#5A3A2E'         // earthy.cocoa (eye-dots, tiny accents)
const COCOA_SOFT = '#8B6651'    // earthy.cocoaSoft (warm body fill)
const TERRACOTTA = '#D87C4A'    // earthy.terracotta
const TERRA_SOFT = '#F4C8A8'    // earthy.terracottaSoft (blush, soft accents)
const SAGE_DEEP = '#6B8060'     // earthy.sageDeep

// --- shared helpers ---------------------------------------------------------

function Eye({ cx, cy, r = 2 }) {
  return <circle cx={cx} cy={cy} r={r} fill={COCOA} />
}

function EyeWithHighlight({ cx, cy, r = 2.5 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={COCOA} />
      <circle cx={cx + 0.7} cy={cy - 0.7} r={r * 0.3} fill={CLOUD} />
    </>
  )
}

function Cloud({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={0} rx={18} ry={9} fill={CLOUD} />
      <ellipse cx={-12} cy={2} rx={9} ry={7} fill={CLOUD} />
      <ellipse cx={12} cy={2} rx={9} ry={7} fill={CLOUD} />
    </g>
  )
}

function BushyTree({ x, y, scale = 1, fill, opacity = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle cx={-8} cy={-2} r={9} fill={fill} />
      <circle cx={6} cy={-5} r={11} fill={fill} />
      <circle cx={0} cy={-12} r={9} fill={fill} />
      <rect x={-1.5} y={-4} width={3} height={12} fill={COCOA} />
    </g>
  )
}

function GrassTufts({ positions, fill, y = 112 }) {
  return positions.map((x, i) => (
    <g key={i} transform={`translate(${x} ${y})`}>
      <path d="M -3 4 L 0 -4 L 3 4 Z" fill={fill} />
      <path d="M -6 5 L -3 -1 L 0 5 Z" fill={fill} opacity={0.7} />
      <path d="M 0 5 L 3 -1 L 6 5 Z" fill={fill} opacity={0.7} />
    </g>
  ))
}

function Sparkle({ cx, cy, size = 2.5, fill = COCOA, opacity = 1 }) {
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={size * 0.4} fill={fill} />
      <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} stroke={fill} strokeWidth={0.8} strokeLinecap="round" />
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} stroke={fill} strokeWidth={0.8} strokeLinecap="round" />
    </g>
  )
}

// --- per-theme scene compositions -------------------------------------------

function FootballScene({ accent, deeper }) {
  // Sage rabbit kicking a soccer ball, against layered hills with scattered
  // bushy trees, ground tufts, and a soft sky.
  const RABBIT = '#C8B69A'
  const RABBIT_INNER = TERRA_SOFT
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={100} cy={110} rx={150} ry={45} fill={deeper} opacity={0.5} />
      <ellipse cx={340} cy={120} rx={200} ry={55} fill={accent} opacity={0.7} />
      <ellipse cx={550} cy={115} rx={130} ry={40} fill={deeper} opacity={0.5} />
      <BushyTree x={60} y={95} fill={deeper} />
      <BushyTree x={550} y={100} fill={deeper} opacity={0.85} />
      <ellipse cx={300} cy={145} rx={400} ry={40} fill={accent} />
      <GrassTufts positions={[40, 110, 175, 240, 410, 470, 535, 575]} fill={deeper} />
      <ellipse cx={155} cy={114} rx={14} ry={5} fill={COCOA} opacity={0.4} />
      {/* Soccer ball */}
      <circle cx={155} cy={107} r={8} fill={CLOUD} />
      <path d="M 152 102 L 155 99 L 158 102 L 157 105 L 153 105 Z" fill={COCOA} />
      <line x1={147} y1={107} x2={163} y2={107} stroke={COCOA} strokeWidth={0.6} opacity={0.4} />
      {/* Rabbit */}
      <ellipse cx={345} cy={118} rx={36} ry={4} fill={COCOA} opacity={0.18} />
      <ellipse cx={345} cy={100} rx={25} ry={20} fill={RABBIT} />
      <ellipse cx={325} cy={117} rx={10} ry={5} fill={RABBIT} />
      <ellipse cx={365} cy={117} rx={10} ry={5} fill={RABBIT} />
      <ellipse cx={326} cy={105} rx={5} ry={7} fill={RABBIT} transform="rotate(-15 326 105)" />
      <circle cx={372} cy={102} r={5} fill={CLOUD} />
      <circle cx={345} cy={70} r={20} fill={RABBIT} />
      <ellipse cx={335} cy={45} rx={5} ry={16} fill={RABBIT} transform="rotate(-12 335 45)" />
      <ellipse cx={355} cy={45} rx={5} ry={16} fill={RABBIT} transform="rotate(12 355 45)" />
      <ellipse cx={335} cy={47} rx={2.5} ry={11} fill={RABBIT_INNER} transform="rotate(-12 335 47)" />
      <ellipse cx={355} cy={47} rx={2.5} ry={11} fill={RABBIT_INNER} transform="rotate(12 355 47)" />
      <circle cx={332} cy={75} r={3.5} fill={RABBIT_INNER} opacity={0.7} />
      <circle cx={358} cy={75} r={3.5} fill={RABBIT_INNER} opacity={0.7} />
      <EyeWithHighlight cx={338} cy={68} r={2.5} />
      <EyeWithHighlight cx={352} cy={68} r={2.5} />
      <ellipse cx={345} cy={75} rx={1.8} ry={1.3} fill={COCOA} />
      <path d="M 342 79 Q 345 81 348 79" stroke={COCOA} strokeWidth={1} fill="none" strokeLinecap="round" />
      <Cloud x={460} y={30} scale={0.6} />
      <Cloud x={120} y={40} scale={0.5} />
    </>
  )
}

function DinosaurScene({ accent, deeper }) {
  // Baby T-rex (theme sage) next to a sage volcano with cocoa lava drips.
  // Tiny bone in the foreground grass, bushy palm at the side.
  const BELLY = CLOUD
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={120} cy={120} rx={170} ry={55} fill={deeper} opacity={0.55} />
      <ellipse cx={460} cy={125} rx={180} ry={50} fill={accent} opacity={0.7} />
      {/* Volcano backdrop */}
      <path d="M 70 110 L 130 35 L 190 110 Z" fill={deeper} />
      <ellipse cx={130} cy={35} rx={14} ry={6} fill={TERRACOTTA} />
      <path d="M 122 38 Q 124 50 130 48 Q 134 56 138 50 Q 140 60 130 62" fill="none" stroke={TERRACOTTA} strokeWidth={2} strokeLinecap="round" />
      {/* Palm tree */}
      <g transform="translate(545 110)">
        <rect x={-2} y={-30} width={4} height={32} fill={COCOA} />
        <ellipse cx={-12} cy={-32} rx={14} ry={5} fill={deeper} transform="rotate(-25 -12 -32)" />
        <ellipse cx={12} cy={-32} rx={14} ry={5} fill={deeper} transform="rotate(25 12 -32)" />
        <ellipse cx={-3} cy={-40} rx={14} ry={5} fill={deeper} transform="rotate(-65 -3 -40)" />
        <ellipse cx={3} cy={-40} rx={14} ry={5} fill={deeper} transform="rotate(65 3 -40)" />
      </g>
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 95, 215, 275, 480, 540]} fill={deeper} />
      {/* Bone */}
      <ellipse cx={250} cy={114} rx={6} ry={2} fill={CLOUD} />
      <circle cx={244} cy={113} r={2} fill={CLOUD} />
      <circle cx={244} cy={115} r={2} fill={CLOUD} />
      <circle cx={256} cy={113} r={2} fill={CLOUD} />
      <circle cx={256} cy={115} r={2} fill={CLOUD} />
      {/* T-rex mascot */}
      <ellipse cx={350} cy={120} rx={42} ry={4} fill={COCOA} opacity={0.18} />
      {/* Tail */}
      <path d="M 395 100 Q 430 95 440 110 Q 425 105 395 110 Z" fill={accent} />
      {/* Body */}
      <ellipse cx={355} cy={95} rx={28} ry={22} fill={accent} />
      {/* Belly */}
      <ellipse cx={355} cy={102} rx={16} ry={11} fill={BELLY} />
      {/* Back ridges */}
      <path d="M 333 78 L 338 71 L 343 78 L 350 70 L 357 78 L 365 70 L 372 78 L 380 73 L 384 80 Z" fill={deeper} />
      {/* Legs */}
      <rect x={342} y={112} width={7} height={8} fill={accent} rx={2} />
      <rect x={362} y={112} width={7} height={8} fill={accent} rx={2} />
      {/* Tiny arms */}
      <ellipse cx={335} cy={98} rx={4} ry={3} fill={accent} />
      {/* Head */}
      <ellipse cx={325} cy={75} rx={20} ry={15} fill={accent} />
      <ellipse cx={313} cy={80} rx={9} ry={6} fill={accent} />
      {/* Teeth */}
      <path d="M 308 84 L 309 86 L 311 84 Z" fill={CLOUD} />
      <path d="M 313 84 L 314 86 L 316 84 Z" fill={CLOUD} />
      {/* Eye */}
      <EyeWithHighlight cx={328} cy={70} r={2.5} />
      {/* Cheek blush */}
      <circle cx={323} cy={78} r={2.5} fill={TERRA_SOFT} opacity={0.6} />
      {/* Nostril */}
      <circle cx={310} cy={78} r={0.8} fill={COCOA} />
      <Cloud x={250} y={32} scale={0.55} />
      <Cloud x={460} y={28} scale={0.5} />
    </>
  )
}

function UnicornScene({ accent, deeper }) {
  // Cream unicorn with pink mane, cone horn, hooves; rainbow arc backdrop.
  const BODY = CLOUD
  const MANE_A = accent          // dusty pink
  const MANE_B = SAGE_DEEP       // sage stripe
  const MANE_C = TERRACOTTA      // terracotta tip
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PURPLE} />
      <ellipse cx={150} cy={120} rx={200} ry={55} fill={deeper} opacity={0.45} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.7} />
      {/* Rainbow arc behind */}
      <path d="M 80 120 A 220 220 0 0 1 520 120" stroke={deeper} strokeWidth={6} fill="none" opacity={0.55} />
      <path d="M 90 120 A 210 210 0 0 1 510 120" stroke={accent} strokeWidth={6} fill="none" opacity={0.7} />
      <path d="M 100 120 A 200 200 0 0 1 500 120" stroke={CLOUD} strokeWidth={6} fill="none" />
      <BushyTree x={60} y={108} fill={deeper} opacity={0.6} scale={0.85} />
      <BushyTree x={555} y={108} fill={deeper} opacity={0.6} scale={0.85} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 95, 200, 260, 460, 540]} fill={deeper} />
      {/* Sparkles */}
      <Sparkle cx={150} cy={45} size={3} fill={accent} />
      <Sparkle cx={500} cy={50} size={3} fill={accent} />
      <Sparkle cx={420} cy={30} size={2} fill={TERRACOTTA} />
      {/* Unicorn */}
      <ellipse cx={310} cy={120} rx={42} ry={4} fill={COCOA} opacity={0.18} />
      {/* Body */}
      <ellipse cx={310} cy={97} rx={32} ry={18} fill={BODY} />
      {/* Legs */}
      <rect x={290} y={108} width={6} height={12} fill={BODY} />
      <rect x={302} y={110} width={6} height={10} fill={BODY} />
      <rect x={318} y={110} width={6} height={10} fill={BODY} />
      <rect x={330} y={108} width={6} height={12} fill={BODY} />
      {/* Hooves */}
      <rect x={290} y={117} width={6} height={3} fill={COCOA} />
      <rect x={302} y={117} width={6} height={3} fill={COCOA} />
      <rect x={318} y={117} width={6} height={3} fill={COCOA} />
      <rect x={330} y={117} width={6} height={3} fill={COCOA} />
      {/* Tail */}
      <path d="M 342 90 Q 358 80 358 100 Q 350 110 342 105 Z" fill={MANE_A} />
      <path d="M 352 88 Q 360 82 358 100 Q 354 100 352 95 Z" fill={MANE_B} opacity={0.8} />
      {/* Head */}
      <ellipse cx={278} cy={78} rx={16} ry={14} fill={BODY} />
      <ellipse cx={266} cy={82} rx={8} ry={6} fill={BODY} />
      {/* Mane */}
      <path d="M 278 65 Q 285 50 295 65 Q 290 75 282 75 Z" fill={MANE_A} />
      <path d="M 270 70 Q 268 56 282 60 Q 280 75 272 78 Z" fill={MANE_B} />
      <path d="M 286 68 Q 294 56 298 70 Q 290 78 286 76 Z" fill={MANE_C} opacity={0.85} />
      {/* Horn */}
      <path d="M 282 60 L 285 42 L 290 62 Z" fill={CLOUD} />
      <line x1={284} y1={55} x2={288} y2={51} stroke={accent} strokeWidth={0.6} />
      {/* Ear */}
      <path d="M 287 65 L 292 56 L 296 68 Z" fill={BODY} />
      {/* Eye */}
      <EyeWithHighlight cx={272} cy={78} r={2.2} />
      {/* Cheek */}
      <circle cx={267} cy={84} r={2.5} fill={accent} opacity={0.7} />
      {/* Nostril */}
      <circle cx={262} cy={82} r={0.7} fill={COCOA} />
      <Cloud x={120} y={40} scale={0.5} />
    </>
  )
}

function AnimalsScene({ accent, deeper }) {
  // Fox (terracotta) with a tiny cream bird on its tail, paw prints in grass.
  const FOX = deeper             // terracotta
  const FOX_LIGHT = accent       // peach
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={SAGE_DEEP} opacity={0.45} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.6} />
      <BushyTree x={60} y={100} fill={SAGE_DEEP} />
      <BushyTree x={555} y={105} fill={SAGE_DEEP} opacity={0.85} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 95, 165, 230, 440, 510, 565]} fill={SAGE_DEEP} />
      {/* Paw prints */}
      <g fill={COCOA} opacity={0.5}>
        <ellipse cx={210} cy={115} rx={2} ry={1.5} />
        <circle cx={207} cy={113} r={0.8} />
        <circle cx={213} cy={113} r={0.8} />
        <ellipse cx={235} cy={113} rx={2} ry={1.5} />
        <circle cx={232} cy={111} r={0.8} />
        <circle cx={238} cy={111} r={0.8} />
        <ellipse cx={260} cy={115} rx={2} ry={1.5} />
        <circle cx={257} cy={113} r={0.8} />
        <circle cx={263} cy={113} r={0.8} />
      </g>
      {/* Fox mascot */}
      <ellipse cx={350} cy={120} rx={40} ry={4} fill={COCOA} opacity={0.18} />
      {/* Tail — big and curving */}
      <path d="M 385 95 Q 420 80 425 105 Q 415 115 388 110 Z" fill={FOX} />
      <path d="M 412 88 Q 425 80 425 105 Q 418 102 412 95 Z" fill={CLOUD} />
      {/* Body */}
      <ellipse cx={355} cy={100} rx={28} ry={18} fill={FOX} />
      {/* Chest */}
      <ellipse cx={345} cy={107} rx={11} ry={8} fill={CLOUD} />
      {/* Legs */}
      <rect x={342} y={112} width={6} height={9} fill={FOX} rx={2} />
      <rect x={362} y={112} width={6} height={9} fill={FOX} rx={2} />
      {/* Head */}
      <circle cx={335} cy={75} r={18} fill={FOX} />
      {/* Snout */}
      <path d="M 318 78 L 325 80 L 322 86 Z" fill={CLOUD} />
      <circle cx={320} cy={82} r={1.3} fill={COCOA} />
      {/* Ears */}
      <path d="M 322 60 L 325 45 L 333 60 Z" fill={FOX} />
      <path d="M 322 60 L 325 50 L 330 60 Z" fill={FOX_LIGHT} />
      <path d="M 338 60 L 343 45 L 348 60 Z" fill={FOX} />
      <path d="M 338 60 L 343 50 L 346 60 Z" fill={FOX_LIGHT} />
      {/* Eye */}
      <EyeWithHighlight cx={332} cy={73} r={2.2} />
      {/* Cheek */}
      <circle cx={328} cy={80} r={2} fill={CLOUD} opacity={0.5} />
      {/* Tiny bird on tail */}
      <g transform="translate(412 80)">
        <ellipse cx={0} cy={0} rx={6} ry={5} fill={CLOUD} />
        <circle cx={4} cy={-3} r={3.5} fill={CLOUD} />
        <Eye cx={5} cy={-3} r={1} />
        <path d="M 7 -2 L 10 -2 L 7 -1 Z" fill={TERRACOTTA} />
        <path d="M -4 1 L -7 4 L -3 3 Z" fill={CLOUD} />
      </g>
      <Cloud x={150} y={32} scale={0.55} />
      <Cloud x={500} y={38} scale={0.5} />
    </>
  )
}

function RocketScene({ accent, deeper }) {
  // Astronaut bear next to a small rocket on a launchpad, planet + stars.
  const BEAR = COCOA_SOFT
  const HELMET = CLOUD
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_BLUE} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={deeper} opacity={0.45} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.6} />
      {/* Stars */}
      <Sparkle cx={80} cy={30} size={2.5} fill={COCOA} />
      <Sparkle cx={200} cy={20} size={2} fill={COCOA} />
      <Sparkle cx={290} cy={42} size={2} fill={COCOA} />
      <Sparkle cx={550} cy={28} size={2.5} fill={COCOA} />
      {/* Planet with ring */}
      <ellipse cx={120} cy={45} rx={28} ry={5} fill={deeper} opacity={0.5} />
      <circle cx={120} cy={45} r={18} fill={accent} />
      <ellipse cx={113} cy={40} rx={5} ry={3} fill={CLOUD} opacity={0.5} />
      <BushyTree x={555} y={108} fill={deeper} opacity={0.7} scale={0.8} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 170, 540]} fill={deeper} />
      {/* Rocket on launchpad */}
      <rect x={210} y={108} width={36} height={4} fill={SAGE_DEEP} />
      <rect x={216} y={112} width={4} height={4} fill={COCOA} />
      <rect x={236} y={112} width={4} height={4} fill={COCOA} />
      {/* Rocket body */}
      <path d="M 222 108 Q 222 80 228 70 Q 234 80 234 108 Z" fill={TERRACOTTA} />
      <circle cx={228} cy={88} r={3} fill={CLOUD} />
      <circle cx={228} cy={88} r={1.5} fill={COCOA} />
      <path d="M 222 108 L 218 116 L 224 113 Z" fill={deeper} />
      <path d="M 234 108 L 240 116 L 232 113 Z" fill={deeper} />
      {/* Astronaut bear */}
      <ellipse cx={370} cy={120} rx={40} ry={4} fill={COCOA} opacity={0.18} />
      {/* Body — spacesuit */}
      <ellipse cx={370} cy={102} rx={26} ry={18} fill={CLOUD} />
      <rect x={365} y={92} width={10} height={5} rx={2} fill={TERRACOTTA} />
      {/* Legs */}
      <rect x={356} y={114} width={8} height={8} fill={CLOUD} rx={2} />
      <rect x={376} y={114} width={8} height={8} fill={CLOUD} rx={2} />
      {/* Arms */}
      <ellipse cx={345} cy={100} rx={6} ry={4} fill={CLOUD} />
      <ellipse cx={395} cy={100} rx={6} ry={4} fill={CLOUD} />
      {/* Helmet */}
      <circle cx={370} cy={75} r={20} fill={HELMET} />
      <circle cx={370} cy={75} r={17} fill={SKY_BLUE} opacity={0.5} />
      {/* Bear face inside helmet */}
      <circle cx={370} cy={78} r={14} fill={BEAR} />
      {/* Bear ears poking inside helmet */}
      <circle cx={358} cy={68} r={4} fill={BEAR} />
      <circle cx={382} cy={68} r={4} fill={BEAR} />
      <circle cx={358} cy={68} r={2} fill={TERRA_SOFT} />
      <circle cx={382} cy={68} r={2} fill={TERRA_SOFT} />
      {/* Snout */}
      <ellipse cx={370} cy={84} rx={6} ry={4} fill={CLOUD} />
      <ellipse cx={370} cy={82} rx={1.5} ry={1.2} fill={COCOA} />
      {/* Eyes */}
      <EyeWithHighlight cx={365} cy={77} r={2.2} />
      <EyeWithHighlight cx={375} cy={77} r={2.2} />
      {/* Cheek blush */}
      <circle cx={362} cy={84} r={2} fill={TERRA_SOFT} opacity={0.7} />
      <circle cx={378} cy={84} r={2} fill={TERRA_SOFT} opacity={0.7} />
      {/* Antenna on helmet */}
      <line x1={370} y1={55} x2={370} y2={48} stroke={COCOA} strokeWidth={1} />
      <circle cx={370} cy={47} r={2} fill={TERRACOTTA} />
    </>
  )
}

function PrincessScene({ accent, deeper }) {
  // Cream cat in a cocoa crown, sitting in front of a small castle silhouette.
  const CAT = CLOUD
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={deeper} opacity={0.4} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.65} />
      {/* Castle backdrop */}
      <g transform="translate(490 60)">
        <rect x={-30} y={20} width={60} height={48} fill={accent} />
        <rect x={-35} y={5} width={20} height={63} fill={accent} />
        <rect x={15} y={5} width={20} height={63} fill={accent} />
        <rect x={-8} y={-5} width={16} height={73} fill={accent} />
        <path d="M -35 5 L -25 -8 L -15 5 Z" fill={TERRACOTTA} />
        <path d="M 15 5 L 25 -8 L 35 5 Z" fill={TERRACOTTA} />
        <path d="M -8 -5 L 0 -20 L 8 -5 Z" fill={TERRACOTTA} />
        <rect x={-3} y={45} width={6} height={23} fill={COCOA} />
        <rect x={-30} y={28} width={6} height={6} fill={SAGE_DEEP} />
        <rect x={24} y={28} width={6} height={6} fill={SAGE_DEEP} />
      </g>
      <BushyTree x={60} y={108} fill={SAGE_DEEP} opacity={0.6} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 175, 240, 415]} fill={deeper} />
      {/* Heart sparkle */}
      <path d="M 245 70 Q 240 64 235 68 Q 235 74 245 80 Q 255 74 255 68 Q 250 64 245 70 Z" fill={TERRACOTTA} opacity={0.8} />
      {/* Cat mascot */}
      <ellipse cx={300} cy={120} rx={40} ry={4} fill={COCOA} opacity={0.18} />
      {/* Tail curling */}
      <path d="M 332 105 Q 350 95 348 115 Q 340 118 332 112 Z" fill={CAT} />
      {/* Body */}
      <ellipse cx={300} cy={100} rx={26} ry={18} fill={CAT} />
      {/* Legs */}
      <rect x={285} y={113} width={7} height={8} fill={CAT} rx={2} />
      <rect x={308} y={113} width={7} height={8} fill={CAT} rx={2} />
      {/* Head */}
      <circle cx={295} cy={75} r={17} fill={CAT} />
      {/* Ears */}
      <path d="M 282 68 L 280 55 L 290 65 Z" fill={CAT} />
      <path d="M 308 68 L 310 55 L 300 65 Z" fill={CAT} />
      <path d="M 284 65 L 282 58 L 288 64 Z" fill={accent} />
      <path d="M 306 65 L 308 58 L 302 64 Z" fill={accent} />
      {/* Crown — three points sitting on the head */}
      <path d="M 285 60 L 288 50 L 291 58 L 295 48 L 299 58 L 303 50 L 306 60 Z" fill={COCOA} />
      <circle cx={288} cy={51} r={1.5} fill={TERRACOTTA} />
      <circle cx={295} cy={49} r={1.7} fill={TERRACOTTA} />
      <circle cx={303} cy={51} r={1.5} fill={TERRACOTTA} />
      {/* Face */}
      <EyeWithHighlight cx={290} cy={75} r={2.2} />
      <EyeWithHighlight cx={300} cy={75} r={2.2} />
      <ellipse cx={295} cy={81} rx={1.5} ry={1.2} fill={COCOA} />
      <path d="M 292 84 Q 295 86 298 84" stroke={COCOA} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1={283} y1={81} x2={278} y2={80} stroke={COCOA} strokeWidth={0.6} />
      <line x1={283} y1={83} x2={278} y2={84} stroke={COCOA} strokeWidth={0.6} />
      <line x1={307} y1={81} x2={312} y2={80} stroke={COCOA} strokeWidth={0.6} />
      <line x1={307} y1={83} x2={312} y2={84} stroke={COCOA} strokeWidth={0.6} />
      {/* Cheek blush */}
      <circle cx={285} cy={82} r={2.5} fill={accent} opacity={0.6} />
      <circle cx={305} cy={82} r={2.5} fill={accent} opacity={0.6} />
      <Cloud x={150} y={35} scale={0.55} />
    </>
  )
}

function OceanScene({ accent, deeper }) {
  // Octopus mascot splashing in waves; sun, shell, bubbles.
  const OCTO = accent          // sea-foam
  return (
    <>
      <rect x={0} y={0} width={600} height={70} fill={SKY_BLUE} />
      <circle cx={510} cy={45} r={24} fill={TERRA_SOFT} />
      <Cloud x={120} y={30} scale={0.6} />
      <Cloud x={400} y={25} scale={0.5} />
      {/* Bubbles */}
      <circle cx={180} cy={55} r={3} fill={CLOUD} opacity={0.7} />
      <circle cx={230} cy={45} r={2.5} fill={CLOUD} opacity={0.7} />
      <circle cx={195} cy={40} r={2} fill={CLOUD} opacity={0.7} />
      {/* Wave layers */}
      <path d="M 0 95 Q 60 80 120 95 T 240 95 T 360 95 T 480 95 T 600 95 L 600 200 L 0 200 Z" fill={accent} />
      <path d="M 0 115 Q 60 100 120 115 T 240 115 T 360 115 T 480 115 T 600 115 L 600 200 L 0 200 Z" fill={deeper} opacity={0.85} />
      {/* Octopus mascot */}
      <ellipse cx={300} cy={108} rx={42} ry={4} fill={COCOA} opacity={0.18} />
      {/* Tentacles — curls coming forward over the wave */}
      <path d="M 270 95 Q 260 110 250 105 Q 250 100 258 100 Q 263 90 270 95" fill={OCTO} />
      <path d="M 285 100 Q 280 118 290 117 Q 295 110 290 105 Q 285 100 285 100" fill={OCTO} />
      <path d="M 315 100 Q 320 118 310 117 Q 305 110 310 105 Q 315 100 315 100" fill={OCTO} />
      <path d="M 330 95 Q 340 110 350 105 Q 350 100 342 100 Q 337 90 330 95" fill={OCTO} />
      {/* Head/body */}
      <ellipse cx={300} cy={80} rx={28} ry={26} fill={OCTO} />
      {/* Top highlight */}
      <ellipse cx={290} cy={68} rx={8} ry={4} fill={CLOUD} opacity={0.4} />
      {/* Eyes */}
      <circle cx={290} cy={78} r={5} fill={CLOUD} />
      <circle cx={310} cy={78} r={5} fill={CLOUD} />
      <Eye cx={291} cy={79} r={2} />
      <Eye cx={311} cy={79} r={2} />
      <circle cx={292} cy={78} r={0.7} fill={CLOUD} />
      <circle cx={312} cy={78} r={0.7} fill={CLOUD} />
      {/* Cheek blush */}
      <circle cx={283} cy={88} r={2.5} fill={TERRA_SOFT} opacity={0.7} />
      <circle cx={317} cy={88} r={2.5} fill={TERRA_SOFT} opacity={0.7} />
      {/* Tiny mouth */}
      <path d="M 296 92 Q 300 95 304 92" stroke={COCOA} strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* Shell on the wave */}
      <g transform="translate(440 105)">
        <path d="M 0 0 Q -10 -8 -8 -3 Q -10 5 0 6 Q 10 5 8 -3 Q 10 -8 0 0 Z" fill={CLOUD} />
        <path d="M 0 0 Q -3 -3 -3 -1 Q -4 2 0 2 Q 4 2 3 -1 Q 3 -3 0 0 Z" fill={TERRA_SOFT} />
      </g>
    </>
  )
}

function GardenScene({ accent, deeper }) {
  // Bee mascot hovering over a sage flower with terracotta petals; butterfly nearby.
  const BEE_BODY = CLOUD
  const BEE_STRIPE = COCOA
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={deeper} opacity={0.5} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.7} />
      <BushyTree x={60} y={105} fill={deeper} />
      <BushyTree x={555} y={108} fill={deeper} opacity={0.8} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 175, 240, 410, 480, 540]} fill={deeper} />
      {/* Tall sage flower */}
      <line x1={205} y1={115} x2={205} y2={70} stroke={deeper} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={195} cy={95} rx={6} ry={3} fill={deeper} transform="rotate(-30 195 95)" />
      <ellipse cx={215} cy={100} rx={6} ry={3} fill={deeper} transform="rotate(30 215 100)" />
      <circle cx={205} cy={62} r={5} fill={TERRACOTTA} />
      <circle cx={195} cy={58} r={5} fill={TERRACOTTA} />
      <circle cx={215} cy={58} r={5} fill={TERRACOTTA} />
      <circle cx={200} cy={50} r={5} fill={TERRACOTTA} />
      <circle cx={210} cy={50} r={5} fill={TERRACOTTA} />
      <circle cx={205} cy={56} r={5} fill={CLOUD} />
      {/* Butterfly */}
      <g transform="translate(490 55)">
        <ellipse cx={-6} cy={0} rx={7} ry={9} fill={accent} transform="rotate(-30 -6 0)" />
        <ellipse cx={6} cy={0} rx={7} ry={9} fill={accent} transform="rotate(30 6 0)" />
        <ellipse cx={-5} cy={-2} rx={3} ry={4} fill={TERRACOTTA} opacity={0.6} transform="rotate(-30 -5 -2)" />
        <ellipse cx={5} cy={-2} rx={3} ry={4} fill={TERRACOTTA} opacity={0.6} transform="rotate(30 5 -2)" />
        <line x1={0} y1={-5} x2={0} y2={6} stroke={COCOA} strokeWidth={1.2} />
      </g>
      {/* Bee mascot */}
      <ellipse cx={345} cy={108} rx={32} ry={3} fill={COCOA} opacity={0.18} />
      {/* Wings */}
      <ellipse cx={335} cy={68} rx={11} ry={14} fill={CLOUD} opacity={0.7} transform="rotate(-25 335 68)" />
      <ellipse cx={355} cy={68} rx={11} ry={14} fill={CLOUD} opacity={0.7} transform="rotate(25 355 68)" />
      {/* Body */}
      <ellipse cx={345} cy={88} rx={22} ry={18} fill={BEE_BODY} />
      {/* Stripes */}
      <path d="M 327 84 Q 345 78 363 84 L 363 90 Q 345 84 327 90 Z" fill={BEE_STRIPE} />
      <path d="M 327 96 Q 345 90 363 96 L 363 100 Q 345 96 327 100 Z" fill={BEE_STRIPE} />
      {/* Stinger */}
      <path d="M 365 95 L 372 92 L 365 99 Z" fill={COCOA} />
      {/* Antennae */}
      <line x1={340} y1={75} x2={336} y2={66} stroke={COCOA} strokeWidth={1} strokeLinecap="round" />
      <line x1={350} y1={75} x2={354} y2={66} stroke={COCOA} strokeWidth={1} strokeLinecap="round" />
      <circle cx={336} cy={65} r={1.4} fill={COCOA} />
      <circle cx={354} cy={65} r={1.4} fill={COCOA} />
      {/* Eyes */}
      <EyeWithHighlight cx={340} cy={82} r={2.2} />
      <EyeWithHighlight cx={350} cy={82} r={2.2} />
      {/* Cheek */}
      <circle cx={335} cy={88} r={2.5} fill={TERRA_SOFT} opacity={0.7} />
      <circle cx={355} cy={88} r={2.5} fill={TERRA_SOFT} opacity={0.7} />
      {/* Tiny smile */}
      <path d="M 342 93 Q 345 95 348 93" stroke={COCOA} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <Cloud x={150} y={40} scale={0.5} />
    </>
  )
}

function RobotScene({ accent, deeper }) {
  // Robot mascot with antenna + glow dot; gears + wrench in foreground.
  const ROBOT = accent          // warm grey
  const ROBOT_DEEP = deeper
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={deeper} opacity={0.5} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.7} />
      <BushyTree x={60} y={108} fill={SAGE_DEEP} opacity={0.7} scale={0.85} />
      <BushyTree x={555} y={108} fill={SAGE_DEEP} opacity={0.7} scale={0.85} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 240, 540]} fill={SAGE_DEEP} />
      {/* Gear background */}
      <g transform="translate(490 88)">
        <circle cx={0} cy={0} r={16} fill={ROBOT_DEEP} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect key={deg} x={-3} y={-22} width={6} height={6} fill={ROBOT_DEEP} transform={`rotate(${deg})`} />
        ))}
        <circle cx={0} cy={0} r={6} fill={CLOUD} />
      </g>
      {/* Smaller gear */}
      <g transform="translate(180 105)">
        <circle cx={0} cy={0} r={10} fill={ROBOT_DEEP} opacity={0.7} />
        {[0, 72, 144, 216, 288].map((deg) => (
          <rect key={deg} x={-2.5} y={-14} width={5} height={5} fill={ROBOT_DEEP} opacity={0.7} transform={`rotate(${deg})`} />
        ))}
        <circle cx={0} cy={0} r={4} fill={CLOUD} />
      </g>
      {/* Wrench */}
      <g transform="translate(245 115) rotate(-25)">
        <rect x={-2} y={-12} width={4} height={20} fill={COCOA} />
        <path d="M -5 -15 L 5 -15 L 7 -10 L 3 -8 L 3 -5 L -3 -5 L -3 -8 L -7 -10 Z" fill={COCOA} />
      </g>
      {/* Robot mascot */}
      <ellipse cx={345} cy={120} rx={40} ry={4} fill={COCOA} opacity={0.2} />
      {/* Body */}
      <rect x={320} y={75} width={50} height={45} rx={8} fill={ROBOT} />
      {/* Belly screen */}
      <rect x={328} y={92} width={34} height={20} rx={4} fill={ROBOT_DEEP} />
      <rect x={332} y={96} width={5} height={3} fill={TERRACOTTA} />
      <rect x={332} y={101} width={10} height={3} fill={CLOUD} />
      <rect x={332} y={106} width={7} height={3} fill={CLOUD} opacity={0.6} />
      <circle cx={355} cy={102} r={3} fill={SAGE_DEEP} />
      {/* Arms */}
      <rect x={310} y={82} width={12} height={6} rx={3} fill={ROBOT} />
      <rect x={368} y={82} width={12} height={6} rx={3} fill={ROBOT} />
      <circle cx={307} cy={85} r={5} fill={ROBOT} />
      <circle cx={383} cy={85} r={5} fill={ROBOT} />
      {/* Legs */}
      <rect x={328} y={120} width={10} height={4} fill={ROBOT_DEEP} />
      <rect x={352} y={120} width={10} height={4} fill={ROBOT_DEEP} />
      {/* Head */}
      <rect x={325} y={50} width={40} height={28} rx={6} fill={ROBOT} />
      {/* Antenna */}
      <line x1={345} y1={50} x2={345} y2={38} stroke={COCOA} strokeWidth={1.5} />
      <circle cx={345} cy={36} r={3.5} fill={CLOUD} />
      <circle cx={345} cy={36} r={1.8} fill={TERRACOTTA} />
      {/* Eyes */}
      <rect x={332} y={60} width={8} height={6} rx={2} fill={CLOUD} />
      <rect x={350} y={60} width={8} height={6} rx={2} fill={CLOUD} />
      <circle cx={336} cy={63} r={1.5} fill={COCOA} />
      <circle cx={354} cy={63} r={1.5} fill={COCOA} />
      {/* Mouth — simple slot */}
      <rect x={338} y={71} width={14} height={2} rx={1} fill={COCOA} />
      {/* Cheek lights */}
      <circle cx={329} cy={66} r={1.5} fill={TERRA_SOFT} opacity={0.8} />
      <circle cx={361} cy={66} r={1.5} fill={TERRA_SOFT} opacity={0.8} />
      <Cloud x={120} y={32} scale={0.55} />
    </>
  )
}

function MagicScene({ accent, deeper }) {
  // Cat in wizard hat holding a wand; crescent moon + sparkles.
  const CAT = accent             // dusty purple
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PURPLE} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={deeper} opacity={0.55} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.75} />
      {/* Crescent moon */}
      <circle cx={500} cy={45} r={20} fill={CLOUD} />
      <circle cx={508} cy={42} r={17} fill={SKY_PURPLE} />
      {/* Sparkles */}
      <Sparkle cx={250} cy={30} size={2.8} fill={accent} />
      <Sparkle cx={300} cy={50} size={2} fill={accent} />
      <Sparkle cx={400} cy={28} size={2.5} fill={accent} />
      <Sparkle cx={150} cy={40} size={2} fill={accent} />
      <BushyTree x={60} y={108} fill={deeper} opacity={0.7} scale={0.85} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 95, 240, 480, 540]} fill={deeper} />
      {/* Crystal/gem in foreground */}
      <path d="M 200 113 L 195 105 L 200 100 L 205 105 Z" fill={accent} opacity={0.8} />
      <path d="M 200 113 L 205 105 L 200 100 Z" fill={CLOUD} opacity={0.5} />
      {/* Cat mascot */}
      <ellipse cx={350} cy={120} rx={42} ry={4} fill={COCOA} opacity={0.2} />
      {/* Tail */}
      <path d="M 380 105 Q 400 95 398 115 Q 388 118 380 112 Z" fill={CAT} />
      {/* Body */}
      <ellipse cx={355} cy={100} rx={26} ry={18} fill={CAT} />
      {/* Front paws holding wand */}
      <ellipse cx={335} cy={108} rx={5} ry={4} fill={CAT} />
      <ellipse cx={345} cy={112} rx={5} ry={4} fill={CAT} />
      {/* Legs */}
      <rect x={362} y={113} width={7} height={8} fill={CAT} rx={2} />
      <rect x={372} y={111} width={7} height={9} fill={CAT} rx={2} />
      {/* Wand */}
      <line x1={320} y1={110} x2={345} y2={92} stroke={SAGE_DEEP} strokeWidth={2} strokeLinecap="round" />
      <Sparkle cx={318} cy={111} size={3} fill={TERRACOTTA} />
      {/* Head */}
      <circle cx={345} cy={75} r={17} fill={CAT} />
      {/* Ears (poking out under hat) */}
      <path d="M 332 65 L 330 55 L 338 62 Z" fill={CAT} />
      <path d="M 358 65 L 360 55 L 352 62 Z" fill={CAT} />
      {/* Wizard hat */}
      <path d="M 322 60 Q 345 25 368 60 Z" fill={COCOA} />
      <path d="M 318 60 L 372 60 L 372 64 L 318 64 Z" fill={COCOA} />
      {/* Stars on hat */}
      <Sparkle cx={340} cy={48} size={2} fill={CLOUD} />
      <Sparkle cx={350} cy={40} size={1.7} fill={CLOUD} />
      <Sparkle cx={348} cy={55} size={1.5} fill={accent} />
      {/* Brim band */}
      <rect x={320} y={60} width={50} height={2} fill={accent} />
      {/* Face */}
      <EyeWithHighlight cx={340} cy={76} r={2.3} />
      <EyeWithHighlight cx={350} cy={76} r={2.3} />
      <ellipse cx={345} cy={82} rx={1.5} ry={1.2} fill={COCOA} />
      <path d="M 342 85 Q 345 87 348 85" stroke={COCOA} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <circle cx={335} cy={83} r={2.5} fill={TERRA_SOFT} opacity={0.6} />
      <circle cx={355} cy={83} r={2.5} fill={TERRA_SOFT} opacity={0.6} />
      {/* Whiskers */}
      <line x1={333} y1={82} x2={328} y2={81} stroke={COCOA} strokeWidth={0.5} />
      <line x1={357} y1={82} x2={362} y2={81} stroke={COCOA} strokeWidth={0.5} />
    </>
  )
}

function RugbyScene({ accent, deeper }) {
  // Sturdy bull mascot kicking a rugby ball; warm tan field.
  const BULL = deeper             // cocoaSoft
  const BULL_LIGHT = accent       // warm tan
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={SAGE_DEEP} opacity={0.4} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.7} />
      <BushyTree x={60} y={100} fill={SAGE_DEEP} opacity={0.7} />
      <BushyTree x={555} y={108} fill={SAGE_DEEP} opacity={0.7} scale={0.85} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 175, 240, 410, 470, 540]} fill={SAGE_DEEP} />
      {/* Goalpost in the far distance */}
      <rect x={500} y={62} width={2} height={45} fill={CLOUD} />
      <rect x={528} y={62} width={2} height={45} fill={CLOUD} />
      <rect x={500} y={62} width={30} height={2} fill={CLOUD} />
      {/* Rugby ball on the grass */}
      <ellipse cx={170} cy={107} rx={11} ry={6} fill={TERRACOTTA} transform="rotate(-20 170 107)" />
      <line x1={163} y1={108} x2={177} y2={106} stroke={CLOUD} strokeWidth={0.8} />
      <line x1={172} y1={102} x2={172} y2={112} stroke={CLOUD} strokeWidth={0.8} />
      {/* Bull mascot */}
      <ellipse cx={350} cy={120} rx={42} ry={4} fill={COCOA} opacity={0.18} />
      {/* Body */}
      <ellipse cx={355} cy={97} rx={30} ry={20} fill={BULL} />
      {/* Belly */}
      <ellipse cx={355} cy={104} rx={18} ry={11} fill={BULL_LIGHT} />
      {/* Legs */}
      <rect x={338} y={113} width={7} height={9} fill={BULL} rx={2} />
      <rect x={368} y={113} width={7} height={9} fill={BULL} rx={2} />
      {/* Tail */}
      <path d="M 384 95 Q 396 92 396 105 Q 388 108 384 102 Z" fill={BULL} />
      {/* Head */}
      <ellipse cx={328} cy={80} rx={18} ry={15} fill={BULL} />
      {/* Snout */}
      <ellipse cx={316} cy={86} rx={9} ry={6} fill={CLOUD} />
      <circle cx={313} cy={86} r={1} fill={COCOA} />
      <circle cx={319} cy={86} r={1} fill={COCOA} />
      {/* Horns */}
      <path d="M 318 70 Q 312 60 318 65 Q 322 67 322 72 Z" fill={CLOUD} />
      <path d="M 338 70 Q 344 60 338 65 Q 334 67 334 72 Z" fill={CLOUD} />
      {/* Ears */}
      <ellipse cx={314} cy={75} rx={3} ry={5} fill={BULL} transform="rotate(-30 314 75)" />
      <ellipse cx={342} cy={75} rx={3} ry={5} fill={BULL} transform="rotate(30 342 75)" />
      {/* Eyes */}
      <EyeWithHighlight cx={325} cy={78} r={2.3} />
      <EyeWithHighlight cx={335} cy={78} r={2.3} />
      {/* Cheek */}
      <circle cx={322} cy={86} r={2.5} fill={TERRA_SOFT} opacity={0.5} />
      <circle cx={338} cy={86} r={2.5} fill={TERRA_SOFT} opacity={0.5} />
      <Cloud x={150} y={32} scale={0.55} />
      <Cloud x={460} y={28} scale={0.5} />
    </>
  )
}

function TrainScene({ accent, deeper }) {
  // Smiling steam train engine with smoke puffs; tracks below.
  const ENGINE = deeper           // deep cocoa-grey
  const ENGINE_LIGHT = accent     // warm grey-tan
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={deeper} opacity={0.45} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.7} />
      <BushyTree x={60} y={108} fill={SAGE_DEEP} opacity={0.7} scale={0.85} />
      <BushyTree x={555} y={108} fill={SAGE_DEEP} opacity={0.7} scale={0.85} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 540]} fill={SAGE_DEEP} />
      {/* Tracks */}
      <rect x={150} y={117} width={300} height={3} fill={COCOA} opacity={0.6} />
      {[160, 195, 230, 265, 300, 335, 370, 405, 440].map((x) => (
        <rect key={x} x={x} y={114} width={4} height={9} fill={COCOA} opacity={0.5} />
      ))}
      {/* Smoke puffs */}
      <Cloud x={290} y={35} scale={0.55} />
      <Cloud x={250} y={50} scale={0.4} />
      <Cloud x={325} y={48} scale={0.4} />
      {/* Train body */}
      <ellipse cx={340} cy={120} rx={62} ry={4} fill={COCOA} opacity={0.2} />
      {/* Coal car */}
      <rect x={388} y={88} width={32} height={28} rx={3} fill={ENGINE} />
      <rect x={392} y={94} width={24} height={4} fill={TERRACOTTA} />
      {/* Engine main body */}
      <rect x={300} y={75} width={86} height={42} rx={6} fill={ENGINE} />
      {/* Boiler — cylinder */}
      <ellipse cx={340} cy={75} rx={20} ry={6} fill={ENGINE_LIGHT} />
      <ellipse cx={340} cy={117} rx={20} ry={6} fill={ENGINE_LIGHT} />
      <rect x={320} y={75} width={40} height={42} fill={ENGINE_LIGHT} />
      {/* Smokestack */}
      <rect x={330} y={55} width={8} height={20} fill={ENGINE} />
      <rect x={326} y={52} width={16} height={5} rx={1} fill={ENGINE} />
      {/* Cabin window */}
      <rect x={365} y={82} width={16} height={14} rx={2} fill={CLOUD} />
      <rect x={365} y={82} width={16} height={14} rx={2} fill={SKY_BLUE} opacity={0.5} />
      {/* Front face */}
      <circle cx={310} cy={97} r={14} fill={CLOUD} />
      <EyeWithHighlight cx={306} cy={94} r={2.2} />
      <EyeWithHighlight cx={314} cy={94} r={2.2} />
      <path d="M 306 102 Q 310 105 314 102" stroke={COCOA} strokeWidth={1} fill="none" strokeLinecap="round" />
      <circle cx={303} cy={102} r={1.8} fill={TERRA_SOFT} opacity={0.7} />
      <circle cx={317} cy={102} r={1.8} fill={TERRA_SOFT} opacity={0.7} />
      {/* Headlamp */}
      <circle cx={296} cy={92} r={3} fill={TERRA_SOFT} />
      {/* Wheels */}
      <circle cx={315} cy={117} r={8} fill={COCOA} />
      <circle cx={315} cy={117} r={3} fill={CLOUD} />
      <circle cx={345} cy={117} r={9} fill={COCOA} />
      <circle cx={345} cy={117} r={3.5} fill={CLOUD} />
      <circle cx={375} cy={117} r={8} fill={COCOA} />
      <circle cx={375} cy={117} r={3} fill={CLOUD} />
      <circle cx={400} cy={117} r={6} fill={COCOA} />
      <circle cx={400} cy={117} r={2.5} fill={CLOUD} />
      <circle cx={414} cy={117} r={6} fill={COCOA} />
      <circle cx={414} cy={117} r={2.5} fill={CLOUD} />
    </>
  )
}

function FairyScene({ accent, deeper }) {
  // Small fairy mascot with translucent wings, holding a wand.
  const SKIN = '#F4D9C4'        // warm peach skin
  const DRESS = accent          // dusty pink-lavender
  const HAIR = deeper           // deeper purple
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PURPLE} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={SAGE_DEEP} opacity={0.4} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.7} />
      <BushyTree x={60} y={108} fill={SAGE_DEEP} opacity={0.7} scale={0.85} />
      {/* Mushroom toadstool to the side */}
      <g transform="translate(540 110)">
        <rect x={-3} y={-8} width={6} height={10} fill={CLOUD} />
        <ellipse cx={0} cy={-10} rx={11} ry={6} fill={TERRACOTTA} />
        <circle cx={-4} cy={-11} r={1.4} fill={CLOUD} />
        <circle cx={3} cy={-13} r={1.2} fill={CLOUD} />
        <circle cx={5} cy={-9} r={1.2} fill={CLOUD} />
      </g>
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 175, 240, 480]} fill={SAGE_DEEP} />
      {/* Sparkles */}
      <Sparkle cx={150} cy={45} size={2.5} fill={accent} />
      <Sparkle cx={420} cy={35} size={2} fill={accent} />
      <Sparkle cx={500} cy={50} size={2.5} fill={TERRACOTTA} />
      <Sparkle cx={235} cy={80} size={1.7} fill={accent} />
      {/* Flower in foreground */}
      <line x1={210} y1={113} x2={210} y2={92} stroke={SAGE_DEEP} strokeWidth={2} />
      <circle cx={206} cy={88} r={3.5} fill={DRESS} />
      <circle cx={214} cy={88} r={3.5} fill={DRESS} />
      <circle cx={210} cy={84} r={3.5} fill={DRESS} />
      <circle cx={210} cy={92} r={3.5} fill={DRESS} />
      <circle cx={210} cy={88} r={2.5} fill={CLOUD} />
      {/* Fairy mascot */}
      <ellipse cx={345} cy={120} rx={32} ry={3} fill={COCOA} opacity={0.16} />
      {/* Wings — pair behind body */}
      <ellipse cx={325} cy={75} rx={12} ry={20} fill={CLOUD} opacity={0.7} transform="rotate(-15 325 75)" />
      <ellipse cx={365} cy={75} rx={12} ry={20} fill={CLOUD} opacity={0.7} transform="rotate(15 365 75)" />
      <ellipse cx={322} cy={92} rx={9} ry={14} fill={CLOUD} opacity={0.6} transform="rotate(-25 322 92)" />
      <ellipse cx={368} cy={92} rx={9} ry={14} fill={CLOUD} opacity={0.6} transform="rotate(25 368 92)" />
      {/* Dress */}
      <path d="M 332 92 L 358 92 L 365 117 L 325 117 Z" fill={DRESS} />
      {/* Belt */}
      <rect x={332} y={92} width={26} height={3} fill={deeper} opacity={0.5} />
      {/* Arms */}
      <ellipse cx={325} cy={92} rx={4} ry={7} fill={SKIN} transform="rotate(-30 325 92)" />
      <ellipse cx={365} cy={92} rx={4} ry={7} fill={SKIN} transform="rotate(30 365 92)" />
      {/* Wand in right hand */}
      <line x1={370} y1={95} x2={385} y2={75} stroke={SAGE_DEEP} strokeWidth={1.5} strokeLinecap="round" />
      <Sparkle cx={386} cy={73} size={3.5} fill={TERRACOTTA} />
      {/* Legs */}
      <ellipse cx={338} cy={119} rx={3} ry={3} fill={SKIN} />
      <ellipse cx={352} cy={119} rx={3} ry={3} fill={SKIN} />
      {/* Head */}
      <circle cx={345} cy={75} r={14} fill={SKIN} />
      {/* Hair */}
      <path d="M 332 70 Q 345 55 358 70 Q 360 65 357 60 Q 345 50 333 60 Q 330 65 332 70 Z" fill={HAIR} />
      <path d="M 333 75 Q 332 88 340 88" stroke={HAIR} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M 357 75 Q 358 88 350 88" stroke={HAIR} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* Face */}
      <EyeWithHighlight cx={341} cy={76} r={2} />
      <EyeWithHighlight cx={349} cy={76} r={2} />
      <circle cx={337} cy={81} r={2} fill={DRESS} opacity={0.7} />
      <circle cx={353} cy={81} r={2} fill={DRESS} opacity={0.7} />
      <path d="M 343 81 Q 345 83 347 81" stroke={COCOA} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <Cloud x={120} y={40} scale={0.5} />
    </>
  )
}

function BearScene({ accent, deeper }) {
  // Brown bear holding a honey pot; bee buzzing nearby; pine + flower.
  const BEAR = deeper             // deep cocoa
  const BEAR_LIGHT = accent       // warm tan (snout, belly)
  return (
    <>
      <rect x={0} y={0} width={600} height={75} fill={SKY_PEACH} />
      <ellipse cx={130} cy={120} rx={180} ry={55} fill={SAGE_DEEP} opacity={0.5} />
      <ellipse cx={470} cy={125} rx={200} ry={50} fill={accent} opacity={0.65} />
      <BushyTree x={60} y={100} fill={SAGE_DEEP} />
      <BushyTree x={555} y={108} fill={SAGE_DEEP} opacity={0.85} scale={0.9} />
      <ellipse cx={300} cy={148} rx={400} ry={42} fill={accent} />
      <GrassTufts positions={[40, 110, 175, 240, 410, 480, 540]} fill={SAGE_DEEP} />
      {/* Small flower */}
      <line x1={210} y1={113} x2={210} y2={98} stroke={SAGE_DEEP} strokeWidth={1.5} />
      <circle cx={210} cy={95} r={3.5} fill={TERRACOTTA} />
      <circle cx={210} cy={95} r={1.5} fill={CLOUD} />
      {/* Bee buzzing in the air */}
      <g transform="translate(440 55)">
        <ellipse cx={0} cy={0} rx={5} ry={3.5} fill={CLOUD} />
        <rect x={-3} y={-2} width={6} height={1.5} fill={COCOA} />
        <rect x={-3} y={1} width={6} height={1.5} fill={COCOA} />
        <ellipse cx={-3} cy={-3} rx={3} ry={2} fill={CLOUD} opacity={0.6} />
        <ellipse cx={3} cy={-3} rx={3} ry={2} fill={CLOUD} opacity={0.6} />
        <Eye cx={0} cy={0} r={0.6} />
      </g>
      <path d="M 430 60 Q 425 55 432 50" stroke={COCOA} strokeWidth={0.6} fill="none" strokeDasharray="1.5 1.5" opacity={0.6} />
      {/* Bear mascot */}
      <ellipse cx={345} cy={120} rx={42} ry={4} fill={COCOA} opacity={0.2} />
      {/* Body */}
      <ellipse cx={350} cy={100} rx={28} ry={20} fill={BEAR} />
      {/* Belly */}
      <ellipse cx={350} cy={107} rx={14} ry={11} fill={BEAR_LIGHT} />
      {/* Legs */}
      <rect x={335} y={114} width={7} height={8} fill={BEAR} rx={2} />
      <rect x={358} y={114} width={7} height={8} fill={BEAR} rx={2} />
      {/* Front paw holding the honey pot */}
      <ellipse cx={332} cy={108} rx={5} ry={5} fill={BEAR} />
      {/* Honey pot */}
      <path d="M 313 102 L 327 102 L 325 117 L 315 117 Z" fill={TERRACOTTA} />
      <ellipse cx={320} cy={102} rx={7} ry={2} fill={CLOUD} />
      <text x={317} y={113} fontSize="6" fontWeight="bold" fill={CLOUD}>HONEY</text>
      {/* Head */}
      <circle cx={345} cy={75} r={18} fill={BEAR} />
      {/* Inner ears */}
      <circle cx={332} cy={62} r={5} fill={BEAR} />
      <circle cx={358} cy={62} r={5} fill={BEAR} />
      <circle cx={332} cy={62} r={2.5} fill={BEAR_LIGHT} />
      <circle cx={358} cy={62} r={2.5} fill={BEAR_LIGHT} />
      {/* Snout */}
      <ellipse cx={345} cy={82} rx={9} ry={6} fill={BEAR_LIGHT} />
      <ellipse cx={345} cy={79} rx={1.8} ry={1.3} fill={COCOA} />
      <path d="M 342 84 Q 345 86 348 84" stroke={COCOA} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <EyeWithHighlight cx={339} cy={73} r={2.2} />
      <EyeWithHighlight cx={351} cy={73} r={2.2} />
      {/* Cheek */}
      <circle cx={334} cy={80} r={2.5} fill={TERRA_SOFT} opacity={0.55} />
      <circle cx={356} cy={80} r={2.5} fill={TERRA_SOFT} opacity={0.55} />
      <Cloud x={150} y={32} scale={0.55} />
      <Cloud x={500} y={28} scale={0.5} />
    </>
  )
}

const SCENES = {
  football: FootballScene,
  dinosaur: DinosaurScene,
  unicorn: UnicornScene,
  animals: AnimalsScene,
  rocket: RocketScene,
  princess: PrincessScene,
  ocean: OceanScene,
  garden: GardenScene,
  robot: RobotScene,
  magic: MagicScene,
  rugby: RugbyScene,
  train: TrainScene,
  fairy: FairyScene,
  bear: BearScene,
}

export default function ThemeScene({ themeKey, className = '' }) {
  const Scene = SCENES[themeKey] || FootballScene
  const theme = THEMES[themeKey] || THEMES.football
  return (
    <svg
      viewBox="0 0 600 125"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x={0} y={0} width={600} height={125} fill={SKY} />
      <Scene accent={theme.accent} deeper={theme.deeper} />
    </svg>
  )
}
