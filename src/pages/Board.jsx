import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../firebase/auth'
import { subscribeBoard } from '../firebase/boards'
import { subscribeKids } from '../firebase/kids'
import { getTheme } from '../themes/library'
import KidGrid from '../components/KidGrid'
import ChildTracker from '../components/ChildTracker'
import AddKidWizard from '../components/AddKidWizard'
import ShareButton from '../components/ShareButton'
import SettingsModal from '../components/SettingsModal'
import PinPrompt from '../components/PinPrompt'

const Board = () => {
  const { boardId } = useParams()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [board, setBoard] = useState(null)
  const [kids, setKids] = useState([])
  const [activeKidId, setActiveKidId] = useState(null)
  const [showAddKid, setShowAddKid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  // PIN lock session state — if the board has a PIN, parent mode must be
  // unlocked to edit/delete kids or open settings. Unlock persists only
  // for this session (sessionStorage, per-board).
  const [parentUnlocked, setParentUnlocked] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(`parent-unlocked-${boardId}`) === '1'
  )
  const [showPinPrompt, setShowPinPrompt] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    if (!boardId) return
    const unsubBoard = subscribeBoard(boardId, setBoard)
    const unsubKids = subscribeKids(boardId, (list) => {
      setKids(list)
      setLoading(false)
      // Functional update so we see the current activeKidId, not the
      // stale value captured when this effect first ran. Without this
      // every sticker toggle on a non-first kid fires a kids update
      // that bounces the view back to kids[0].
      setActiveKidId((cur) => {
        if (cur && list.some((k) => k.id === cur)) return cur
        return list[0]?.id ?? null
      })
    })
    return () => { unsubBoard(); unsubKids() }
  }, [boardId])

  // First-time onboarding: brand new admin with no kids auto-opens the
  // AddKidWizard so they have a clear first step instead of an empty page.
  useEffect(() => {
    if (loading || !board || !user) return
    if (board.adminId !== user.uid) return
    if (kids.length > 0) return
    const flag = `onboarded-${boardId}`
    if (sessionStorage.getItem(flag)) return
    sessionStorage.setItem(flag, '1')
    setShowAddKid(true)
  }, [loading, board, user, kids.length, boardId])

  const isAdmin = board && user && board.adminId === user.uid

  const pinProtected = !!board?.pinHash && !parentUnlocked

  const requireUnlock = (action) => {
    if (!pinProtected) { action(); return }
    setPendingAction(() => action)
    setShowPinPrompt(true)
  }

  const lockParentMode = () => {
    setParentUnlocked(false)
    sessionStorage.removeItem(`parent-unlocked-${boardId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
        <div className="text-4xl animate-pet-bounce">⭐</div>
      </div>
    )
  }

  const activeKid = kids.find((k) => k.id === activeKidId)
  const theme = activeKid ? getTheme(activeKid.theme) : getTheme('football')

  return (
    <div className="min-h-screen font-body px-2 sm:px-3 py-3 sm:py-4 pb-8 bg-gradient-to-b from-gray-50 to-purple-50">
      {/* Title bar */}
      <div className="max-w-[860px] mx-auto flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display bg-gradient-to-br from-green-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
            ⭐ {board?.name || 'Superstar Tracker'}
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          {board?.pinHash && (
            <button
              onClick={() => parentUnlocked ? lockParentMode() : setShowPinPrompt(true)}
              className="w-9 h-9 rounded-xl bg-white border-2 border-gray-200 text-sm font-bold text-gray-500 flex items-center justify-center"
              aria-label={parentUnlocked ? 'Lock parent mode' : 'Unlock parent mode'}
              title={parentUnlocked ? 'Parent mode unlocked — tap to lock' : 'Parent mode locked — tap to unlock'}
            >
              {parentUnlocked ? '🔓' : '🔒'}
            </button>
          )}
          <button
            onClick={() => requireUnlock(() => setShowSettings(true))}
            className="w-9 h-9 rounded-xl bg-white border-2 border-gray-200 text-sm font-bold text-gray-500 flex items-center justify-center"
            aria-label="Board settings"
            title="Board settings"
          >
            ⚙️
          </button>
          <ShareButton board={board} />
          {user && (
            <button
              onClick={() => { signOut(); navigate('/') }}
              className="px-3 py-1.5 rounded-xl bg-white border-2 border-gray-200 text-xs font-bold text-gray-500"
              aria-label={isAdmin ? 'Sign out of your account' : 'Leave guest session'}
            >
              {isAdmin ? 'Sign out' : 'Leave'}
            </button>
          )}
        </div>
      </div>

      {/* Kid grid */}
      <div className="max-w-[860px] mx-auto mb-4">
        <KidGrid
          kids={kids}
          activeKidId={activeKidId}
          onSelect={setActiveKidId}
          onAddKid={() => setShowAddKid(true)}
        />
      </div>

      {/* Active kid panel */}
      {activeKid ? (
        <div className="max-w-[860px] mx-auto">
          <ChildTracker
            boardId={boardId}
            kid={activeKid}
            theme={theme}
            parentLocked={pinProtected}
            onRequireUnlock={requireUnlock}
          />
        </div>
      ) : (
        <div className="max-w-[860px] mx-auto text-center py-12 bg-white/50 rounded-3xl">
          <div className="text-5xl mb-3">👶</div>
          <p className="text-gray-600 font-bold mb-4">No kids yet. Add your first one!</p>
          <button
            onClick={() => setShowAddKid(true)}
            className="px-6 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-green-500 to-purple-500"
          >
            + Add a kid
          </button>
        </div>
      )}

      {showAddKid && (
        <AddKidWizard
          boardId={boardId}
          existingCount={kids.length}
          onClose={() => setShowAddKid(false)}
          onCreated={(kidId) => { setActiveKidId(kidId); setShowAddKid(false) }}
        />
      )}

      {showSettings && (
        <SettingsModal
          board={board}
          user={user}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPinPrompt && board?.pinHash && (
        <PinPrompt
          board={board}
          mode="verify"
          onSuccess={() => {
            setParentUnlocked(true)
            sessionStorage.setItem(`parent-unlocked-${boardId}`, '1')
            setShowPinPrompt(false)
            if (pendingAction) {
              pendingAction()
              setPendingAction(null)
            }
          }}
          onCancel={() => { setShowPinPrompt(false); setPendingAction(null) }}
        />
      )}
    </div>
  )
}

export default Board
