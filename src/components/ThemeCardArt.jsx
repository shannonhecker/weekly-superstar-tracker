import { THEMES } from '../lib/themes'

const COCOA = '#2F211D'
const CREAM = '#FFF8EC'
const WHITE = '#FFFFFF'

const ART = {
  football: { bg: '#FFF1CF', panel: '#FFE0A6', body: '#EF9741', belly: '#FFF6EA', accent: '#6F8B61', deep: '#4E6F50', blush: '#F7A58D', kind: 'tiger', prop: 'ball' },
  dinosaur: { bg: '#E4F1D6', panel: '#CFE7B7', body: '#8DBF7F', belly: '#F7F1D6', accent: '#6B9F67', deep: '#4E774B', blush: '#F4AE95', kind: 'dino', prop: 'book' },
  unicorn: { bg: '#ECE4F6', panel: '#DACBF1', body: '#FFF8F4', belly: '#F4D1E5', accent: '#D79AC6', deep: '#7A5C9C', blush: '#EAA5C9', kind: 'unicorn', prop: 'sparkle' },
  animals: { bg: '#FFEAD7', panel: '#FFD0AA', body: '#A87551', belly: '#FFF4E6', accent: '#D9784A', deep: '#6C493A', blush: '#EFA081', kind: 'bear', prop: 'book' },
  rocket: { bg: '#E2F1F7', panel: '#C8E3EF', body: '#8EAAB6', belly: '#F3FBFF', accent: '#F2B98E', deep: '#4D788B', blush: '#F4A7A0', kind: 'koala', prop: 'rocket' },
  princess: { bg: '#FDE6DF', panel: '#F8CABB', body: '#F3BDA7', belly: '#FFF7F0', accent: '#E8A04D', deep: '#8A5652', blush: '#EF8FA5', kind: 'cat', prop: 'crown' },
  ocean: { bg: '#DFF1F8', panel: '#C2E4F0', body: '#95BFCA', belly: '#E9F8FA', accent: '#6FA7B5', deep: '#467988', blush: '#F4A79A', kind: 'octopus', prop: 'wave' },
  garden: { bg: '#E9F3D7', panel: '#D6E8B6', body: '#F2BD5A', belly: '#FFF5C8', accent: '#8FB466', deep: '#5E7C46', blush: '#EE9B85', kind: 'bee', prop: 'flower' },
  robot: { bg: '#EEE9DF', panel: '#D9D3C7', body: '#B6C1C6', belly: '#F6F4EC', accent: '#E3B34E', deep: '#716B63', blush: '#EBA28B', kind: 'robot', prop: 'gear' },
  magic: { bg: '#EAE4F6', panel: '#D6C9EF', body: '#7D6FA1', belly: '#FFF2EC', accent: '#D7A8DC', deep: '#625080', blush: '#EDA0C7', kind: 'cat', prop: 'moon' },
  rugby: { bg: '#F8E5D5', panel: '#EFC4A3', body: '#C97943', belly: '#FFF3E4', accent: '#8F684E', deep: '#674633', blush: '#F0A07F', kind: 'fox', prop: 'ball' },
  train: { bg: '#EEE2D7', panel: '#D7C3B1', body: '#B08367', belly: '#FFF4E6', accent: '#8FA9B5', deep: '#705849', blush: '#EBA083', kind: 'bear', prop: 'train' },
  fairy: { bg: '#F2E3F0', panel: '#E0C5DB', body: '#F5C8B3', belly: '#FFF7ED', accent: '#9DBA74', deep: '#785A87', blush: '#EDA4C8', kind: 'unicorn', prop: 'flower' },
  bear: { bg: '#F4E1CE', panel: '#D9B797', body: '#9E7357', belly: '#FFF1DC', accent: '#D39B55', deep: '#664932', blush: '#E89A78', kind: 'bear', prop: 'book' },
  deer: { bg: '#F5EFD8', panel: '#DDD4B8', body: '#A37855', belly: '#FFF7E6', accent: '#9CB382', deep: '#5C7549', blush: '#E8A48B', kind: 'fox', prop: 'flower' },
  elephant: { bg: '#DCEAF1', panel: '#C2D8E5', body: '#A8B5BC', belly: '#F0F5F8', accent: '#8DA9B5', deep: '#5C7484', blush: '#F4B8AE', kind: 'koala', prop: 'flower' },
  fox: { bg: '#F8E5D5', panel: '#EFCDB6', body: '#D78951', belly: '#FFF5E8', accent: '#E0AB7E', deep: '#8C5A3D', blush: '#F2A488', kind: 'fox', prop: 'flower' },
}

