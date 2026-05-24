import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
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

  return user ? children : <Navigate to="/login" replace />
}
