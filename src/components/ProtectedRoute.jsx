import { Navigate } from 'react-router-dom'
import { useAuth } from '../firebase/auth'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
    <div className="text-4xl animate-pet-bounce">⭐</div>
  </div>
)

export default ProtectedRoute
