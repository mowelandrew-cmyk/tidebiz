import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

export function useReminders() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'reminders'),
      orderBy('date', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('useReminders snapshot error:', err)
      setLoading(false)
    })
    return unsub
  }, [user])

  async function addReminder(data) {
    await addDoc(collection(db, 'users', user.uid, 'reminders'), {
      ...data,
      done: false,
      createdAt: serverTimestamp(),
    })
  }

  async function editReminder(id, data) {
    await updateDoc(doc(db, 'users', user.uid, 'reminders', id), data)
  }

  async function removeReminder(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'reminders', id))
  }

  async function toggleDone(id, current) {
    await updateDoc(doc(db, 'users', user.uid, 'reminders', id), { done: !current })
  }

  return { reminders, loading, addReminder, editReminder, removeReminder, toggleDone }
}
