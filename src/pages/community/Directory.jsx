import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  collection, query, onSnapshot, addDoc, serverTimestamp,
  doc, setDoc, getDoc, orderBy, limit,
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { ArrowLeft, Send, Users, MessageSquare, Zap, Star, Search } from 'lucide-react'

const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#facc15', '#f87171']

const CARD = {
  background: '#1d1d1a',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 1px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.035)',
}

function Avatar({ name, color, size = 40 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: color || COLORS[0], color: '#0e0e0c', fontSize: size <= 28 ? 10 : 13 }}
    >
      {initials}
    </div>
  )
}

function timeAgo(ts) {
  if (!ts?.toMillis) return 'just now'
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function getDmId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

const PLAN_BADGE = {
  pro: { label: 'Pro', Icon: Star },
  max: { label: 'Max', Icon: Zap },
}

export default function Directory() {
  const { user, userProfile } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState('')
  const [dmOpen, setDmOpen] = useState(false)
  const [dmUser, setDmUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const msgEndRef = useRef(null)
  const dmUnsub = useRef(null)

  const me = {
    displayName: userProfile?.displayName || user?.displayName || 'User',
    avatarColor: userProfile?.avatarColor || COLORS[0],
  }

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(100))
    return onSnapshot(q, snap => {
      setAllUsers(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== user.uid)
      )
    })
  }, [user.uid])

  useEffect(() => {
    if (dmOpen) msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, dmOpen])

  const filtered = search
    ? allUsers.filter(u => u.displayName?.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  async function openDm(otherUser) {
    setDmUser(otherUser)
    setMessages([])
    setDmOpen(true)
    setMsgText('')

    const dmId = getDmId(user.uid, otherUser.id)
    const dmRef = doc(db, 'dms', dmId)
    const snap = await getDoc(dmRef)
    if (!snap.exists()) {
      await setDoc(dmRef, {
        participants: [user.uid, otherUser.id],
        participantNames: {
          [user.uid]: me.displayName,
          [otherUser.id]: otherUser.displayName || 'User',
        },
        participantColors: {
          [user.uid]: me.avatarColor,
          [otherUser.id]: otherUser.avatarColor || COLORS[0],
        },
        lastMessage: null,
        lastAt: null,
      })
    }

    if (dmUnsub.current) dmUnsub.current()
    const q = query(
      collection(db, 'dms', dmId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    dmUnsub.current = onSnapshot(q, s =>
      setMessages(s.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }

  function closeDm() {
    if (dmUnsub.current) { dmUnsub.current(); dmUnsub.current = null }
    setDmOpen(false)
    setDmUser(null)
    setMessages([])
  }

  async function sendMessage() {
    const text = msgText.trim()
    if (!text || sending) return
    setSending(true)
    setMsgText('')
    const dmId = getDmId(user.uid, dmUser.id)
    try {
      await addDoc(collection(db, 'dms', dmId, 'messages'), {
        uid: user.uid,
        content: text,
        createdAt: serverTimestamp(),
      })
      await setDoc(
        doc(db, 'dms', dmId),
        { lastMessage: text, lastAt: serverTimestamp() },
        { merge: true }
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* ── Directory list ── */}
      <div className="px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: '#57534e' }}
          />
          <input
            className="input-field text-sm pl-9"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.15)' }}
              animate={{
                y: [0, -6, 0],
                boxShadow: [
                  '0 0 0 0 rgba(74,108,247,0)',
                  '0 10px 24px rgba(74,108,247,0.18)',
                  '0 0 0 0 rgba(74,108,247,0)',
                ],
              }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Users className="w-5 h-5" style={{ color: '#4a6cf7' }} />
            </motion.div>
            <p className="text-sm" style={{ color: '#57534e' }}>
              {search ? 'No users match that name.' : 'No other users yet.'}
            </p>
          </motion.div>
        )}

        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map(u => {
            const badge = PLAN_BADGE[u.plan]
            return (
              <motion.div
                key={u.id}
                className="rounded-xl p-3 flex items-center gap-3"
                style={CARD}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                <Avatar name={u.displayName} color={u.avatarColor} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f0ede6' }}>
                    {u.displayName || 'User'}
                  </p>
                  {badge && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <badge.Icon className="w-3 h-3" style={{ color: '#4a6cf7' }} />
                      <p className="text-xs" style={{ color: '#57534e' }}>{badge.label}</p>
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={() => openDm(u)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  style={{
                    background: 'rgba(74,108,247,0.1)',
                    border: '1px solid rgba(74,108,247,0.25)',
                    color: '#4a6cf7',
                  }}
                  whileHover={{ background: 'rgba(74,108,247,0.18)' }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.1 }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </motion.button>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ── DM overlay ── */}
      <AnimatePresence>
        {dmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: '#0e0e0c' }}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* DM Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <motion.button
                onClick={closeDm}
                className="cursor-pointer mr-1"
                style={{ color: '#57534e' }}
                whileHover={{ color: '#f0ede6' }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <Avatar name={dmUser?.displayName} color={dmUser?.avatarColor} size={32} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f0ede6' }}>
                  {dmUser?.displayName || 'User'}
                </p>
                {PLAN_BADGE[dmUser?.plan] && (
                  <p className="text-xs capitalize" style={{ color: '#57534e' }}>{dmUser.plan} plan</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {messages.length === 0 && (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(74,108,247,0.08)', border: '1px solid rgba(74,108,247,0.15)' }}
                    animate={{
                      y: [0, -6, 0],
                      boxShadow: [
                        '0 0 0 0 rgba(74,108,247,0)',
                        '0 10px 24px rgba(74,108,247,0.18)',
                        '0 0 0 0 rgba(74,108,247,0)',
                      ],
                    }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <MessageSquare className="w-5 h-5" style={{ color: '#4a6cf7' }} />
                  </motion.div>
                  <p className="text-sm" style={{ color: '#57534e' }}>
                    Say hello to {dmUser?.displayName}!
                  </p>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map(m => {
                  const isMe = m.uid === user.uid
                  return (
                    <motion.div
                      key={m.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div
                        className="max-w-[75%] px-4 py-2.5 text-sm leading-relaxed"
                        style={
                          isMe
                            ? {
                                background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)',
                                color: '#fff',
                                borderRadius: '14px 14px 4px 14px',
                                boxShadow: '0 2px 12px rgba(74,108,247,0.25)',
                              }
                            : {
                                background: '#1d1d1a',
                                color: '#ccc9c2',
                                borderRadius: '4px 14px 14px 14px',
                                border: '1px solid rgba(255,255,255,0.07)',
                              }
                        }
                      >
                        <p>{m.content}</p>
                        <p
                          className="text-[10px] mt-1"
                          style={{ color: isMe ? 'rgba(255,255,255,0.5)' : '#3d3a35' }}
                        >
                          {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={msgEndRef} />
            </div>

            {/* Input */}
            <div
              className="shrink-0 px-4 py-3 flex gap-2 items-center"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <input
                className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{
                  background: '#1d1d1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ccc9c2',
                }}
                placeholder={`Message ${dmUser?.displayName || 'User'}…`}
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!msgText.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)' }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <Send className="w-4 h-4" style={{ color: '#fff' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
