import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { findUserBoards } from '../lib/boards'
import Logo from '../components/Logo'
import LogoLoader from '../components/LogoLoader'
import TrustPills from '../components/TrustPills'
import ProductPreview from '../components/wizard/ProductPreview'

const ROTATING_PREVIEWS = ['board', 'themes', 'kid', 'records']

export default function Landing() {
  const { user, loading } = useAuth()
  const [boardId, setBoardId] = useState(null)
  const [checking, setChecking] = useState(true)
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    let cancelled = false
    ;(async () => {
      const boards = await findUserBoards(user.uid)
      if (cancelled) return
      // Earliest-by-createdAt — the user's original board, not a stray
      // duplicate. findUserBoards already sorts that way.
      if (boards.length > 0) setBoardId(boards[0].id)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return undefined
    const timer = window.setInterval(() => {
      setPreviewIndex((index) => (index + 1) % ROTATING_PREVIEWS.length)
    }, 5600)
    return () => window.clearInterval(timer)
  }, [])

  if (loading || (user && checking)) return <LogoLoader />
  if (user && boardId) return <Navigate to={`/board/${boardId}`} replace />
  const previewVariant = ROTATING_PREVIEWS[previewIndex]

  return (
    <main id="main" className="min-h-screen bg-earthy-card font-jakarta text-earthy-cocoa">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
            aria-label="Winking Star home"
          >
            <Logo size={40} />
            <span className="text-lg font-black text-earthy-cocoa sm:text-xl">Winking Star</span>
          </Link>
          <Link
            to="/signin"
            className="rounded-pill text-sm font-extrabold text-earthy-cocoaSoft underline underline-offset-4 transition-colors hover:text-earthy-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 sm:text-base"
          >
            Sign in
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)] lg:gap-14 lg:py-10">
          <div className="order-2 hidden min-w-0 lg:order-1 lg:block">
            <ProductPreview key={`desktop-${previewVariant}`} variant={previewVariant} className="mx-auto max-w-[560px]" />
          </div>

          <div className="order-1 text-center lg:order-2 lg:text-left">
            <div className="mx-auto mb-6 max-w-md lg:hidden">
              <ProductPreview key={`mobile-${previewVariant}`} compact variant={previewVariant} />
            </div>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-normal text-earthy-cocoa sm:text-5xl">
              Meet your weekly superstar.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-earthy-cocoaSoft sm:text-lg lg:mx-0">
              <span className="block text-xl font-black leading-snug text-earthy-cocoa sm:text-2xl">
                A family achievement board.
              </span>
              <span className="mt-3 block">
                Open the weekly chart, switch superstars, and keep today&apos;s stars moving with your child nearby.
              </span>
            </p>
            <TrustPills align="start" className="mt-6 justify-center lg:justify-start" />
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-earthy-cocoaSoft sm:text-xs">
              Web app · Also available on iPhone
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 lg:mx-0">
              <Link
                to="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-pill bg-earthy-cocoa px-6 py-4 text-base font-bold text-earthy-ivory shadow-earthy-soft transition-all hover:-translate-y-0.5 hover:bg-earthy-cocoaDark active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
              >
                Create a family board <span aria-hidden="true">▶</span>
              </Link>
              <Link
                to="/signup?guest=1"
                className="rounded-pill text-center text-sm font-extrabold text-earthy-cocoaSoft underline underline-offset-4 transition-colors hover:text-earthy-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
              >
                Try it first. No sign-up needed.
              </Link>
            </div>

            <p className="mt-8 text-xs text-earthy-cocoaSoft/75">
              Got an invite link? Tap it and sign in to join.
            </p>
            <p className="mt-3 text-[11px] font-bold text-earthy-cocoaSoft/70">
              <Link to="/privacy" className="underline underline-offset-2 hover:text-earthy-cocoa">Privacy</Link>
              {' · '}
              <Link to="/terms" className="underline underline-offset-2 hover:text-earthy-cocoa">Terms</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
