import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export function useEntries() {
  const { user, userProfile } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'max'

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      const now = Date.now()
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const filtered = isPro
        ? all
        : all.filter(e => {
            const ts = e.createdAt?.toMillis?.() ?? 0
            return now - ts <= THIRTY_DAYS
          })
      setEntries(filtered)
      setLoading(false)
    }, err => {
      console.error('useEntries snapshot error:', err)
      setLoading(false)
    })
    return unsub
  }, [user, isPro])

  async function addEntry(data) {
    await addDoc(collection(db, 'users', user.uid, 'entries'), {
      ...data,
      createdAt: serverTimestamp(),
    })
  }

  async function editEntry(id, data) {
    await updateDoc(doc(db, 'users', user.uid, 'entries', id), data)
  }

  async function removeEntry(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'entries', id))
  }

  return { entries, loading, addEntry, editEntry, removeEntry }
}
