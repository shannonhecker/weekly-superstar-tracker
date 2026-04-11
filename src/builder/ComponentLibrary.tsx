import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { BLUEPRINTS } from './blueprints'
import type { Blueprint } from './types'

function LibraryItem({ blueprint }: { blueprint: Blueprint }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `blueprint-${blueprint.type}`,
    data: { blueprint },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-gray-100 bg-white cursor-grab active:cursor-grabbing hover:border-purple-200 hover:shadow-sm transition-all"
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <span className="text-2xl w-9 text-center">{blueprint.icon}</span>
      <div>
        <div className="text-sm font-bold text-gray-700">{blueprint.label}</div>
        <div className="text-[11px] text-gray-400 font-semibold">{blueprint.type}</div>
      </div>
    </div>
  )
}

export default function ComponentLibrary() {
  return (
    <div className="w-60 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">
          Components
        </h2>
      </div>
      <div className="flex flex-col gap-2 p-3 overflow-y-auto flex-1">
        {BLUEPRINTS.map((bp) => (
          <LibraryItem key={bp.type} blueprint={bp} />
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-400 font-semibold">
        Drag items onto the canvas
      </div>
    </div>
  )
}
