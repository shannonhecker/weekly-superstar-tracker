import { useState, useCallback } from 'react'
import ChildTracker from './ChildTracker'
import DesignHub from '../builder/DesignHub'
import footballTheme from '../themes/football'
import dinosaurTheme from '../themes/dinosaur'
import dragonTheme from '../themes/dragon'

const themes = [footballTheme, dinosaurTheme, dragonTheme]

const App = () => {
  const [scores, setScores] = useState({ football: 0, dinosaur: 0, dragon: 0 })
  const [activeTab, setActiveTab] = useState('football')
  const [mode, setMode] = useState('tracker')

  const handleScore = useCallback(
    (key) => (score) => setScores((prev) => ({ ...prev, [key]: score })),
    []
  )

  return (
    <div className="min-h-screen font-body px-3 py-4 pb-10 bg-gradient-to-b from-gray-50 to-purple-50">
      {/* Title + Mode Switch */}
      <div className="text-center mb-5 pt-2">
        <h1 className="text-3xl font-black font-display m-0 bg-gradient-to-br from-green-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
          ⭐ Weekly Superstar Tracker ⭐
        </h1>
        <p className="text-gray-400 text-[13px] mt-1 font-semibold">
          Collect stickers every day — how many can you get?
        </p>
        <div className="flex gap-2 justify-center mt-3">
          <button
            onClick={() => setMode('tracker')}
            className="px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
            style={{
              background: mode === 'tracker' ? '#7C3AED' : 'transparent',
              color: mode === 'tracker' ? 'white' : '#999',
              border: mode === 'tracker' ? '2px solid #7C3AED' : '2px solid #E5E7EB',
            }}
          >
            Tracker
          </button>
          <button
            onClick={() => setMode('design-hub')}
            className="px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
            style={{
              background: mode === 'design-hub' ? '#7C3AED' : 'transparent',
              color: mode === 'design-hub' ? 'white' : '#999',
              border: mode === 'design-hub' ? '2px solid #7C3AED' : '2px solid #E5E7EB',
            }}
          >
            Design Hub
          </button>
        </div>
      </div>

      {mode === 'design-hub' && (
        <div className="max-w-6xl mx-auto mb-6">
          <DesignHub />
        </div>
      )}

      {mode === 'tracker' && <>
      {/* Tab switcher */}
      <div className="flex gap-2 justify-center mb-5" role="tablist" aria-label="Child tracker tabs">
        {themes.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setActiveTab(t.key)}
            className="px-5 py-2.5 rounded-xl font-extrabold text-[15px] cursor-pointer flex items-center gap-2 font-body transition-all duration-200"
            style={{
              border: activeTab === t.key ? `2.5px solid ${t.accent}` : '2.5px solid #E8E8E8',
              background: activeTab === t.key ? 'white' : 'transparent',
              color: activeTab === t.key ? '#333' : '#AAA',
              boxShadow: activeTab === t.key ? `0 2px 12px ${t.accent}25` : 'none',
            }}
          >
            <span className="text-xl">{t.avatar}</span>
            {t.name}
            <span
              className="rounded-lg px-2 py-0.5 text-xs font-bold text-white"
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
          id={`panel-${t.key}`}
          role="tabpanel"
          aria-label={`${t.name}'s tracker`}
          className="max-w-[860px] mx-auto"
          style={{ display: activeTab === t.key ? 'block' : 'none' }}
        >
          <ChildTracker theme={t} onScoreChange={handleScore(t.key)} />
        </div>
      ))}

      {/* Footer */}
      <p className="text-center text-gray-300 text-[11px] mt-6 font-semibold">
        💡 Tap names to rename · Tap "Special!" to customise · Set a reward goal · Hit reset to save & start fresh
      </p>
      </>}
    </div>
  )
}

export default App
