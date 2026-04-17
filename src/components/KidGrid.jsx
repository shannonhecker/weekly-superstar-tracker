import { getTheme } from '../themes/library'

const KidGrid = ({ kids, activeKidId, onSelect, onAddKid }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 -mx-1">
      {kids.map((kid) => {
        const theme = getTheme(kid.theme)
        const active = kid.id === activeKidId
        return (
          <button
            key={kid.id}
            onClick={() => {
              console.log('[KidGrid] onSelect:', kid.id.slice(0, 6), kid.name)
              onSelect(kid.id)
            }}
            className="flex flex-col items-center gap-1 shrink-0 px-2 py-1.5 rounded-2xl transition-all"
            style={{
              background: active ? 'white' : 'transparent',
              boxShadow: active ? `0 2px 12px ${theme.accent}33` : 'none',
              border: active ? `2.5px solid ${theme.accent}` : '2.5px solid transparent',
            }}
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-[24px] sm:text-[28px] overflow-hidden"
              style={{
                background: theme.headerGradient,
                boxShadow: `0 3px 10px ${theme.accent}44`,
              }}
            >
              {kid.photoUrl ? (
                <img src={kid.photoUrl} alt={kid.name} className="w-full h-full object-cover" />
              ) : (
                theme.avatar
              )}
            </div>
            <span className={`text-[11px] sm:text-xs font-extrabold ${active ? '' : 'text-gray-400'}`}
              style={active ? { color: theme.accent } : undefined}
            >
              {kid.name}
            </span>
          </button>
        )
      })}
      <button
        onClick={onAddKid}
        className="flex flex-col items-center gap-1 shrink-0 px-2 py-1.5 rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl text-gray-400 bg-white">
          +
        </div>
        <span className="text-[11px] sm:text-xs font-extrabold text-gray-400">Add</span>
      </button>
    </div>
  )
}

export default KidGrid
