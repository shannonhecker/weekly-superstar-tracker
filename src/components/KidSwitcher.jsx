import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { THEMES, DEFAULT_ACTIVITIES } from '../lib/themes'
import { getWeekKey } from '../lib/week'
import { useToast } from '../contexts/ToastContext'
import NewKidModal from './NewKidModal'
import { KidAvatar } from './KidAvatar'

// URL-driven kid selection. Active kid is stored in `?kid=<id>`,
// so a Firestore re-render NEVER resets selection — that's the sticker-bug fix.
export default function KidSwitcher({ kids, activeKidId, boardId }) {
  const navigate = useNavigate()
  const { boardId: currentBoardId } = useParams()
  const [promptOpen, setPromptOpen] = useState(false)
  const toast = useToast()

  const setActive = (id) => {
    navigate(`/board/${currentBoardId}?kid=${encodeURIComponent(id)}`, { replace: true })
  }

  const addKid = async ({ name, avatarEmoji, theme, birthday }) => {
    const trimmedName = (name || '').trim()
    if (!trimmedName) return
    const themeKeys = Object.keys(THEMES)
    const resolvedTheme = theme && THEMES[theme] ? theme : themeKeys[kids.length % themeKeys.length]
    try {
      await addDoc(collection(db, 'boards', boardId, 'kids'), {
        name: trimmedName,
        theme: resolvedTheme,
        order: kids.length,
        birthday: birthday || null,
        activities: DEFAULT_ACTIVITIES,
        checks: {},
        stickers: {},
        badges: [],
        petName: null,
        reward: null,
        weekKey: getWeekKey(),
        weekHistory: {},
        chainKey: null,
        favoritePet: null,
        avatarKind: avatarEmoji ? 'preset' : 'theme',
        avatarEmoji: avatarEmoji ?? null,
        avatarUrl: null,
        createdAt: serverTimestamp(),
      })
      setPromptOpen(false)
    } catch (e) {
      toast.error('Could not add superstar — try again')
    }
  }

  return (
    <div className="flex gap-3 justify-center mb-4 overflow-x-auto pb-1 -mx-3 px-3 flex-wrap font-jakarta">
      {kids.map((kid) => {
        const theme = THEMES[kid.theme] || THEMES.football
        const isActive = kid.id === activeKidId
        return (
          <button
            key={kid.id}
            onClick={() => setActive(kid.id)}
            className="flex flex-col items-center gap-1.5 shrink-0 transition-all"
          >
            <div
              className="transition-all"
              style={{
                boxShadow: isActive ? `0 4px 14px ${theme.deeper}33` : 'none',
                borderRadius: '999px',
              }}
            >
              <KidAvatar
                kid={kid}
                size={64}
                borderColor={isActive ? theme.deeper : 'transparent'}
              />
            </div>
            <span
              className="text-xs font-bold truncate max-w-[4.5rem]"
              style={{ color: isActive ? theme.deeper : '#8B6651' }}
            >
              {kid.name}
            </span>
          </button>
        )
      })}
      <button
        onClick={() => setPromptOpen(true)}
        className="flex flex-col items-center gap-1.5 shrink-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 border-dashed border-earthy-divider text-earthy-cocoaSoft hover:border-earthy-terracotta hover:text-earthy-terracotta transition-colors bg-earthy-card shadow-earthy-card">
          +
        </div>
        <span className="text-xs font-bold text-earthy-cocoaSoft">Add</span>
      </button>

      <NewKidModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onSubmit={addKid}
        kidCount={kids.length}
      />
    </div>
  )
}
