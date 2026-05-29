import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { findUserBoards } from '../lib/boards'
import Logo from '../components/Logo'
import LogoLoader from '../components/LogoLoader'
import MarketingDoodleStage from '../components/MarketingDoodleStage'
import TrustPills from '../components/TrustPills'

const FEATURE_CARDS = [
  {
    title: 'Set the week',
    copy: 'Pick a few routines, goals, or kindness moments your child can see every day.',
  },
  {
    title: 'Celebrate today',
    copy: 'Tap in stars together and make progress feel immediate, warm, and visible.',
  },
  {
    title: 'Keep it together',
    copy: 'One family board works across grown-ups, kids, rewards, pets, and printable charts.',
  },
]

export default function Landing() {
  const { user, loading } = useAuth()
  const [boardId, setBoardId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    let cancelled = false
    ;(async () => {
      const boards = await findUserBoards(user.uid)
      if (cancelled) return
      // Earliest-by-createdAt: the user's original board, not a stray
      // duplicate. findUserBoards already sorts that way.
      if (boards.length > 0) setBoardId(boards[0].id)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [user])

  if (loading || (user && checking)) return <LogoLoader />
  if (user && boardId) return <Navigate to={`/board/${boardId}`} replace />

  return (
    <main id="main" className="min-h-screen bg-earthy-ivory font-jakarta text-earthy-cocoa">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Winking Star home">
          <Logo size={42} />
          <span className="text-lg font-extrabold sm:text-xl">Winking Star</span>
        </Link>
        <Link
          to="/signin"
          className="rounded-pill px-4 py-2 text-sm font-extrabold text-earthy-cocoaSoft transition-colors hover:bg-earthy-cream hover:text-earthy-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 pb-10 pt-4 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:pb-12 lg:pt-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-pill border border-earthy-divider bg-earthy-card px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-earthy-cocoaSoft">
            For ages 3 to 12
          </p>
          <h1 className="text-5xl font-extrabold leading-[0.98] tracking-tight text-earthy-cocoa sm:text-6xl lg:text-7xl">
            Winking Star
          </h1>
          <p className="mt-5 max-w-xl text-lg font-extrabold leading-relaxed text-earthy-cocoa sm:text-xl">
            Turn weekly routines into a star chart your child wants to come back to.
          </p>
          <p className="mt-4 max-w-xl text-base font-bold leading-relaxed text-earthy-cocoaSoft sm:text-lg">
            Build a family board, cheer on small wins, grow pet pals, and keep rewards visible without ads or clutter.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup?guest=1"
              className="inline-flex min-h-[56px] items-center justify-center rounded-pill bg-earthy-cocoa px-7 py-4 text-base font-extrabold text-earthy-cream shadow-earthy-soft transition-all hover:-translate-y-0.5 hover:bg-earthy-cocoaDark active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
            >
              Try a sample board
            </Link>
            <Link
              to="/signup"
              className="inline-flex min-h-[56px] items-center justify-center rounded-pill border-2 border-earthy-cocoa px-7 py-4 text-base font-extrabold text-earthy-cocoa transition-all hover:-translate-y-0.5 hover:bg-earthy-cream active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
            >
              Create account
            </Link>
          </div>

          <TrustPills className="mt-6 max-w-xl" />
        </div>

        <MarketingDoodleStage className="lg:translate-y-1" />
      </section>

      <section className="border-y border-earthy-divider bg-earthy-card/60 px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {FEATURE_CARDS.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-earthy-divider bg-earthy-ivory p-5 shadow-earthy-card"
            >
              <h2 className="text-lg font-extrabold text-earthy-cocoa">{feature.title}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-earthy-cocoaSoft">
                {feature.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="px-5 py-6 text-center text-xs font-bold text-earthy-cocoaSoft sm:px-8">
        <p>
          Got an invite link? Tap it to join your family board.
        </p>
        <p className="mt-3">
          <Link to="/privacy" className="underline underline-offset-2 hover:text-earthy-cocoa">Privacy</Link>
          {' · '}
          <Link to="/terms" className="underline underline-offset-2 hover:text-earthy-cocoa">Terms</Link>
        </p>
      </footer>
    </main>
  )
}