function configFor(themeKey) {
  return ART[themeKey] || ART.animals
}

function Decor({ art }) {
  return (
    <g>
      <circle cx={264} cy={54} r={31} fill={art.accent} opacity={0.18} />
      <ellipse cx={62} cy={46} rx={20} ry={10} fill={WHITE} opacity={0.58} />
      <ellipse cx={260} cy={142} rx={38} ry={13} fill={WHITE} opacity={0.24} />
      <circle cx={72} cy={142} r={4} fill={art.accent} opacity={0.48} />
      <circle cx={93} cy={60} r={2.4} fill={art.accent} opacity={0.35} />
      <circle cx={238} cy={86} r={3} fill={WHITE} opacity={0.62} />
      <path d="M34 175 Q72 158 116 174 T206 174 T286 164 L286 220 L34 220 Z" fill={art.panel} opacity={0.46} />
      <ellipse cx={160} cy={188} rx={74} ry={10} fill={COCOA} opacity={0.12} />
    </g>
  )
}

function BannerDecor({ art }) {
  return (
    <g>
      <circle cx={760} cy={56} r={34} fill={art.accent} opacity={0.18} />
      <ellipse cx={126} cy={52} rx={28} ry={11} fill={WHITE} opacity={0.56} />
      <ellipse cx={656} cy={44} rx={20} ry={8} fill={WHITE} opacity={0.42} />
      <circle cx={306} cy={58} r={2.5} fill={art.accent} opacity={0.28} />
      <circle cx={344} cy={83} r={3.2} fill={WHITE} opacity={0.62} />
      <circle cx={608} cy={95} r={2.8} fill={WHITE} opacity={0.55} />
      <path d="M0 146 Q150 118 292 137 T598 134 T960 119 L960 220 L0 220 Z" fill={art.panel} opacity={0.42} />
      <path d="M0 170 Q174 148 348 166 T728 160 T960 146 L960 220 L0 220 Z" fill={art.accent} opacity={0.14} />
      <ellipse cx={480} cy={188} rx={76} ry={10} fill={COCOA} opacity={0.12} />
    </g>
  )
}

