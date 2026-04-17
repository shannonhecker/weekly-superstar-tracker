import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './firebase/auth'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Lazy-load every page so the initial bundle is just enough to render
// the landing route. Board + AddKidWizard + ChildTracker (which pull
// in Firestore sync + Fluent emoji + theme library) only load once a
// signed-in user navigates to /board.
const Landing = lazy(() => import('./pages/Landing'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Board = lazy(() => import('./pages/Board'))
const Join = lazy(() => import('./pages/Join'))

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
    <div
      className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"
      aria-label="Loading"
      role="status"
    />
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/join/:code" element={<Join />} />
              <Route path="/board/:boardId" element={<ProtectedRoute><Board /></ProtectedRoute>} />
              <Route path="*" element={<Landing />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
