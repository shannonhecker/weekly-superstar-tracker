// EmptyStateScene — flat-art hero illustrations for empty/onboarding states.
// Same art language as ThemeScene: no outlines, no gradients, rounded
// silhouettes, eye-dots-only faces, layered earthy-palette scenery.
//
// Variants:
//   'no-kids'   — Board.jsx empty state (no superstars yet)
//   'welcome'   — Landing.jsx hero
//   'joining'   — Join.jsx joining-the-board moment
//   'no-weeks'  — PetGallery empty pet-history
//
// All variants render into a 600x300 viewBox so they scale cleanly to
// whatever container they sit in.

const SAGE = '#9DAC85'         // earthy.sage
const SAGE_DEEP = '#6B8060'    // earthy.sageDeep
const TERRACOTTA = '#D87C4A'   // earthy.terracotta
const TERRA_SOFT = '#F4C8A8'   // earthy.terracottaSoft
const COCOA = '#5A3A2E'        // earthy.cocoa
const COCOA_SOFT = '#8B6651'   // earthy.cocoaSoft
const CREAM = '#F8F1E4'        // earthy.cream
const IVORY = '#FFFAF0'        // earthy.ivory

function Eye({ cx, cy, r = 4 }) {
  return <circle cx={cx} cy={cy} r={r} fill={COCOA} />
}

function Cloud({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={0} rx={30} ry={14} fill={CREAM} />
      <ellipse cx={-20} cy={3} rx={15} ry={11} fill={CREAM} />
      <ellipse cx={20} cy={3} rx={15} ry={11} fill={CREAM} />
    </g>
  )
}

function PineTree({ x, y, scale = 1, fill = SAGE_DEEP }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -18 0 L 0 -50 L 18 0 Z" fill={fill} />
      <path d="M -22 8 L 0 -38 L 22 8 Z" fill={fill} opacity={0.85} />
    </g>
  )
}

function LollipopTree({ x, y, scale = 1, leaf = SAGE }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-3} y={-15} width={6} height={30} fill={COCOA} rx={1.5} />
      <circle cx={0} cy={-30} r={22} fill={leaf} />
    </g>
  )
}

function Mountain({ x, y, w, h, fill }) {
  return <path d={`M ${x} ${y} L ${x + w / 2} ${y - h} L ${x + w} ${y} Z`} fill={fill} />
}

// --- variants ----------------------------------------------------------------

function NoKidsScene() {
  return (
    <>
      {/* Sky */}
      <rect x={0} y={0} width={600} height={300} fill={IVORY} />
      {/* Distant mountain */}
      <Mountain x={120} y={210} w={220} h={110} fill={SAGE_DEEP} />
      <Mountain x={290} y={210} w={260} h={130} fill={SAGE} />
      {/* Hills */}
      <ellipse cx={150} cy={290} rx={280} ry={75} fill={SAGE_DEEP} />
      <ellipse cx={500} cy={295} rx={250} ry={70} fill={SAGE} />
      {/* Trees */}
      <PineTree x={70} y={230} scale={1.3} fill={SAGE_DEEP} />
      <PineTree x={530} y={245} scale={1} fill={SAGE_DEEP} />
      <LollipopTree x={460} y={235} scale={0.9} leaf={SAGE} />
      <LollipopTree x={130} y={250} scale={0.7} leaf={SAGE_DEEP} />
      {/* Clouds */}
      <Cloud x={140} y={70} scale={1} />
      <Cloud x={460} y={50} scale={0.85} />
      {/* Sun */}
      <circle cx={300} cy={90} r={30} fill={TERRA_SOFT} />
      {/* Empty signpost */}
      <rect x={285} y={210} width={4} height={40} fill={COCOA} />
      <rect x={265} y={195} width={44} height={20} rx={4} fill={CREAM} />
      <rect x={265} y={195} width={44} height={20} rx={4} fill="none" stroke={COCOA} strokeWidth={1.5} />
    </>
  )
}

function WelcomeScene() {
  return (
    <>
      <rect x={0} y={0} width={600} height={300} fill={IVORY} />
      {/* Soft sun */}
      <circle cx={300} cy={110} r={50} fill={TERRA_SOFT} />
      {/* Mountain layers */}
      <Mountain x={50} y={220} w={200} h={100} fill={SAGE_DEEP} />
      <Mountain x={200} y={220} w={260} h={130} fill={SAGE} />
      <Mountain x={400} y={220} w={200} h={90} fill={SAGE_DEEP} />
      {/* Hills */}
      <ellipse cx={200} cy={290} rx={300} ry={70} fill={SAGE_DEEP} />
      <ellipse cx={500} cy={300} rx={300} ry={75} fill={SAGE} />
      {/* Family of three star characters in the center */}
      <g transform="translate(220 200)">
        <ellipse cx={0} cy={20} rx={20} ry={8} fill={COCOA} opacity={0.15} />
        <circle cx={0} cy={0} r={22} fill={TERRACOTTA} />
        <Eye cx={-7} cy={-2} r={3} />
        <Eye cx={7} cy={-2} r={3} />
        {/* blush */}
        <circle cx={-12} cy={6} r={3} fill={CREAM} opacity={0.6} />
        <circle cx={12} cy={6} r={3} fill={CREAM} opacity={0.6} />
      </g>
      <g transform="translate(300 195)">
        <ellipse cx={0} cy={28} rx={26} ry={9} fill={COCOA} opacity={0.15} />
        <circle cx={0} cy={0} r={28} fill={SAGE_DEEP} />
        <Eye cx={-9} cy={-2} r={3.5} />
        <Eye cx={9} cy={-2} r={3.5} />
        <circle cx={-14} cy={7} r={3.5} fill={CREAM} opacity={0.6} />
        <circle cx={14} cy={7} r={3.5} fill={CREAM} opacity={0.6} />
      </g>
      <g transform="translate(380 205)">
        <ellipse cx={0} cy={18} rx={18} ry={7} fill={COCOA} opacity={0.15} />
        <circle cx={0} cy={0} r={20} fill="#D4B5C4" />
        <Eye cx={-6} cy={-2} r={2.8} />
        <Eye cx={6} cy={-2} r={2.8} />
        <circle cx={-11} cy={5} r={2.8} fill={CREAM} opacity={0.6} />
        <circle cx={11} cy={5} r={2.8} fill={CREAM} opacity={0.6} />
      </g>
      {/* Trees flanking */}
      <PineTree x={70} y={250} scale={1.2} fill={SAGE_DEEP} />
      <LollipopTree x={530} y={250} scale={1.1} leaf={SAGE} />
      <PineTree x={500} y={265} scale={0.7} fill={SAGE_DEEP} />
      {/* Clouds */}
      <Cloud x={120} y={50} scale={0.9} />
      <Cloud x={490} y={45} scale={0.8} />
      {/* Sparkles */}
      <circle cx={240} cy={80} r={3} fill={TERRACOTTA} />
      <circle cx={360} cy={70} r={3} fill={TERRACOTTA} />
      <circle cx={420} cy={120} r={2.5} fill={TERRACOTTA} />
      <circle cx={170} cy={130} r={2.5} fill={TERRACOTTA} />
    </>
  )
}

