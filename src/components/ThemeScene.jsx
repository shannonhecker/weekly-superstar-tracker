// ThemeScene — flat, rounded illustrated banner per kid theme.
// Style references: Reference A (Indonesian-style earthy mood board) and
// Reference B (Learning Animals app). Common art language:
//   - Flat shapes, no outlines, no gradients
//   - Rounded silhouettes (hills, clouds, trees)
//   - Faces are eye-dots only (no smiles, no detail)
//   - Layered scenery: deeper-tone background hills + accent midground +
//     small cream/cocoa foreground accents
//   - Lots of breathing room
//
// Each scene uses the theme's `accent` (light) + `deeper` (dark) plus the
// shared earthy palette neutrals. Renders into a 600x120 viewBox so the
// banner stretches across the active-kid card top.
import { THEMES } from '../lib/themes'

const SKY = '#FFFAF0'      // earthy.ivory
const CLOUD = '#F8F1E4'    // earthy.cream
const COCOA = '#5A3A2E'    // earthy.cocoa (eye-dots, tiny accents only)

function Eye({ cx, cy, r = 2 }) {
  return <circle cx={cx} cy={cy} r={r} fill={COCOA} />
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

function Hill({ cx, cy, rx, ry, fill }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
}

// --- per-theme scene compositions -------------------------------------------

function FootballScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={120} cy={140} rx={180} ry={50} fill={deeper} />
      <Hill cx={460} cy={150} rx={220} ry={55} fill={accent} />
      {/* Goalpost */}
      <rect x={80} y={70} width={2} height={30} fill={CLOUD} />
      <rect x={130} y={70} width={2} height={30} fill={CLOUD} />
      <rect x={80} y={70} width={52} height={2} fill={CLOUD} />
      {/* Ball */}
      <circle cx={500} cy={92} r={9} fill={CLOUD} />
      <Eye cx={497} cy={89} r={1.5} />
      <Eye cx={503} cy={89} r={1.5} />
      <Cloud x={300} y={28} scale={0.7} />
    </>
  )
}

function DinosaurScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={500} cy={150} rx={200} ry={60} fill={deeper} />
      {/* Volcano */}
      <path d="M 60 105 L 105 50 L 150 105 Z" fill={deeper} />
      <ellipse cx={105} cy={50} rx={12} ry={6} fill={accent} />
      {/* Palm fronds */}
      <rect x={210} y={70} width={3} height={35} fill={COCOA} />
      <ellipse cx={205} cy={68} rx={14} ry={5} fill={accent} transform="rotate(-25 205 68)" />
      <ellipse cx={218} cy={68} rx={14} ry={5} fill={accent} transform="rotate(25 218 68)" />
      {/* Dino back-and-tail silhouette */}
      <path d="M 360 105 Q 380 80 410 85 Q 430 75 450 85 Q 470 90 480 105 Z" fill={accent} />
      <Eye cx={460} cy={90} />
    </>
  )
}

function UnicornScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={140} cy={150} rx={210} ry={60} fill={deeper} />
      <Hill cx={480} cy={160} rx={200} ry={55} fill={accent} />
      {/* Rainbow arc */}
      <path d="M 250 105 A 90 90 0 0 1 430 105" stroke={deeper} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 260 105 A 80 80 0 0 1 420 105" stroke={accent} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 270 105 A 70 70 0 0 1 410 105" stroke={CLOUD} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Cloud x={90} y={40} scale={0.8} />
      <Cloud x={520} y={35} scale={0.7} />
      {/* Sparkles */}
      <circle cx={170} cy={70} r={2} fill={COCOA} />
      <circle cx={500} cy={75} r={2} fill={COCOA} />
    </>
  )
}

function AnimalsScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={200} cy={150} rx={250} ry={60} fill={deeper} />
      <Hill cx={500} cy={155} rx={200} ry={55} fill={accent} />
      {/* Trees — triangle pines */}
      <path d="M 90 105 L 105 60 L 120 105 Z" fill={deeper} />
      <path d="M 95 105 L 110 70 L 125 105 Z" fill={accent} />
      <path d="M 540 105 L 555 65 L 570 105 Z" fill={deeper} />
      {/* Critter */}
      <ellipse cx={350} cy={95} rx={22} ry={16} fill={accent} />
      <circle cx={335} cy={82} r={6} fill={accent} />
      <circle cx={365} cy={82} r={6} fill={accent} />
      <Eye cx={345} cy={92} />
      <Eye cx={355} cy={92} />
      <Cloud x={420} y={30} scale={0.6} />
    </>
  )
}

function RocketScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={300} cy={155} rx={320} ry={50} fill={deeper} />
      {/* Planet with ring */}
      <ellipse cx={120} cy={70} rx={28} ry={5} fill={deeper} opacity={0.6} />
      <circle cx={120} cy={70} r={20} fill={accent} />
      {/* Rocket */}
      <path d="M 460 100 Q 470 60 480 60 Q 490 60 500 100 Z" fill={accent} />
      <circle cx={480} cy={75} r={4} fill={CLOUD} />
      <path d="M 460 100 L 455 110 L 465 105 Z" fill={deeper} />
      <path d="M 500 100 L 505 110 L 495 105 Z" fill={deeper} />
      {/* Stars */}
      <circle cx={250} cy={50} r={2} fill={COCOA} />
      <circle cx={350} cy={35} r={2} fill={COCOA} />
      <circle cx={550} cy={45} r={2} fill={COCOA} />
    </>
  )
}

function PrincessScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={300} cy={155} rx={340} ry={55} fill={deeper} />
      {/* Castle */}
      <rect x={250} y={70} width={100} height={45} fill={accent} />
      <rect x={245} y={55} width={20} height={60} fill={accent} />
      <rect x={335} y={55} width={20} height={60} fill={accent} />
      <rect x={290} y={45} width={20} height={70} fill={accent} />
      <path d="M 245 55 L 255 40 L 265 55 Z" fill={deeper} />
      <path d="M 335 55 L 345 40 L 355 55 Z" fill={deeper} />
      <path d="M 290 45 L 300 28 L 310 45 Z" fill={deeper} />
      <rect x={295} y={85} width={10} height={30} fill={CLOUD} />
      <Cloud x={120} y={45} scale={0.8} />
      <Cloud x={490} y={50} scale={0.7} />
    </>
  )
}

function OceanScene({ accent, deeper }) {
  return (
    <>
      {/* Sun */}
      <circle cx={490} cy={55} r={22} fill={accent} />
      {/* Wave layers */}
      <path d="M 0 105 Q 80 85 160 105 T 320 105 T 480 105 T 640 105 L 640 200 L 0 200 Z" fill={accent} />
      <path d="M 0 130 Q 80 110 160 130 T 320 130 T 480 130 T 640 130 L 640 200 L 0 200 Z" fill={deeper} />
      {/* Boat */}
      <path d="M 200 95 L 270 95 L 255 110 L 215 110 Z" fill={CLOUD} />
      <rect x={233} y={70} width={3} height={25} fill={COCOA} />
      <path d="M 236 70 L 256 92 L 236 92 Z" fill={CLOUD} />
      <Cloud x={90} y={40} scale={0.7} />
    </>
  )
}

function GardenScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={150} cy={150} rx={220} ry={60} fill={deeper} />
      <Hill cx={490} cy={155} rx={220} ry={55} fill={accent} />
      {/* Flower stems */}
      <line x1={80} y1={110} x2={80} y2={75} stroke={deeper} strokeWidth={2} />
      <circle cx={80} cy={70} r={7} fill={accent} />
      <circle cx={80} cy={70} r={3} fill={CLOUD} />
      <line x1={110} y1={110} x2={110} y2={80} stroke={deeper} strokeWidth={2} />
      <circle cx={110} cy={75} r={6} fill="#D87C4A" />
      <circle cx={110} cy={75} r={2.5} fill={CLOUD} />
      {/* Butterfly */}
      <ellipse cx={420} cy={70} rx={6} ry={9} fill={accent} transform="rotate(-25 420 70)" />
      <ellipse cx={432} cy={70} rx={6} ry={9} fill={accent} transform="rotate(25 432 70)" />
      <line x1={420} y1={70} x2={432} y2={70} stroke={COCOA} strokeWidth={1.5} />
      <Cloud x={300} y={30} scale={0.7} />
    </>
  )
}

function RobotScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={300} cy={155} rx={340} ry={55} fill={deeper} />
      {/* Robot body */}
      <rect x={260} y={55} width={80} height={60} rx={8} fill={accent} />
      <rect x={285} y={35} width={30} height={20} rx={4} fill={accent} />
      <Eye cx={290} cy={75} r={3} />
      <Eye cx={310} cy={75} r={3} />
      <rect x={290} y={90} width={20} height={3} rx={1.5} fill={COCOA} />
      <rect x={245} y={70} width={15} height={3} fill={accent} />
      <rect x={340} y={70} width={15} height={3} fill={accent} />
      {/* Gears */}
      <circle cx={120} cy={75} r={14} fill={deeper} />
      <circle cx={120} cy={75} r={6} fill={CLOUD} />
      <circle cx={500} cy={80} r={10} fill={accent} />
      <circle cx={500} cy={80} r={4} fill={CLOUD} />
    </>
  )
}

function MagicScene({ accent, deeper }) {
  return (
    <>
      <Hill cx={150} cy={155} rx={220} ry={60} fill={deeper} />
      <Hill cx={500} cy={160} rx={220} ry={55} fill={accent} />
      {/* Moon */}
      <circle cx={500} cy={55} r={22} fill={CLOUD} />
      <circle cx={510} cy={50} r={18} fill={accent} />
      {/* Mountain silhouette */}
      <path d="M 60 110 L 130 50 L 200 110 Z" fill={deeper} />
      <path d="M 130 110 L 180 65 L 230 110 Z" fill={accent} />
      {/* Sparkles */}
      <circle cx={300} cy={45} r={2.5} fill={COCOA} />
      <circle cx={350} cy={70} r={2} fill={COCOA} />
      <circle cx={400} cy={40} r={2.5} fill={COCOA} />
      <circle cx={250} cy={75} r={2} fill={COCOA} />
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
}

export default function ThemeScene({ themeKey, className = '' }) {
  const Scene = SCENES[themeKey] || FootballScene
  const theme = THEMES[themeKey] || THEMES.football
  return (
    <svg
      viewBox="0 0 600 120"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x={0} y={0} width={600} height={120} fill={SKY} />
      <Scene accent={theme.accent} deeper={theme.deeper} />
    </svg>
  )
}