function Prop({ art }) {
  switch (art.prop) {
    case 'ball':
      return (
        <g transform="translate(72 154)">
          <circle cx={0} cy={0} r={18} fill={WHITE} />
          <path d="M-6 -6 L0 -11 L7 -5 L5 5 L-5 5 Z" fill={COCOA} opacity={0.78} />
          <line x1={-16} y1={0} x2={16} y2={0} stroke={COCOA} strokeWidth={1.2} opacity={0.22} />
        </g>
      )
    case 'crown':
      return (
        <g transform="translate(74 154)">
          <path d="M-22 10 L-15 -16 L0 5 L15 -16 L22 10 Z" fill={art.accent} />
          <circle cx={-15} cy={-16} r={4} fill={WHITE} opacity={0.72} />
          <circle cx={15} cy={-16} r={4} fill={WHITE} opacity={0.72} />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(74 150)">
          <rect x={-2} y={-2} width={4} height={38} rx={2} fill={art.deep} />
          <circle cx={0} cy={-15} r={8} fill={art.blush} />
          <circle cx={-10} cy={-8} r={8} fill={art.blush} />
          <circle cx={10} cy={-8} r={8} fill={art.blush} />
          <circle cx={0} cy={1} r={8} fill={art.blush} />
          <circle cx={0} cy={-7} r={6} fill={CREAM} />
        </g>
      )
    case 'gear':
      return (
        <g transform="translate(72 154)" fill={art.accent}>
          <circle cx={0} cy={0} r={17} />
          <circle cx={0} cy={0} r={8} fill={CREAM} />
          <rect x={-3} y={-27} width={6} height={10} rx={2} />
          <rect x={-3} y={17} width={6} height={10} rx={2} />
          <rect x={17} y={-3} width={10} height={6} rx={2} />
          <rect x={-27} y={-3} width={10} height={6} rx={2} />
        </g>
      )
    case 'moon':
      return <path d="M80 132 C57 134 45 164 63 181 C75 193 96 190 104 174 C82 179 67 160 80 132 Z" fill={art.accent} opacity={0.88} />
    case 'rocket':
      return (
        <g transform="translate(72 154) rotate(-20)">
          <path d="M0 -30 C18 -15 21 9 8 28 L-8 28 C-21 9 -18 -15 0 -30 Z" fill={WHITE} />
          <circle cx={0} cy={-5} r={7} fill={art.panel} />
          <path d="M-8 20 L-20 31 L-8 29 Z" fill={art.accent} />
          <path d="M8 20 L20 31 L8 29 Z" fill={art.accent} />
        </g>
      )
    case 'train':
      return (
        <g transform="translate(68 155)">
          <rect x={-24} y={-15} width={48} height={26} rx={7} fill={art.deep} />
          <rect x={-12} y={-30} width={24} height={17} rx={5} fill={CREAM} />
          <circle cx={-13} cy={15} r={7} fill={COCOA} />
          <circle cx={14} cy={15} r={7} fill={COCOA} />
        </g>
      )
    case 'wave':
      return (
        <g fill="none" stroke={art.deep} strokeWidth={4} strokeLinecap="round" opacity={0.55}>
          <path d="M42 150 Q58 137 74 150 T106 150" />
          <path d="M52 171 Q68 158 84 171 T116 171" />
        </g>
      )
    case 'book':
      return (
        <g transform="translate(72 158)">
          <path d="M-29 -18 Q-10 -25 0 -11 L0 21 Q-13 8 -29 14 Z" fill={WHITE} />
          <path d="M29 -18 Q10 -25 0 -11 L0 21 Q13 8 29 14 Z" fill={CREAM} />
          <line x1={0} y1={-11} x2={0} y2={21} stroke={art.deep} strokeWidth={1.2} opacity={0.4} />
        </g>
      )
    default:
      return (
        <g>
          <circle cx={74} cy={148} r={4} fill={art.accent} />
          <line x1={64} y1={148} x2={84} y2={148} stroke={art.accent} strokeWidth={2} strokeLinecap="round" />
          <line x1={74} y1={138} x2={74} y2={158} stroke={art.accent} strokeWidth={2} strokeLinecap="round" />
        </g>
      )
  }
}

function Eyes({ y = 88 }) {
  return (
    <g>
      <circle cx={146} cy={y} r={5.2} fill={WHITE} />
      <circle cx={174} cy={y} r={5.2} fill={WHITE} />
      <circle cx={148} cy={y + 0.4} r={2.2} fill={COCOA} />
      <circle cx={176} cy={y + 0.4} r={2.2} fill={COCOA} />
      <circle cx={149} cy={y - 1.2} r={0.8} fill={WHITE} />
      <circle cx={177} cy={y - 1.2} r={0.8} fill={WHITE} />
    </g>
  )
}

