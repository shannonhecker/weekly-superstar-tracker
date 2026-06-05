import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { findUserBoards } from '../lib/boards'
import Logo from '../components/Logo'
import LogoLoader from '../components/LogoLoader'
import LocaleSelectorButton from '../components/LocaleSelectorButton'
import AnimatedRasterBanner from '../components/AnimatedRasterBanner'
import { useI18n } from '../lib/i18n'

// Sibling Landing prototype — full-bleed marketing shell on cream (#FCEEE1)
// matching the wizard background. Lives at /landing-v2 so the live `/` route
// stays on the existing Landing while we iterate on this direction. See
// project hard rule: hero rewrites are high-risk by default — prototype in
// a sibling page before touching live index/landing.
//
// PR-3 of the desktop tiered layout plan. Promotion to `/` is a separate
// follow-up PR (PR-3b) requiring explicit user go.
export default function LandingV2() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const [boardId, setBoardId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    let cancelled = false
    ;(async () => {
      const boards = await findUserBoards(user.uid)
      if (cancelled) return
      if (boards.length > 0) setBoardId(boards[0].id)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [user])

  if (loading || (user && checking)) return <LogoLoader />
  if (user && boardId) return <Navigate to={`/board/${boardId}`} replace />

  return (
    <main
      id="main"
      className="min-h-screen flex flex-col font-jakarta"
      style={{ backgroundColor: '#FCEEE1' }}
    >
      <nav className="flex items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <span className="text-lg sm:text-xl font-extrabold text-earthy-cocoa">
            {t('brand.name')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSelectorButton compact />
          <Link
            to="/signin"
            className="text-sm sm:text-base font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa underline underline-offset-2 transition-colors"
          >
            {t('nav.signIn')}
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-5 sm:px-8 pt-4 pb-8 text-center">
        <div className="w-full">
          <AnimatedRasterBanner
            source="/onboarding-art/home-star-hero.png"
            webpSrcSet="/onboarding-art/home-star-hero-376w.webp 376w, /onboarding-art/home-star-hero-768w.webp 768w, /onboarding-art/home-star-hero-1440w.webp 1440w"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 768px, 1280px"
            loading="eager"
            accessibilityLabel="Winking Star hero illustration"
            height={400}
            borderRadius={24}
            animated
            effect="sparkles"
          />
        </div>
        <h1 className="mt-8 text-4xl sm:text-5xl font-extrabold tracking-tight text-earthy-cocoa">
          {t('brand.name')}
        </h1>
        <p className="mt-4 text-base sm:text-lg font-bold text-earthy-cocoaSoft leading-relaxed max-w-xl">
          {t('landing.subtitleBody')}
        </p>
        <div className="mt-8 w-full max-w-md space-y-3">
          <Link
            to="/signup"
            style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
            className="block w-full px-6 py-4 rounded-pill font-bold text-base hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
          >
            {t('landing.createBoard')}
          </Link>
          <Link
            to="/signin"
            style={{ color: '#5A3A2E', backgroundColor: '#F4C8A8' }}
            className="block w-full px-6 py-4 rounded-pill font-bold text-base hover:bg-earthy-terracottaSoftHover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2"
          >
            {t('nav.signIn')}
          </Link>
          <Link
            to="/signup?guest=1"
            className="block mt-4 text-sm font-bold text-earthy-cocoaSoft hover:text-earthy-cocoa underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earthy-cocoa focus-visible:ring-offset-2 rounded-pill text-center"
          >
            {t('landing.tryFirst')}
          </Link>
        </div>
      </section>

      <div className="mt-auto px-5 sm:px-8 pb-6 text-center">
        <p className="text-xs text-earthy-cocoaSoft/70">
          {t('landing.invite')}
        </p>
        <p className="mt-3 text-[11px] text-earthy-cocoaSoft/70 font-bold">
          <Link to="/privacy" className="underline underline-offset-2 hover:text-earthy-cocoa">{t('nav.privacy')}</Link>
          {' · '}
          <Link to="/terms" className="underline underline-offset-2 hover:text-earthy-cocoa">{t('nav.terms')}</Link>
        </p>
      </div>
    </main>
  )
}
