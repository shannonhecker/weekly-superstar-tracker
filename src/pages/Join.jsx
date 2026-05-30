import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { arrayUnion, collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { db, functions } from '../lib/firebase'
import EmptyStateScene from '../components/EmptyStateScene'

const INVITE_NOT_FOUND = 'invite/not-found'
const INVITE_MISSING = 'invite/missing-code'
const INVITE_NETWORK = 'invite/network'
const INVITE_UNKNOWN = 'invite/unknown'

class InviteError extends Error {
  constructor(category, message) {
    super(message)
    this.name = 'InviteError'
    this.category = category
  }
}

function categorizeRedeemFailure(err) {
  if (err?.name === 'InviteError') return err.category
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return INVITE_NETWORK
  const code = String(err?.code || '')
  const msg = String(err?.message || '').toLowerCase()
  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'functions/unavailable' ||
    code === 'functions/deadline-exceeded' ||
    msg.includes('network request failed') ||
    msg.includes('failed to fetch')
  ) {
    return INVITE_NETWORK
  }
  if (
    code === 'not-found' ||
    code === 'functions/not-found' ||
    code === 'permission-denied' ||
    code === 'functions/permission-denied'
  ) {
    return INVITE_NOT_FOUND
  }
  return INVITE_UNKNOWN
}

const INVITE_ERROR_COPY = {
  [INVITE_NOT_FOUND]: 'This invite link could not be redeemed. It may have expired or already been used. Ask the family admin for a new link.',
  [INVITE_MISSING]: 'This invite link does not look right. Check the URL or ask for a new one.',
  [INVITE_NETWORK]: 'We could not reach the server. Check your connection and try again.',
  [INVITE_UNKNOWN]: 'Something went wrong joining the board. Try again, or ask the family admin for a new link.',
}

async function redeemShareCodeFromFirestore(code, uid) {
  const normalizedCode = String(code || '').trim()
  if (!normalizedCode) throw new InviteError(INVITE_MISSING, 'Invite code is missing.')

  const boardsRef = collection(db, 'boards')
  const shareCodeQuery = query(boardsRef, where('shareCode', '==', normalizedCode), limit(1))
  const snapshot = await getDocs(shareCodeQuery)
  if (snapshot.empty) throw new InviteError(INVITE_NOT_FOUND, 'Invite could not be redeemed.')

  const board = snapshot.docs[0]
  await updateDoc(doc(db, 'boards', board.id), {
    memberIds: arrayUnion(uid),
  })
  return board.id
}

async function redeemShareCode(code, uid) {
  try {
    const redeem = httpsCallable(functions, 'redeemShareCode')
    const result = await redeem({ code })
    const boardId = result.data?.boardId
    if (!boardId) throw new InviteError(INVITE_NOT_FOUND, 'Invite could not be redeemed.')
    return boardId
  } catch (err) {
    const codeValue = err?.code || ''
    const isMissingCallable = codeValue === 'functions/not-found' || codeValue === 'functions/unimplemented'
    if (!isMissingCallable) throw err

    return redeemShareCodeFromFirestore(code, uid)
  }
}

export default function Join() {
  const { code } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  // `signedOut` is the special pre-auth state (different from a real redeem error).
  // `errorCategory` is one of INVITE_* once a redeem actually failed.
  const [signedOut, setSignedOut] = useState(false)
  const [errorCategory, setErrorCategory] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const retry = useCallback(() => {
    setErrorCategory('')
    setRetryToken((n) => n + 1)
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) {
      setSignedOut(true)
      return
    }
    setSignedOut(false)
    let cancelled = false
    ;(async () => {
      try {
        const boardId = await redeemShareCode(code, user.uid)
        if (!cancelled) navigate(`/board/${boardId}`, { replace: true })
      } catch (err) {
        if (!cancelled) setErrorCategory(categorizeRedeemFailure(err))
      }
    })()
    return () => { cancelled = true }
  }, [loading, user, code, navigate, retryToken])

  const showError = signedOut || !!errorCategory
  const message = signedOut
    ? 'You have been invited to cheer on a family superstar. Sign in or create a parent account to join the board.'
    : INVITE_ERROR_COPY[errorCategory] || INVITE_ERROR_COPY[INVITE_UNKNOWN]
  const canRetry = !signedOut && errorCategory === INVITE_NETWORK

  return (
    <main id="main" className="min-h-screen flex items-center justify-center text-center px-5 bg-earthy-ivory font-jakarta">
      <div className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider max-w-md w-full overflow-hidden">
        <div className="bg-earthy-cream">
          <EmptyStateScene variant="joining" />
        </div>
        <div className="p-8 pt-6">
          {showError
            ? (
                <>
                  <h1 className="text-earthy-cocoa font-extrabold text-2xl leading-tight">
                    Join the family board
                  </h1>
                  <p className="mt-3 text-earthy-cocoaSoft font-bold text-sm leading-relaxed">{message}</p>
                  {canRetry && (
                    <button
                      type="button"
                      onClick={retry}
                      className="mt-5 w-full py-3 rounded-pill bg-earthy-cocoa text-earthy-cream font-bold hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all"
                    >
                      Try again
                    </button>
                  )}
                  {signedOut && (
                    <div className="mt-5 flex flex-col gap-2">
                      <Link
                        to={`/signin?next=${encodeURIComponent(`/join/${code}`)}`}
                        className="w-full py-3 rounded-pill bg-earthy-cocoa text-earthy-cream font-bold hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all text-center"
                      >
                        Sign in to join
                      </Link>
                      <Link
                        to={`/?next=${encodeURIComponent(`/join/${code}`)}`}
                        className="w-full py-3 rounded-pill border-2 border-earthy-divider bg-earthy-ivory text-earthy-cocoa font-bold hover:border-earthy-cocoaSoft active:scale-[0.99] transition-all text-center"
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </>
              )
            : <>
                <p className="text-earthy-cocoa font-extrabold text-lg mb-1">Joining the board...</p>
                <p className="text-earthy-cocoaSoft text-sm font-bold">Hang tight, we are getting you in.</p>
              </>}
        </div>
      </div>
    </main>
  )
}
