import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          setUserProfile(snap.exists() ? snap.data() : null)
        } catch {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signUp(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // Use allSettled so a failure in secondary ops never blocks navigation
    const [profileResult, docResult] = await Promise.allSettled([
      updateProfile(cred.user, { displayName }),
      setDoc(doc(db, 'users', cred.user.uid), {
        displayName,
        email,
        plan: 'free',
        createdAt: serverTimestamp(),
      }),
    ])
    if (profileResult.status === 'rejected') console.error('updateProfile failed:', profileResult.reason)
    if (docResult.status === 'rejected') console.error('setDoc failed:', docResult.reason)
  }

  async function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName: cred.user.displayName,
        email: cred.user.email,
        plan: 'free',
        createdAt: serverTimestamp(),
      })
    }
  }

  function logOut() {
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, logIn, logInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
