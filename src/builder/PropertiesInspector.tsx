import type { Block, BlockType } from './types'

/* ------------------------------------------------------------------ */
/*  Shared form primitives                                             */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold outline-none focus:border-purple-400 bg-white"
    />
  )
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold outline-none focus:border-purple-400 bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ------------------------------------------------------------------ */
/*  Type-specific form groups                                          */
/* ------------------------------------------------------------------ */

interface FieldGroupProps {
  block: Block
  onChange: (key: string, value: string) => void
}

function ButtonFields({ block, onChange }: FieldGroupProps) {
  return (
    <>
      <Field label="Button Label">
        <TextInput
          value={block.props.label}
          placeholder="e.g. Submit"
          onChange={(v) => onChange('label', v)}
        />
      </Field>
      <Field label="Variant">
        <Select
          value={block.props.variant}
          onChange={(v) => onChange('variant', v)}
          options={[
            { value: 'primary',   label: 'Primary / CTA' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'outline',   label: 'Outline' },
            { value: 'ghost',     label: 'Text / Ghost' },
          ]}
        />
      </Field>
    </>
  )
}

function TitleFields({ block, onChange }: FieldGroupProps) {
  return (
    <>
      <Field label="Heading Text">
        <TextInput
          value={block.props.text}
          placeholder="e.g. Welcome to my site"
          onChange={(v) => onChange('text', v)}
        />
      </Field>
      <Field label="Design System">
        <Select
          value={block.props.system}
          onChange={(v) => onChange('system', v)}
          options={[
            { value: 'salt',   label: 'Salt (Open Sans)' },
            { value: 'm3',     label: 'M3 (Roboto)' },
            { value: 'fluent', label: 'Fluent (Segoe UI)' },
          ]}
        />
      </Field>
      <Field label="Level">
        <Select
          value={block.props.level}
          onChange={(v) => onChange('level', v)}
          options={[
            { value: 'h1', label: 'H1' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
          ]}
        />
      </Field>
    </>
  )
}

function InputFields({ block, onChange }: FieldGroupProps) {
  return (
    <>
      <Field label="Field Label">
        <TextInput
          value={block.props.label}
          placeholder="e.g. Email Address"
          onChange={(v) => onChange('label', v)}
        />
      </Field>
      <Field label="Placeholder">
        <TextInput
          value={block.props.placeholder}
          placeholder="e.g. name@company.com"
          onChange={(v) => onChange('placeholder', v)}
        />
      </Field>
    </>
  )
}

function AlertFields({ block, onChange }: FieldGroupProps) {
  return (
    <>
      <Field label="Message">
        <TextInput
          value={block.props.message}
          placeholder="Alert message..."
          onChange={(v) => onChange('message', v)}
        />
      </Field>
      <Field label="Variant">
        <Select
          value={block.props.variant}
          onChange={(v) => onChange('variant', v)}
          options={[
            { value: 'info',    label: 'Info' },
            { value: 'success', label: 'Success' },
            { value: 'warning', label: 'Warning' },
            { value: 'error',   label: 'Error' },
          ]}
        />
      </Field>
    </>
  )
}

const FIELD_GROUPS: Record<BlockType, React.FC<FieldGroupProps>> = {
  SimulatedButton: ButtonFields,
  SimulatedTitle:  TitleFields,
  SimulatedInput:  InputFields,
  SimulatedAlert:  AlertFields,
}

/* ------------------------------------------------------------------ */
/*  Type icon + label map                                              */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<BlockType, { icon: string; label: string }> = {
  SimulatedButton: { icon: '🔘', label: 'Button' },
  SimulatedTitle:  { icon: '🔤', label: 'Title / Heading' },
  SimulatedInput:  { icon: '✏️',  label: 'Text Input' },
  SimulatedAlert:  { icon: '⚠️',  label: 'Alert' },
}

/* ------------------------------------------------------------------ */
/*  Main inspector panel                                               */
/* ------------------------------------------------------------------ */

interface PropertiesInspectorProps {
  block: Block | null
  onUpdate: (id: string, props: Record<string, string>) => void
  onDelete: (id: string) => void
}

export default function PropertiesInspector({ block, onUpdate, onDelete }: PropertiesInspectorProps) {
  if (!block) {
    return (
      <div className="w-64 shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-20">🖱️</div>
            <p className="text-sm font-semibold text-gray-300">
              Select a block on the canvas to edit its properties
            </p>
          </div>
        </div>
      </div>
    )
  }

  const meta = TYPE_META[block.type]
  const FieldGroup = FIELD_GROUPS[block.type]

  const handleChange = (key: string, value: string) => {
    onUpdate(block.id, { ...block.props, [key]: value })
  }

  return (
    <div className="w-64 shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">
          Properties
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Block identity */}
        <div className="flex items-center gap-2.5 bg-white rounded-xl p-3 border border-gray-200">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="text-sm font-bold text-gray-800">{meta.label}</div>
            <div className="text-[10px] font-semibold text-gray-400 font-mono">{block.id.slice(0, 8)}</div>
          </div>
        </div>

        {/* Section divider */}
        <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-2">
          <span className="flex-1 h-px bg-purple-200" />
          Content
          <span className="flex-1 h-px bg-purple-200" />
        </div>

        {/* Type-specific fields */}
        {FieldGroup && <FieldGroup block={block} onChange={handleChange} />}
      </div>

      {/* Delete action */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onDelete(block.id)}
          className="w-full py-2 rounded-xl border-2 border-red-200 bg-white text-red-500 font-bold text-sm cursor-pointer hover:bg-red-50 transition-colors"
        >
          Delete Block
        </button>
      </div>
    </div>
  )
}
