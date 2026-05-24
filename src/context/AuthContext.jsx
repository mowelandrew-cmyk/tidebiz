import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  deleteUser,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, getDocs, serverTimestamp,
} from 'firebase/firestore'
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
    const [profileResult, docResult] = await Promise.allSettled([
      updateProfile(cred.user, { displayName }),
      setDoc(doc(db, 'users', cred.user.uid), {
        displayName, email, plan: 'free', createdAt: serverTimestamp(),
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

  async function updateDisplayName(name) {
    if (!user) return
    await Promise.all([
      updateProfile(user, { displayName: name }),
      updateDoc(doc(db, 'users', user.uid), { displayName: name }),
    ])
    setUserProfile(prev => ({ ...prev, displayName: name }))
  }

  async function updateAvatarColor(color) {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), { avatarColor: color })
    setUserProfile(prev => ({ ...prev, avatarColor: color }))
  }

  async function updateBio(bio) {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), { bio })
    setUserProfile(prev => ({ ...prev, bio }))
  }

  async function completeOnboarding(data) {
    if (!user) return
    const { displayName, ...rest } = data
    await Promise.allSettled([
      updateProfile(user, { displayName }),
      setDoc(doc(db, 'users', user.uid), {
        displayName,
        ...rest,
        onboardingComplete: true,
      }, { merge: true }),
    ])
    setUserProfile(prev => ({ ...prev, displayName, ...rest, onboardingComplete: true }))
  }

  async function deleteAccount() {
    if (!user) return
    const uid = user.uid
    // Delete all subcollection docs
    for (const sub of ['journal', 'entries', 'reminders']) {
      const snap = await getDocs(collection(db, 'users', uid, sub))
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
    }
    await deleteDoc(doc(db, 'users', uid))
    await deleteUser(user)
  }

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading,
      signUp, logIn, logInWithGoogle, logOut,
      updateDisplayName, updateAvatarColor, updateBio, completeOnboarding, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