function GenericAnimal({ art }) {
  const pointed = art.kind === 'cat' || art.kind === 'fox' || art.kind === 'tiger'
  return (
    <g>
      {art.kind === 'fox' || art.kind === 'tiger' ? <path d="M188 138 Q228 124 234 153 Q214 170 187 158 Z" fill={art.body} /> : null}
      <path d="M119 129 Q160 105 201 129 L210 188 Q160 209 110 188 Z" fill={art.body} />
      <path d="M127 138 Q160 119 193 138 L198 188 Q160 201 122 188 Z" fill={art.belly} opacity={0.96} />
      <path d="M134 148 Q160 135 186 148 L190 188 Q160 198 130 188 Z" fill={art.accent} opacity={0.55} />
      <ellipse cx={123} cy={168} rx={10} ry={24} fill={art.body} transform="rotate(18 123 168)" />
      <ellipse cx={197} cy={168} rx={10} ry={24} fill={art.body} transform="rotate(-18 197 168)" />
      {pointed ? (
        <>
          <path d="M122 64 L130 35 L147 66 Z" fill={art.body} />
          <path d="M198 64 L190 35 L173 66 Z" fill={art.body} />
          <path d="M128 61 L132 47 L140 63 Z" fill={art.blush} opacity={0.55} />
          <path d="M192 61 L188 47 L180 63 Z" fill={art.blush} opacity={0.55} />
        </>
      ) : (
        <>
          <circle cx={124} cy={58} r={15} fill={art.body} />
          <circle cx={196} cy={58} r={15} fill={art.body} />
          <circle cx={124} cy={58} r={8} fill={art.belly} opacity={0.72} />
          <circle cx={196} cy={58} r={8} fill={art.belly} opacity={0.72} />
        </>
      )}
      <circle cx={160} cy={86} r={46} fill={art.body} />
      {art.kind === 'koala' ? (
        <>
          <circle cx={126} cy={57} r={18} fill={art.body} />
          <circle cx={194} cy={57} r={18} fill={art.body} />
          <circle cx={126} cy={57} r={10} fill={art.belly} opacity={0.82} />
          <circle cx={194} cy={57} r={10} fill={art.belly} opacity={0.82} />
        </>
      ) : null}
      {art.kind === 'tiger' ? (
        <g fill={art.deep} opacity={0.78}>
          <path d="M136 61 L146 70 L134 72 Z" />
          <path d="M184 61 L174 70 L186 72 Z" />
          <path d="M154 45 L160 60 L166 45 Z" />
        </g>
      ) : null}
      <Eyes />
      <circle cx={140} cy={99} r={5} fill={art.blush} opacity={0.68} />
      <circle cx={180} cy={99} r={5} fill={art.blush} opacity={0.68} />
      <ellipse cx={160} cy={103} rx={19} ry={13} fill={art.belly} opacity={0.94} />
      <ellipse cx={160} cy={98} rx={4.2} ry={3} fill={COCOA} />
      <path d="M154 106 Q160 112 166 106" stroke={COCOA} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <circle cx={142} cy={184} r={8} fill={art.body} />
      <circle cx={178} cy={184} r={8} fill={art.body} />
      {art.prop === 'crown' ? (
        <g transform="translate(160 39)">
          <path d="M-21 10 L-14 -9 L0 6 L14 -9 L21 10 Z" fill={art.accent} />
          <circle cx={-14} cy={-9} r={3.2} fill={WHITE} opacity={0.7} />
          <circle cx={14} cy={-9} r={3.2} fill={WHITE} opacity={0.7} />
        </g>
      ) : null}
    </g>
  )
}

function Dino({ art }) {
  return (
    <g>
      <path d="M195 145 Q233 134 239 158 Q218 168 193 158 Z" fill={art.body} />
      <ellipse cx={160} cy={145} rx={47} ry={43} fill={art.body} />
      <ellipse cx={156} cy={158} rx={25} ry={22} fill={art.belly} opacity={0.86} />
      <path d="M118 111 L128 96 L138 111 L149 95 L160 111 L172 96 L184 112 Z" fill={art.deep} opacity={0.72} />
      <circle cx={151} cy={82} r={38} fill={art.body} />
      <ellipse cx={127} cy={90} rx={16} ry={12} fill={art.body} />
      <Eyes y={80} />
      <circle cx={137} cy={94} r={4.8} fill={art.blush} opacity={0.62} />
      <circle cx={176} cy={94} r={4.8} fill={art.blush} opacity={0.62} />
      <circle cx={122} cy={88} r={1.4} fill={COCOA} opacity={0.75} />
      <path d="M129 99 Q139 106 149 100" stroke={COCOA} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <rect x={135} y={180} width={13} height={14} rx={5} fill={art.body} />
      <rect x={173} y={180} width={13} height={14} rx={5} fill={art.body} />
      <ellipse cx={125} cy={148} rx={8} ry={5} fill={art.body} />
    </g>
  )
}

