import type { Block } from './types'
import SimulatedTitle from './SimulatedTitle'

/* ------------------------------------------------------------------ */
/*  SimulatedButton                                                    */
/* ------------------------------------------------------------------ */

const BUTTON_CLASSES: Record<string, string> = {
  primary:   'text-white',
  secondary: '',
  outline:   'bg-transparent',
  ghost:     'bg-transparent',
}

function SimulatedButton({ variant, label }: { variant: string; label: string }) {
  const v = BUTTON_CLASSES[variant] !== undefined ? variant : 'primary'

  return (
    <button
      className={`font-bold rounded-lg transition-colors ${BUTTON_CLASSES[v]}`}
      style={{
        padding: 'var(--dh-py) var(--dh-px)',
        fontSize: 'var(--dh-font-size)',
        borderRadius: 'var(--dh-radius)',
        ...(v === 'primary' && {
          backgroundColor: 'var(--dh-accent)',
          border: '2px solid var(--dh-accent)',
        }),
        ...(v === 'secondary' && {
          backgroundColor: 'var(--dh-secondary)',
          color: 'var(--dh-text)',
          border: '2px solid var(--dh-border)',
        }),
        ...(v === 'outline' && {
          border: '2px solid var(--dh-accent)',
          color: 'var(--dh-accent)',
        }),
        ...(v === 'ghost' && {
          border: '2px solid transparent',
          color: 'var(--dh-accent)',
        }),
      }}
    >
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  SimulatedInput                                                     */
/* ------------------------------------------------------------------ */

function SimulatedInput({ placeholder, label }: { placeholder: string; label: string }) {
  return (
    <div style={{ width: '100%' }}>
      <label
        style={{
          display: 'block',
          marginBottom: 4,
          fontWeight: 600,
          fontSize: 'var(--dh-font-size)',
          color: 'var(--dh-text-secondary)',
        }}
      >
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        readOnly
        style={{
          width: '100%',
          padding: 'var(--dh-py) var(--dh-px)',
          fontSize: 'var(--dh-font-size)',
          borderRadius: 'var(--dh-radius)',
          border: '2px solid var(--dh-input-border)',
          backgroundColor: 'var(--dh-input-bg)',
          color: 'var(--dh-text)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SimulatedAlert                                                     */
/* ------------------------------------------------------------------ */

const ALERT_TOKENS: Record<string, { bg: string; border: string; icon: string }> = {
  info:    { bg: '#EFF6FF', border: '#93C5FD', icon: 'ℹ️' },
  success: { bg: '#F0FDF4', border: '#86EFAC', icon: '✅' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '⚠️' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '❌' },
}

const ALERT_TOKENS_DARK: Record<string, { bg: string; border: string }> = {
  info:    { bg: '#1E293B', border: '#3B82F6' },
  success: { bg: '#14291D', border: '#22C55E' },
  warning: { bg: '#292211', border: '#EAB308' },
  error:   { bg: '#2D1515', border: '#EF4444' },
}

function SimulatedAlert({ variant, message }: { variant: string; message: string }) {
  const v = ALERT_TOKENS[variant] ? variant : 'info'
  const light = ALERT_TOKENS[v]

  return (
    <div
      className="dh-alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: 'var(--dh-py) var(--dh-px)',
        borderRadius: 'var(--dh-radius)',
        fontSize: 'var(--dh-font-size)',
        border: `1px solid ${light.border}`,
        backgroundColor: light.bg,
        color: 'var(--dh-text)',
      }}
      data-variant={v}
    >
      <span style={{ flexShrink: 0 }}>{light.icon}</span>
      <span style={{ fontWeight: 600 }}>{message}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

const RENDERERS: Record<string, React.FC<Record<string, string>>> = {
  SimulatedButton: SimulatedButton as React.FC<Record<string, string>>,
  SimulatedTitle:  SimulatedTitle  as React.FC<Record<string, string>>,
  SimulatedInput:  SimulatedInput  as React.FC<Record<string, string>>,
  SimulatedAlert:  SimulatedAlert  as React.FC<Record<string, string>>,
}

export { ALERT_TOKENS_DARK }

export default function BlockRenderer({ block }: { block: Block }) {
  const Component = RENDERERS[block.type]
  if (!Component) return <div style={{ color: '#EF4444', fontSize: 13 }}>Unknown: {block.type}</div>
  return <Component {...block.props} />
}
