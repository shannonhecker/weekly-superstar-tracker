import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LogoLoader from './components/LogoLoader'

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
const Try = lazy(() => import('./pages/Try'))
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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/action" element={<AuthAction />} />
        <Route path="/join/:code" element={<Join />} />
        <Route path="/try" element={<Try />} />
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
    </Suspense>
  )
}