function Unicorn({ art }) {
  return (
    <g>
      <path d="M119 129 Q160 105 201 129 L210 188 Q160 209 110 188 Z" fill={art.body} />
      <path d="M127 138 Q160 119 193 138 L198 188 Q160 201 122 188 Z" fill={art.belly} opacity={0.96} />
      <path d="M132 148 Q160 134 188 148 L191 188 Q160 198 129 188 Z" fill={art.accent} opacity={0.5} />
      <path d="M122 64 L132 43 L146 67 Z" fill={art.body} />
      <path d="M198 64 L188 43 L174 67 Z" fill={art.body} />
      <path d="M160 49 L168 22 L176 52 Z" fill={CREAM} />
      <line x1={164} y1={41} x2={173} y2={35} stroke={art.accent} strokeWidth={1.3} />
      <circle cx={160} cy={86} r={46} fill={art.body} />
      <path d="M128 63 Q146 36 165 58 Q147 67 132 83 Z" fill={art.accent} opacity={0.9} />
      <path d="M174 58 Q193 42 200 70 Q190 84 176 81 Z" fill={art.deep} opacity={0.65} />
      <Eyes />
      <circle cx={140} cy={99} r={5} fill={art.blush} opacity={0.68} />
      <circle cx={180} cy={99} r={5} fill={art.blush} opacity={0.68} />
      <ellipse cx={160} cy={102} rx={4.2} ry={3} fill={COCOA} />
      <path d="M154 109 Q160 114 166 109" stroke={COCOA} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <circle cx={142} cy={184} r={8} fill={art.body} />
      <circle cx={178} cy={184} r={8} fill={art.body} />
    </g>
  )
}

function Octopus({ art }) {
  return (
    <g>
      <ellipse cx={160} cy={105} rx={48} ry={55} fill={art.body} />
      <circle cx={132} cy={157} r={13} fill={art.body} />
      <circle cx={151} cy={163} r={13} fill={art.body} />
      <circle cx={171} cy={163} r={13} fill={art.body} />
      <circle cx={190} cy={157} r={13} fill={art.body} />
      <ellipse cx={143} cy={78} rx={15} ry={7} fill={WHITE} opacity={0.35} />
      <Eyes y={96} />
      <circle cx={139} cy={111} r={5} fill={art.blush} opacity={0.7} />
      <circle cx={181} cy={111} r={5} fill={art.blush} opacity={0.7} />
      <path d="M151 120 Q160 126 169 120" stroke={COCOA} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <circle cx={196} cy={69} r={7} fill={WHITE} opacity={0.72} />
      <circle cx={213} cy={91} r={4} fill={WHITE} opacity={0.62} />
    </g>
  )
}

function Bee({ art }) {
  return (
    <g>
      <ellipse cx={132} cy={103} rx={24} ry={34} fill={WHITE} opacity={0.62} transform="rotate(-22 132 103)" />
      <ellipse cx={188} cy={103} rx={24} ry={34} fill={WHITE} opacity={0.62} transform="rotate(22 188 103)" />
      <ellipse cx={160} cy={132} rx={44} ry={58} fill={art.body} />
      <path d="M123 115 Q160 130 197 115" stroke={COCOA} strokeWidth={7} opacity={0.55} />
      <path d="M121 142 Q160 157 199 142" stroke={COCOA} strokeWidth={7} opacity={0.55} />
      <circle cx={160} cy={78} r={36} fill={art.body} />
      <line x1={145} y1={49} x2={137} y2={34} stroke={COCOA} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={175} y1={49} x2={183} y2={34} stroke={COCOA} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={136} cy={33} r={4} fill={COCOA} />
      <circle cx={184} cy={33} r={4} fill={COCOA} />
      <Eyes y={78} />
      <circle cx={141} cy={91} r={5} fill={art.blush} opacity={0.72} />
      <circle cx={179} cy={91} r={5} fill={art.blush} opacity={0.72} />
      <path d="M153 98 Q160 104 167 98" stroke={COCOA} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>
  )
}

