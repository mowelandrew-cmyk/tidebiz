import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useEntries } from './useEntries'
import { useJournalEntries } from './useJournalEntries'
import { useReminders } from './useReminders'

const LIMITS = { free: 20, pro: 100, max: 200 }

function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function serializeEntry(e) {
  return {
    type: e.type,
    title: e.title,
    description: e.description,
    amount: e.amount,
    currency: e.currency,
    date: e.createdAt?.toDate?.()?.toLocaleDateString('en-US') ?? '',
  }
}

function serializeJournal(e) {
  return {
    title: e.title,
    content: e.content,
    date: e.createdAt?.toDate?.()?.toLocaleDateString('en-US') ?? '',
  }
}

export function useChat() {
  const { user, userProfile } = useAuth()
  const { entries } = useEntries()
  const { entries: journalEntries } = useJournalEntries()
  const { reminders } = useReminders()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [error, setError] = useState('')

  const plan = userProfile?.plan ?? 'free'
  const limit = LIMITS[plan] ?? 20

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      const data = snap.data() ?? {}
      const weekStart = getWeekStart()
      const count = data.chatWeekStart === weekStart ? (data.chatCount ?? 0) : 0
      setRemaining(limit - count)
    })
  }, [user, limit])

  async function sendMessage(content) {
    if (!user || loading || remaining === 0) return

    const userMsg = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)
    setError('')

    try {
      const idToken = await user.getIdToken()
      const context = {
        displayName: userProfile?.displayName ?? user.displayName ?? 'there',
        plan,
        entries: entries.slice(0, 50).map(serializeEntry),
        journalEntries: journalEntries.slice(0, 15).map(serializeJournal),
        reminders: reminders.map(r => ({
          title: r.title,
          note: r.note,
          date: r.date,
          time: r.time,
          done: r.done,
        })),
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, messages: nextMessages, context }),
      })

      if (res.status === 429) {
        setError("You've reached your weekly message limit. Resets Sunday.")
        setMessages(messages)
        return
      }
      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
      setRemaining(data.remaining)
    } catch {
      setError('Something went wrong. Please try again.')
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, remaining, limit, plan, error, sendMessage }
}
