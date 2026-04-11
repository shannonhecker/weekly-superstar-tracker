import { useState, useCallback } from 'react'
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core'
import ComponentLibrary from './ComponentLibrary'
import PreviewCanvas from './PreviewCanvas'
import PropertiesInspector from './PropertiesInspector'
import BlockRenderer from './BlockRenderer'
import { BLUEPRINTS } from './blueprints'
import type { Block, Blueprint, GlobalSettings } from './types'

export default function DesignHub() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [activeBlueprint, setActiveBlueprint] = useState<Blueprint | null>(null)
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    theme: 'light',
    density: 'comfortable',
  })

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const bp = BLUEPRINTS.find((b) => `blueprint-${b.type}` === event.active.id)
    setActiveBlueprint(bp ?? null)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveBlueprint(null)

    const { active, over } = event
    if (over?.id !== 'preview-canvas') return

    const blueprint = active.data.current?.blueprint as Blueprint | undefined
    if (!blueprint) return

    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: blueprint.type,
      props: { ...blueprint.defaultProps },
    }

    setBlocks((prev) => [...prev, newBlock])
    setSelectedBlockId(newBlock.id)
  }, [])

  const handleUpdate = useCallback((id: string, props: Record<string, string>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setSelectedBlockId((prev) => (prev === id ? null : prev))
  }, [])

  const handleSettingsChange = useCallback((patch: Partial<GlobalSettings>) => {
    setGlobalSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <ComponentLibrary />
        <PreviewCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelect={setSelectedBlockId}
          globalSettings={globalSettings}
          onSettingsChange={handleSettingsChange}
        />
        <PropertiesInspector
          block={selectedBlock}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeBlueprint && (
          <div className="bg-white rounded-xl p-4 shadow-xl border-2 border-purple-300 opacity-90 max-w-xs">
            <BlockRenderer
              block={{
                id: 'overlay',
                type: activeBlueprint.type,
                props: activeBlueprint.defaultProps,
              }}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
