import { useState, useCallback } from 'react'
import ChildTracker from './ChildTracker'
import footballTheme from '../themes/football'
import dinosaurTheme from '../themes/dinosaur'

const themes = [footballTheme, dinosaurTheme]

const App = () => {
  const [scores, setScores] = useState({ football: 0, dinosaur: 0 })
  const [activeTab, setActiveTab] = useState('football')

  const handleScore = useCallback(
    (key) => (score) => setScores((prev) => ({ ...prev, [key]: score })),
    []
  )

  return (
    <div className="min-h-screen font-body px-2 sm:px-3 py-3 sm:py-4 pb-8 sm:pb-10 bg-gradient-to-b from-gray-50 to-purple-50">
      {/* Title */}
      <div className="text-center mb-4 sm:mb-5 pt-1 sm:pt-2">
        <h1 className="text-2xl sm:text-3xl font-black font-display m-0 bg-gradient-to-br from-green-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
          ⭐ Superstar Tracker ⭐
        </h1>
        <p className="text-gray-400 text-[11px] sm:text-[13px] mt-1 font-semibold">
          Collect stickers every day — how many can you get?
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1.5 sm:gap-2 justify-center mb-4 sm:mb-5">
        {themes.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-extrabold text-[13px] sm:text-[15px] cursor-pointer flex items-center gap-1.5 sm:gap-2 font-body transition-all duration-200"
            style={{
              border: activeTab === t.key ? `2.5px solid ${t.accent}` : '2.5px solid #E8E8E8',
              background: activeTab === t.key ? 'white' : 'transparent',
              color: activeTab === t.key ? '#333' : '#AAA',
              boxShadow: activeTab === t.key ? `0 2px 12px ${t.accent}25` : 'none',
            }}
          >
            <span className="text-lg sm:text-xl">{t.avatar}</span>
            <span className="hidden sm:inline">{t.name}</span>
            <span
              className="rounded-lg px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white"
              style={{ background: activeTab === t.key ? t.accent : '#E0E0E0' }}
            >
              {scores[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Panels */}
      {themes.map((t) => (
        <div
          key={t.key}
          className="max-w-[860px] mx-auto"
          style={{ display: activeTab === t.key ? 'block' : 'none' }}
        >
          <ChildTracker theme={t} onScoreChange={handleScore(t.key)} />
        </div>
      ))}

      {/* Footer */}
      <p className="text-center text-gray-300 text-[10px] sm:text-[11px] mt-4 sm:mt-6 font-semibold px-2">
        Tap names to rename · Tap "Special!" to customise · Set a reward goal
      </p>
    </div>
  )
}

export default App
