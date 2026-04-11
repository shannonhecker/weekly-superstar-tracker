import { useDroppable } from '@dnd-kit/core'
import BlockRenderer from './BlockRenderer'
import type { Block, GlobalSettings, Theme, Density } from './types'

/* ------------------------------------------------------------------ */
/*  CSS custom-property tokens for theme + density                     */
/* ------------------------------------------------------------------ */

const THEME_VARS: Record<Theme, Record<string, string>> = {
  light: {
    '--dh-bg':             '#FAFAFA',
    '--dh-surface':        '#FFFFFF',
    '--dh-text':           '#1F2937',
    '--dh-text-secondary': '#6B7280',
    '--dh-border':         '#E5E7EB',
    '--dh-input-bg':       '#FFFFFF',
    '--dh-input-border':   '#D1D5DB',
    '--dh-accent':         '#7C3AED',
    '--dh-secondary':      '#F3F4F6',
    '--text-primary':      '#111827',
    '--text-secondary':    '#6B7280',
  },
  dark: {
    '--dh-bg':             '#0F172A',
    '--dh-surface':        '#1E293B',
    '--dh-text':           '#E2E8F0',
    '--dh-text-secondary': '#94A3B8',
    '--dh-border':         '#334155',
    '--dh-input-bg':       '#1E293B',
    '--dh-input-border':   '#475569',
    '--dh-accent':         '#A78BFA',
    '--dh-secondary':      '#334155',
    '--text-primary':      '#F1F5F9',
    '--text-secondary':    '#94A3B8',
  },
}

const DENSITY_VARS: Record<Density, Record<string, string>> = {
  comfortable: {
    '--dh-px':        '20px',
    '--dh-py':        '10px',
    '--dh-gap':       '12px',
    '--dh-radius':    '8px',
    '--dh-font-size': '14px',
  },
  compact: {
    '--dh-px':        '12px',
    '--dh-py':        '6px',
    '--dh-gap':       '8px',
    '--dh-radius':    '6px',
    '--dh-font-size': '13px',
  },
}

/* ------------------------------------------------------------------ */
/*  Global controls toolbar                                            */
/* ------------------------------------------------------------------ */

function GlobalControls({
  settings,
  onChange,
}: {
  settings: GlobalSettings
  onChange: (patch: Partial<GlobalSettings>) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Theme toggle */}
      <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
        {(['light', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChange({ theme: t })}
            className="px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all"
            style={{
              background: settings.theme === t ? '#7C3AED' : 'transparent',
              color: settings.theme === t ? 'white' : '#9CA3AF',
              border: 'none',
            }}
          >
            {t === 'light' ? '☀️ Light' : '🌙 Dark'}
          </button>
        ))}
      </div>

      {/* Density toggle */}
      <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
        {(['comfortable', 'compact'] as const).map((d) => (
          <button
            key={d}
            onClick={() => onChange({ density: d })}
            className="px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all capitalize"
            style={{
              background: settings.density === d ? '#7C3AED' : 'transparent',
              color: settings.density === d ? 'white' : '#9CA3AF',
              border: 'none',
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Canvas                                                             */
/* ------------------------------------------------------------------ */

interface PreviewCanvasProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelect: (id: string) => void
  globalSettings: GlobalSettings
  onSettingsChange: (patch: Partial<GlobalSettings>) => void
}

export default function PreviewCanvas({
  blocks,
  selectedBlockId,
  onSelect,
  globalSettings,
  onSettingsChange,
}: PreviewCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'preview-canvas' })

  const cssVars: Record<string, string> = {
    ...THEME_VARS[globalSettings.theme],
    ...DENSITY_VARS[globalSettings.density],
  }

  const isDark = globalSettings.theme === 'dark'

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: isDark ? '#0B1120' : 'white' }}>
      {/* Toolbar with global controls */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          borderBottom: `1px solid ${isDark ? '#1E293B' : '#E5E7EB'}`,
          background: isDark ? '#0F172A' : 'white',
        }}
      >
        <h2
          className="text-sm font-extrabold uppercase tracking-wider"
          style={{ color: isDark ? '#64748B' : '#9CA3AF' }}
        >
          Canvas
        </h2>
        <div className="flex items-center gap-4">
          <GlobalControls settings={globalSettings} onChange={onSettingsChange} />
          <span className="text-xs font-bold" style={{ color: isDark ? '#475569' : '#D1D5DB' }}>
            {blocks.length} block{blocks.length !== 1 && 's'}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 p-6 overflow-y-auto transition-colors duration-200"
        style={{
          ...cssVars,
          background: isOver
            ? (isDark ? '#1A1035' : '#F3E8FF')
            : `var(--dh-bg)`,
          backgroundImage: isOver
            ? 'none'
            : `radial-gradient(circle, ${isDark ? '#1E293B' : '#E5E7EB'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        } as React.CSSProperties}
      >
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-3 opacity-30">{isOver ? '👇' : '🎨'}</div>
              <p className="text-sm font-bold" style={{ color: isDark ? '#475569' : '#D1D5DB' }}>
                {isOver ? 'Drop to add component' : 'Drag components here to build'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col mx-auto max-w-lg" style={{ gap: 'var(--dh-gap)' }}>
            {blocks.map((block) => {
              const isSelected = block.id === selectedBlockId
              return (
                <div
                  key={block.id}
                  onClick={() => onSelect(block.id)}
                  className="rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    padding: 'var(--dh-px)',
                    border: isSelected
                      ? '2px solid var(--dh-accent)'
                      : `2px solid transparent`,
                    background: isSelected
                      ? (isDark ? '#1E1B4B' : '#FAF5FF')
                      : 'var(--dh-surface)',
                    boxShadow: isSelected
                      ? `0 0 0 3px ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'}`
                      : `0 1px 3px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <BlockRenderer block={block} />
                </div>
              )
            })}
            {isOver && (
              <div
                className="rounded-xl border-2 border-dashed p-4 text-center text-sm font-bold"
                style={{
                  borderColor: isDark ? '#7C3AED' : '#C4B5FD',
                  background: isDark ? '#1A1035' : '#F5F3FF',
                  color: isDark ? '#A78BFA' : '#8B5CF6',
                }}
              >
                Drop here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
