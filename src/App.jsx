import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import AuthAction from './pages/AuthAction'
import Join from './pages/Join'
import Board from './pages/Board'
import PrintSheet from './pages/PrintSheet'
import LogoLoader from './components/LogoLoader'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LogoLoader />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

export default function App() {
  return (
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
