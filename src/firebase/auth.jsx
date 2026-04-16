import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) { setLoading(false); return }
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signUp = async (email, password, displayName) => {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) await updateProfile(u, { displayName })
    await setDoc(doc(db, 'users', u.uid), {
      email,
      name: displayName || email.split('@')[0],
      createdAt: serverTimestamp(),
    })
    return u
  }

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signInGuest = () => signInAnonymously(auth)
  const signOut = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
