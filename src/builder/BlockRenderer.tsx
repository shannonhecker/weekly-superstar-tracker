import type { Block } from './types'

const BUTTON_STYLES: Record<string, string> = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const ALERT_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'ℹ️' },
  success: { bg: 'bg-green-50', border: 'border-green-300', icon: '✅' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', icon: '⚠️' },
  error: { bg: 'bg-red-50', border: 'border-red-300', icon: '❌' },
}

function SimulatedButton({ variant, label }: { variant: string; label: string }) {
  return (
    <button
      className={`px-5 py-2.5 rounded-lg font-bold text-sm ${BUTTON_STYLES[variant] || BUTTON_STYLES.primary}`}
    >
      {label}
    </button>
  )
}

function SimulatedTitle({ level, text }: { level: string; text: string }) {
  const sizes: Record<string, string> = {
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    h4: 'text-lg',
  }
  const Tag = level as keyof JSX.IntrinsicElements
  return <Tag className={`${sizes[level] || sizes.h2} font-bold text-gray-800`}>{text}</Tag>
}

function SimulatedTextInput({ placeholder, label }: { placeholder: string; label: string }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm outline-none focus:border-purple-400"
        readOnly
      />
    </div>
  )
}

function SimulatedAlert({ variant, message }: { variant: string; message: string }) {
  const style = ALERT_STYLES[variant] || ALERT_STYLES.info
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border ${style.bg} ${style.border}`}>
      <span className="text-base mt-0.5">{style.icon}</span>
      <span className="text-sm font-semibold text-gray-700">{message}</span>
    </div>
  )
}

const RENDERERS: Record<string, React.FC<Record<string, string>>> = {
  SimulatedButton: SimulatedButton as React.FC<Record<string, string>>,
  SimulatedTitle: SimulatedTitle as React.FC<Record<string, string>>,
  SimulatedTextInput: SimulatedTextInput as React.FC<Record<string, string>>,
  SimulatedAlert: SimulatedAlert as React.FC<Record<string, string>>,
}

export default function BlockRenderer({ block }: { block: Block }) {
  const Component = RENDERERS[block.type]
  if (!Component) return <div className="text-red-400 text-sm">Unknown: {block.type}</div>
  return <Component {...block.props} />
}
