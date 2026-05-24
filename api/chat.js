const LIMITS = { free: 20, pro: 100, max: 200 }

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`

function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

async function verifyToken(idToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )
  const data = await res.json()
  if (!res.ok || !data.users?.[0]) throw new Error('Unauthorized')
  return data.users[0].localId
}

function parseDoc(doc) {
  const result = {}
  for (const [key, val] of Object.entries(doc.fields ?? {})) {
    if (val.stringValue !== undefined) result[key] = val.stringValue
    else if (val.integerValue !== undefined) result[key] = Number(val.integerValue)
    else if (val.doubleValue !== undefined) result[key] = Number(val.doubleValue)
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue
  }
  return result
}

async function getDoc(path, idToken) {
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!res.ok) return {}
  return parseDoc(await res.json())
}

async function patchDoc(path, idToken, fields) {
  const fsFields = {}
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') fsFields[k] = { stringValue: v }
    else if (typeof v === 'number') fsFields[k] = { integerValue: String(Math.round(v)) }
  }
  const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&')
  await fetch(`${FIRESTORE_BASE}/${path}?${mask}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fsFields }),
  })
}

function buildSystemPrompt({ displayName = 'there', entries = [], journalEntries = [], reminders = [] }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  let prompt = `You are a sharp, supportive business assistant for ${displayName}, a young entrepreneur using TideBiz. Today is ${today}. Be concise, warm, and actionable — tailor all advice to their actual data. Never make up numbers not present in their data.`

  if (entries.length) {
    const rev = entries.filter(e => e.type === 'revenue')
    const exp = entries.filter(e => e.type === 'expense')
    const totalRev = rev.reduce((s, e) => s + (Number(e.amount) || 0), 0)
    const totalExp = exp.reduce((s, e) => s + (Number(e.amount) || 0), 0)
    prompt += `\n\n## Business Logs\nRevenue: ${totalRev.toFixed(2)} | Expenses: ${totalExp.toFixed(2)} | Net: ${(totalRev - totalExp).toFixed(2)}\nRecent entries:`
    entries.slice(0, 25).forEach(e => {
      prompt += `\n- [${e.type}] ${e.title}: ${e.amount} ${e.currency ?? ''}${e.date ? ` (${e.date})` : ''}${e.description ? ` — ${e.description}` : ''}`
    })
  }

  if (journalEntries.length) {
    prompt += `\n\n## Journal Entries`
    journalEntries.slice(0, 10).forEach(e => {
      const text = (e.content ?? '').replace(/<[^>]*>/g, '').slice(0, 400)
      prompt += `\n\n**${e.title ?? 'Untitled'}**${e.date ? ` (${e.date})` : ''}: ${text}`
    })
  }

  const todayKey = new Date().toISOString().slice(0, 10)
  const upcoming = reminders.filter(r => !r.done && r.date >= todayKey)
  if (upcoming.length) {
    prompt += `\n\n## Upcoming Reminders`
    upcoming.slice(0, 10).forEach(r => {
      prompt += `\n- ${r.date}${r.time ? ` at ${r.time}` : ''}: ${r.title}${r.note ? ` (${r.note})` : ''}`
    })
  }

  return prompt
}

async function callGemini(messages, systemPrompt) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Gemini error')
  return data.candidates[0].content.parts[0].text
}

async function callClaude(messages, systemPrompt, plan) {
  const model = plan === 'max' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001'
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic error')
  return data.content[0].text
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { idToken, messages, context } = req.body

    const uid = await verifyToken(idToken)
    const profile = await getDoc(`users/${uid}`, idToken)
    const plan = profile.plan ?? 'free'
    const limit = LIMITS[plan] ?? 20

    const weekStart = getWeekStart()
    const storedWeekStart = profile.chatWeekStart ?? 0
    const currentCount = storedWeekStart === weekStart ? (profile.chatCount ?? 0) : 0

    if (currentCount >= limit) {
      return res.status(429).json({ error: 'Weekly message limit reached.' })
    }

    const systemPrompt = buildSystemPrompt(context ?? {})

    const reply = plan === 'free'
      ? await callGemini(messages, systemPrompt)
      : await callClaude(messages, systemPrompt, plan)

    await patchDoc(`users/${uid}`, idToken, {
      chatCount: currentCount + 1,
      chatWeekStart: weekStart,
    })

    res.status(200).json({ reply, remaining: limit - (currentCount + 1) })
  } catch (err) {
    console.error(err)
    if (err.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' })
    res.status(500).json({ error: 'Something went wrong.' })
  }
}
