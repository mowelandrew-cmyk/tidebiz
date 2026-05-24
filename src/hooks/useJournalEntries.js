import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export function useJournalEntries() {
  const { user, userProfile } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'max'

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'journal'),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      const now = Date.now()
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const filtered = isPro
        ? all
        : all.filter(e => now - (e.createdAt?.toMillis?.() ?? 0) <= THIRTY_DAYS)
      setEntries(filtered)
      setLoading(false)
    }, err => {
      console.error('useJournalEntries snapshot error:', err)
      setLoading(false)
    })
    return unsub
  }, [user, isPro])

  async function addEntry(title, content) {
    await addDoc(collection(db, 'users', user.uid, 'journal'), {
      title,
      content,
      createdAt: serverTimestamp(),
    })
  }

  async function editEntry(id, title, content) {
    await updateDoc(doc(db, 'users', user.uid, 'journal', id), {
      title,
      content,
      updatedAt: serverTimestamp(),
    })
  }

  async function removeEntry(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'journal', id))
  }

  return { entries, loading, addEntry, editEntry, removeEntry }
}