function Robot({ art }) {
  return (
    <g>
      <rect x={119} y={122} width={82} height={65} rx={18} fill={art.body} />
      <rect x={130} y={137} width={60} height={31} rx={11} fill={art.belly} opacity={0.76} />
      <rect x={111} y={56} width={98} height={76} rx={22} fill={art.body} />
      <line x1={160} y1={56} x2={160} y2={35} stroke={COCOA} strokeWidth={3} strokeLinecap="round" />
      <circle cx={160} cy={30} r={6} fill={art.accent} />
      <circle cx={143} cy={91} r={6} fill={WHITE} />
      <circle cx={177} cy={91} r={6} fill={WHITE} />
      <circle cx={144} cy={91} r={2.4} fill={COCOA} />
      <circle cx={178} cy={91} r={2.4} fill={COCOA} />
      <path d="M145 111 Q160 119 175 111" stroke={COCOA} strokeWidth={2} fill="none" strokeLinecap="round" />
      <circle cx={128} cy={106} r={5} fill={art.blush} opacity={0.64} />
      <circle cx={192} cy={106} r={5} fill={art.blush} opacity={0.64} />
      <ellipse cx={111} cy={154} rx={10} ry={22} fill={art.body} />
      <ellipse cx={209} cy={154} rx={10} ry={22} fill={art.body} />
    </g>
  )
}

function Mascot({ art }) {
  if (art.kind === 'dino') return <Dino art={art} />
  if (art.kind === 'unicorn') return <Unicorn art={art} />
  if (art.kind === 'octopus') return <Octopus art={art} />
  if (art.kind === 'bee') return <Bee art={art} />
  if (art.kind === 'robot') return <Robot art={art} />
  return <GenericAnimal art={art} />
}

export default function ThemeCardArt({
  themeKey = 'animals',
  className = '',
  height,
  layout = 'card',
  animated = true,
}) {
  const art = configFor(themeKey)
  const label = (THEMES[themeKey] || THEMES.animals || THEMES.football)?.label || 'Animal'
  const isBanner = layout === 'banner'
  const width = isBanner ? 960 : 320
  const mascotArt = isBanner ? (
    <g transform="translate(320 0)">
      <g className={animated ? 'theme-card-mascot-float' : undefined}>
        <Prop art={art} />
        <Mascot art={art} />
      </g>
    </g>
  ) : (
    <>
      <Prop art={art} />
      <Mascot art={art} />
    </>
  )
  return (
    <svg
      viewBox={`0 0 ${width} 220`}
      role="img"
      aria-label={`${label} mascot ${isBanner ? 'banner' : 'card'}`}
      preserveAspectRatio={isBanner ? 'xMidYMid slice' : 'xMidYMid meet'}
      className={[
        className,
        isBanner ? 'theme-card-art-banner' : 'theme-card-art-card',
        animated && isBanner ? 'theme-card-art-animated' : '',
      ].filter(Boolean).join(' ')}
      style={{ width: '100%', height: height ?? 'auto', display: 'block' }}
    >
      <rect x={0} y={0} width={width} height={220} rx={isBanner ? 26 : 30} fill={art.bg} />
      {isBanner ? <BannerDecor art={art} /> : <Decor art={art} />}
      {mascotArt}
      <g className={animated && isBanner ? 'theme-card-sparkle-twinkle' : undefined} opacity={0.42}>
        {isBanner ? (
          <>
            <polygon points="768,42 772,50 781,52 774,58 776,67 768,62 760,67 762,58 755,52 764,50" fill={WHITE} />
            <circle cx={820} cy={108} r={3} fill={WHITE} />
            <circle cx={102} cy={96} r={3.5} fill={WHITE} />
          </>
        ) : (
          <>
            <polygon points="260,42 264,50 273,52 266,58 268,67 260,62 252,67 254,58 247,52 256,50" fill={WHITE} />
            <circle cx={279} cy={99} r={3} fill={WHITE} />
            <circle cx={43} cy={95} r={3.5} fill={WHITE} />
          </>
        )}
      </g>
    </svg>
  )
}
