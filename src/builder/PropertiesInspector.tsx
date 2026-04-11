import type { Block } from './types'

interface PropertiesInspectorProps {
  block: Block | null
  onUpdate: (id: string, props: Record<string, string>) => void
  onDelete: (id: string) => void
}

const PROP_OPTIONS: Record<string, Record<string, string[]>> = {
  SimulatedButton: { variant: ['primary', 'secondary', 'danger'] },
  SimulatedTitle: { level: ['h1', 'h2', 'h3', 'h4'] },
  SimulatedAlert: { variant: ['info', 'success', 'warning', 'error'] },
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
          <p className="text-sm font-semibold text-gray-300 text-center">
            Select a block on the canvas to edit its properties
          </p>
        </div>
      </div>
    )
  }

  const options = PROP_OPTIONS[block.type] || {}

  const handleChange = (key: string, value: string) => {
    onUpdate(block.id, { ...block.props, [key]: value })
  }

  return (
    <div className="w-64 shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">
          Properties
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Type
          </div>
          <div className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
            {block.type}
          </div>
        </div>

        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Editable Props
        </div>

        {Object.entries(block.props).map(([key, value]) => {
          const selectOptions = options[key]

          return (
            <div key={key}>
              <label className="block text-xs font-bold text-gray-500 mb-1">{key}</label>
              {selectOptions ? (
                <select
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold outline-none focus:border-purple-400 bg-white"
                >
                  {selectOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold outline-none focus:border-purple-400"
                />
              )}
            </div>
          )
        })}
      </div>

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
