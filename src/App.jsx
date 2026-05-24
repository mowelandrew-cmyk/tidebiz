import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Logs from './pages/Logs'
import Journal from './pages/Journal'
import Chat from './pages/Chat'
import Community from './pages/Community'
import Settings from './pages/Settings'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}

const pageTransition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Always-public auth pages */}
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route
          path="/onboarding"
          element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
        />
        {/* Smart root: Landing for guests, AppShell for authenticated users */}
        <Route path="/*" element={<RootOrApp />} />
      </Routes>
    </AuthProvider>
  )
}

/**
 * Gate component — shows Landing for unauthenticated visitors,
 * routes authenticated users into the full AppShell.
 */
function RootOrApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e0e0c' }}>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: '#4a6cf7',
            boxShadow: '0 0 12px rgba(74,108,247,0.8)',
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      </div>
    )
  }

  if (!user) return <Landing />

  return <AppShell />
}

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  )
}

function AppShell() {
  const { userProfile } = useAuth()
  const location = useLocation()
  const isChat = location.pathname === '/chat'

  if (!userProfile?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0e0e0c' }}>
      <main className={`flex-1 ${isChat ? 'overflow-hidden flex flex-col' : 'overflow-y-auto pb-20'}`}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"          element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/logs"      element={<PageWrapper><Logs /></PageWrapper>} />
            <Route path="/journal"   element={<PageWrapper><Journal /></PageWrapper>} />
            <Route path="/chat"      element={<PageWrapper><Chat /></PageWrapper>} />
            <Route path="/community" element={<PageWrapper><Community /></PageWrapper>} />
            <Route path="/settings"  element={<PageWrapper><Settings /></PageWrapper>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