function JoiningScene() {
  return (
    <>
      <rect x={0} y={0} width={600} height={300} fill={IVORY} />
      {/* Path leading inward */}
      <path d="M 200 300 Q 300 220 400 300 Z" fill={CREAM} />
      <path d="M 220 300 Q 300 240 380 300 Z" fill={TERRA_SOFT} opacity={0.5} />
      {/* Hills */}
      <ellipse cx={120} cy={290} rx={200} ry={60} fill={SAGE_DEEP} />
      <ellipse cx={500} cy={295} rx={220} ry={65} fill={SAGE} />
      {/* House silhouette in the distance — the "destination" */}
      <g transform="translate(280 175)">
        <rect x={-25} y={0} width={50} height={45} fill={CREAM} />
        <path d="M -30 0 L 0 -25 L 30 0 Z" fill={TERRACOTTA} />
        <rect x={-7} y={20} width={14} height={25} fill={COCOA} rx={2} />
        <rect x={-18} y={8} width={10} height={10} fill={SAGE} />
        <rect x={8} y={8} width={10} height={10} fill={SAGE} />
      </g>
      {/* Two characters approaching */}
      <g transform="translate(190 240)">
        <circle cx={0} cy={0} r={18} fill={SAGE_DEEP} />
        <Eye cx={-5} cy={-2} r={2.5} />
        <Eye cx={5} cy={-2} r={2.5} />
      </g>
      <g transform="translate(420 245)">
        <circle cx={0} cy={0} r={18} fill={TERRACOTTA} />
        <Eye cx={-5} cy={-2} r={2.5} />
        <Eye cx={5} cy={-2} r={2.5} />
      </g>
      {/* Trees */}
      <PineTree x={80} y={250} scale={1.1} fill={SAGE_DEEP} />
      <LollipopTree x={510} y={250} scale={0.9} leaf={SAGE} />
      {/* Sun + clouds */}
      <circle cx={500} cy={80} r={26} fill={TERRA_SOFT} />
      <Cloud x={150} y={70} scale={0.8} />
      <Cloud x={350} y={50} scale={0.7} />
    </>
  )
}

function NoWeeksScene() {
  return (
    <>
      <rect x={0} y={0} width={600} height={300} fill={IVORY} />
      {/* Open book / scroll motif */}
      <ellipse cx={300} cy={260} rx={220} ry={30} fill={SAGE_DEEP} opacity={0.2} />
      <rect x={180} y={130} width={240} height={140} rx={10} fill={CREAM} />
      <rect x={180} y={130} width={240} height={140} rx={10} fill="none" stroke={COCOA} strokeWidth={2} />
      <line x1={300} y1={140} x2={300} y2={260} stroke={COCOA} strokeWidth={1.5} />
      {/* Soft empty pages dots */}
      <circle cx={240} cy={180} r={4} fill={SAGE} />
      <circle cx={260} cy={210} r={4} fill={TERRA_SOFT} />
      <circle cx={240} cy={240} r={4} fill={SAGE_DEEP} opacity={0.5} />
      <circle cx={350} cy={180} r={4} fill={SAGE_DEEP} opacity={0.5} />
      <circle cx={370} cy={210} r={4} fill={SAGE} />
      <circle cx={350} cy={240} r={4} fill={TERRA_SOFT} />
      {/* Bookmark */}
      <rect x={395} y={130} width={12} height={50} fill={TERRACOTTA} />
      <path d="M 395 180 L 401 172 L 407 180 Z" fill={TERRACOTTA} />
      {/* Hills */}
      <ellipse cx={120} cy={295} rx={180} ry={45} fill={SAGE} />
      <ellipse cx={520} cy={300} rx={180} ry={45} fill={SAGE_DEEP} />
    </>
  )
}

const VARIANTS = {
  'no-kids': NoKidsScene,
  welcome: WelcomeScene,
  joining: JoiningScene,
  'no-weeks': NoWeeksScene,
}

export default function EmptyStateScene({ variant = 'no-kids', className = '', height }) {
  const Scene = VARIANTS[variant] || NoKidsScene
  return (
    <svg
      viewBox="0 0 600 300"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className={className}
      style={{ width: '100%', height: height ?? 'auto', display: 'block' }}
    >
      <Scene />
    </svg>
  )
}
