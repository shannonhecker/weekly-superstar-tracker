import { Component, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useI18n } from './lib/i18n'
import LogoLoader from './components/LogoLoader'

// Localized fallback for the error boundary. Functional so it can use the
// i18n hook (the boundary itself must be a class). Rendered inside
// I18nProvider, so useI18n resolves.
function ErrorFallback() {
  const { t } = useI18n()
  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-5 bg-earthy-ivory font-jakarta">
      <div className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider max-w-md w-full text-center p-8">
        <h1 className="font-extrabold text-earthy-cocoa text-2xl mb-2">{t('error.title')}</h1>
        <p className="text-earthy-cocoaSoft text-sm mb-5">{t('error.body')}</p>
        <button
          type="button"
          onClick={() => { window.location.reload() }}
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="px-5 py-3 rounded-pill font-bold text-sm hover:bg-earthy-cocoaDark active:scale-[0.99] transition-all"
        >
          {t('error.reload')}
        </button>
      </div>
    </main>
  )
}

// Catches render-time throws from any route. Suspense (below) only catches
// thrown promises for lazy chunks; it does NOT catch synchronous errors.
// Without this, a missing import or other render error white-screens the
// whole tree (PR #58 had a real-world version of that). Class component
// because React's only error-boundary primitive is class-based.
class RouteErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[Route] uncaught render error', error, info)
  }
  render() {
    if (this.state.error) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// Lazy import that recovers from a stale chunk after a deploy. A failed dynamic
// import (an old chunk hash 404s once a new deploy lands) reloads the page once
// to fetch the fresh bundle instead of dropping the user on the error boundary.
// sessionStorage guards against a reload loop on a genuinely broken chunk.
function lazyWithReload(importFn) {
  return lazy(() =>
    importFn()
      .then((mod) => {
        sessionStorage.removeItem('ws:chunkReloaded')
        return mod
      })
      .catch((err) => {
        if (!sessionStorage.getItem('ws:chunkReloaded')) {
          sessionStorage.setItem('ws:chunkReloaded', '1')
          window.location.reload()
          return new Promise(() => {})
        }
        throw err
      }),
  )
}

// Route components are lazy-imported so each route only ships its own
// JS on first paint. The signin page no longer drags in Board's deps,
// the Board page no longer drags in PrintSheet's QR code lib, etc.
//
// LogoLoader stays eagerly imported because it's the Suspense fallback
// — needs to be in the initial bundle so the loading state can render
// before any chunk arrives.
const Landing = lazyWithReload(() => import('./pages/Landing'))
const LandingV2 = lazyWithReload(() => import('./pages/LandingV2'))
const SignIn = lazyWithReload(() => import('./pages/SignIn'))
const SignUp = lazyWithReload(() => import('./pages/SignUp'))
const ForgotPassword = lazyWithReload(() => import('./pages/ForgotPassword'))
const AuthAction = lazyWithReload(() => import('./pages/AuthAction'))
const Join = lazyWithReload(() => import('./pages/Join'))
const Board = lazyWithReload(() => import('./pages/Board'))
const PrintSheet = lazyWithReload(() => import('./pages/PrintSheet'))
const StyleGuide = lazyWithReload(() => import('./pages/StyleGuide'))
const Privacy = lazyWithReload(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })))
const Terms = lazyWithReload(() => import('./pages/Legal').then((m) => ({ default: m.Terms })))

// Dev-only peek routes. These render presentational mocks of Board / Pet /
// Reward at phone-bezel dimensions so we can screenshot them for the signup
// wizard's banner peek slot. They bypass auth + Firestore — feeding the live
// components fakes was more invasive than rendering visually-faithful stubs.
// Lazy-loaded like the other routes, and only registered when
// `import.meta.env.DEV` so production builds don't ship them.
const PeekBoard = lazyWithReload(() => import('./dev/peek/PeekBoard'))
const PeekPet = lazyWithReload(() => import('./dev/peek/PeekPet'))
const PeekReward = lazyWithReload(() => import('./dev/peek/PeekReward'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LogoLoader />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

export default function App() {
  const protectedBoard = (
    <ProtectedRoute>
      <Board />
    </ProtectedRoute>
  )

  return (
    // Single Suspense at the route boundary — same fallback the auth
    // gate uses, so the transition between "checking auth" and "loading
    // route chunk" feels continuous instead of flashing.
    <Suspense fallback={<LogoLoader />}>
      {/* Skip-to-main link — visually hidden until focused. Pages that
          want to be a target for it wrap their primary content in
          `<main id="main">`. Audit A5. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-earthy-cocoa focus:text-earthy-cream focus:rounded-pill focus:font-bold focus:shadow-earthy-pop"
      >
        Skip to main content
      </a>
      <RouteErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing-v2" element={<LandingV2 />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/action" element={<AuthAction />} />
        <Route path="/join/:code" element={<Join />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/board/:boardId"
          element={protectedBoard}
        />
        <Route
          path="/board/:boardId/activity"
          element={protectedBoard}
        />
        <Route
          path="/board/:boardId/treasure"
          element={protectedBoard}
        />
        <Route
          path="/board/:boardId/progress"
          element={protectedBoard}
        />
        <Route
          path="/board/:boardId/more"
          element={protectedBoard}
        />
        <Route
          path="/board/:boardId/print/:kidId"
          element={
            <ProtectedRoute>
              <PrintSheet />
            </ProtectedRoute>
          }
        />
        <Route path="/style-guide" element={<StyleGuide />} />
        {import.meta.env.DEV && (
          <>
            <Route path="/dev/peek/board" element={<PeekBoard />} />
            <Route path="/dev/peek/pet" element={<PeekPet />} />
            <Route path="/dev/peek/reward" element={<PeekReward />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </RouteErrorBoundary>
    </Suspense>
  )
}
