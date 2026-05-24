import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Logs from './pages/Logs'
import Journal from './pages/Journal'
import Chat from './pages/Chat'
import Community from './pages/Community'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Onboarding — protected but no nav shell */}
        <Route
          path="/onboarding"
          element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
        />

        {/* Main app shell */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

function AppShell() {
  const { userProfile } = useAuth()
  const { pathname } = useLocation()
  const isChat = pathname === '/chat'

  // Send new / un-onboarded users through onboarding first
  if (!userProfile?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      <main className={`flex-1 ${isChat ? 'overflow-hidden flex flex-col' : 'overflow-y-auto pb-20'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
