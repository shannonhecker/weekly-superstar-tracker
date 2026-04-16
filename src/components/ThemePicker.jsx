import { THEME_LIST } from '../themes/library'

const ThemePicker = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {THEME_LIST.map((t) => {
        const active = value === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all"
            style={{
              background: active ? 'white' : 'rgba(255,255,255,0.5)',
              border: active ? `2.5px solid ${t.accent}` : '2.5px solid #E8E8E8',
              boxShadow: active ? `0 2px 12px ${t.accent}33` : 'none',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ background: t.headerGradient }}
            >
              {t.avatar}
            </div>
            <span className="text-[11px] font-extrabold" style={{ color: active ? t.accent : '#888' }}>
              {t.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemePicker
