import { useEffect, useMemo, useState } from 'react'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, firebaseConfigured } from '../lib/firebase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(auth))

  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase is not configured')
    return signInWithPopup(auth, new GoogleAuthProvider())
  }

  const signInWithFacebook = async () => {
    if (!auth) throw new Error('Firebase is not configured')
    return signInWithPopup(auth, new FacebookAuthProvider())
  }

  const signInWithEmail = (email, password) => {
    if (!auth) throw new Error('Firebase is not configured')
    return signInWithEmailAndPassword(auth, email, password)
  }

  const createAccountWithEmail = (email, password) => {
    if (!auth) throw new Error('Firebase is not configured')
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const logout = () => (auth ? signOut(auth) : Promise.resolve())

  const isAdmin = useMemo(() => {
    const configuredAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
    return Boolean(user?.email && configuredAdmins.includes(user.email.toLowerCase()))
  }, [user])

  const value = useMemo(
    () => ({ user, loading, isAdmin, firebaseConfigured, signInWithGoogle, signInWithFacebook, signInWithEmail, createAccountWithEmail, logout }),
    [user, loading, isAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

