import './SimulatedTitle.css'

type DesignSystem = 'salt' | 'm3' | 'fluent'
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

interface SimulatedTitleProps {
  system: string
  level: string
  text: string
}

const PREFIX_MAP: Record<DesignSystem, string> = {
  salt:   's',
  m3:     'm3',
  fluent: 'f',
}

const VALID_LEVELS: Set<string> = new Set(['h1', 'h2', 'h3', 'h4'])
const VALID_SYSTEMS: Set<string> = new Set(['salt', 'm3', 'fluent'])

const SYSTEM_LABEL: Record<DesignSystem, string> = {
  salt:   'Salt',
  m3:     'Material 3',
  fluent: 'Fluent',
}

export default function SimulatedTitle({ system, level, text }: SimulatedTitleProps) {
  const sys = (VALID_SYSTEMS.has(system) ? system : 'salt') as DesignSystem
  const lvl = (VALID_LEVELS.has(level) ? level : 'h2') as HeadingLevel
  const prefix = PREFIX_MAP[sys]
  const Tag = lvl

  return (
    <div>
      <Tag className={`${prefix}-title ${prefix}-title-${lvl}`}>
        {text}
      </Tag>
      <span
        style={{
          display: 'inline-block',
          marginTop: 6,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          opacity: 0.6,
        }}
      >
        {SYSTEM_LABEL[sys]} &middot; {lvl.toUpperCase()}
      </span>
    </div>
  )
}
