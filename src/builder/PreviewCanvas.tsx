import { useDroppable } from '@dnd-kit/core'
import BlockRenderer from './BlockRenderer'
import type { Block } from './types'

interface PreviewCanvasProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelect: (id: string) => void
}

export default function PreviewCanvas({ blocks, selectedBlockId, onSelect }: PreviewCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'preview-canvas' })

  return (
    <div className="flex-1 bg-white flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">Canvas</h2>
        <span className="text-xs font-bold text-gray-300">
          {blocks.length} block{blocks.length !== 1 && 's'}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-6 overflow-y-auto transition-colors duration-200"
        style={{
          background: isOver ? '#F3E8FF' : '#FAFAFA',
          backgroundImage: isOver
            ? 'none'
            : 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-3 opacity-30">
                {isOver ? '👇' : '🎨'}
              </div>
              <p className="text-sm font-bold text-gray-300">
                {isOver ? 'Drop to add component' : 'Drag components here to build'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            {blocks.map((block) => {
              const isSelected = block.id === selectedBlockId
              return (
                <div
                  key={block.id}
                  onClick={() => onSelect(block.id)}
                  className="rounded-xl p-4 cursor-pointer transition-all duration-150"
                  style={{
                    border: isSelected
                      ? '2px solid #7C3AED'
                      : '2px solid transparent',
                    background: isSelected ? '#FAF5FF' : 'white',
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(124, 58, 237, 0.15)'
                      : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <BlockRenderer block={block} />
                </div>
              )
            })}
            {isOver && (
              <div className="rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-4 text-center text-sm font-bold text-purple-400">
                Drop here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
