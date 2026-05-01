import { Component, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LogoLoader from './components/LogoLoader'

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
      return (
        <main id="main" className="min-h-screen flex items-center justify-center px-5 bg-earthy-ivory font-jakarta">
          <div className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider max-w-md w-full text-center p-8">
            <h1 className="font-extrabold text-earthy-cocoa text-2xl mb-2">
              Something went sideways.
            </h1>
            <p className="text-earthy-cocoaSoft text-sm mb-5">
              Refresh the page — and let us know if it keeps happening.
            </p>
            <button
              type="button"
              onClick={() => { window.location.reload() }}
              style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
              className="px-5 py-3 rounded-pill font-bold text-sm hover:bg-[#4A2E25] active:scale-[0.99] transition-all"
            >
              Reload
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

// Route components are lazy-imported so each route only ships its own
// JS on first paint. The signin page no longer drags in Board's deps,
// the Board page no longer drags in PrintSheet's QR code lib, etc.
//
// LogoLoader stays eagerly imported because it's the Suspense fallback
// — needs to be in the initial bundle so the loading state can render
// before any chunk arrives.
const Landing = lazy(() => import('./pages/Landing'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const AuthAction = lazy(() => import('./pages/AuthAction'))
const Join = lazy(() => import('./pages/Join'))
const Board = lazy(() => import('./pages/Board'))
const PrintSheet = lazy(() => import('./pages/PrintSheet'))
const StyleGuide = lazy(() => import('./pages/StyleGuide'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LogoLoader />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

export default function App() {
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
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/action" element={<AuthAction />} />
        <Route path="/join/:code" element={<Join />} />
        <Route
          path="/board/:boardId"
          element={
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          }
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </RouteErrorBoundary>
    </Suspense>
  )
}
