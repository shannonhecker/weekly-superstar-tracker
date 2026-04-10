const BadgeShelf = ({ badges, currentBadge }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    {badges.map((b, i) => (
      <div
        key={i}
        title={`Week ${i + 1}: ${b.label}`}
        className="w-8 h-8 rounded-full flex items-center justify-center text-base"
        style={{
          background: `${b.color}22`,
          border: `2px solid ${b.color}`,
          boxShadow: `0 2px 6px ${b.glow}`,
        }}
      >
        {b.icon}
      </div>
    ))}
    {currentBadge && (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg animate-badge-pulse"
        style={{
          background: `${currentBadge.color}22`,
          border: `2.5px dashed ${currentBadge.color}`,
          boxShadow: `0 2px 10px ${currentBadge.glow}`,
        }}
      >
        {currentBadge.icon}
      </div>
    )}
    {!currentBadge && badges.length === 0 && (
      <span className="text-xs font-semibold text-gray-300">
        Earn 15+ stars for a badge!
      </span>
    )}
  </div>
)

export default BadgeShelf
