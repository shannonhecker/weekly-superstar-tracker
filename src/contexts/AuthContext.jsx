import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext({ user: null, loading: true })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // Memoize so consumers don't re-render every time AuthProvider does.
  // The previous `value={{ user, loading }}` literal was a fresh object
  // ref on each render, defeating context's stop-propagation.
  const value = useMemo(() => ({ user, loading }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
