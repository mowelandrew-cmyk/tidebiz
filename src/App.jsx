import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
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

        {/* Protected app shell */}
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
  const { pathname } = useLocation()
  const isChat = pathname === '/chat'

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
