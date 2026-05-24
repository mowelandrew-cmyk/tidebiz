import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
}

export default function Login() {
  const { logIn, logInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await logIn(email, password)
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await logInWithGoogle()
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0e0e0c' }}>
      <motion.div
        className="w-full max-w-sm"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <motion.div variants={item} className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #3655e5 100%)' }}
            >
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-xl" style={{ color: '#f0ede6', letterSpacing: '-0.03em' }}>
              TideBiz
            </span>
          </div>
          <p className="text-sm" style={{ color: '#57534e' }}>Your business hub, built for you</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={item} className="space-y-1.5">
            <label className="section-label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={item} className="space-y-1.5">
            <label className="section-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </motion.div>

          {error && (
            <motion.p
              className="text-sm text-center"
              style={{ color: '#f43f5e' }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}

          <motion.div variants={item}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </motion.div>
        </form>

        <motion.div variants={item} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 text-xs" style={{ background: '#0e0e0c', color: '#3d3a35' }}>or</span>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <button
            onClick={handleGoogle}
            className="btn-secondary flex items-center justify-center gap-3"
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </motion.div>

        <motion.p variants={item} className="text-center text-sm mt-6" style={{ color: '#57534e' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="hover:underline" style={{ color: '#4a6cf7' }}>Sign up</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
