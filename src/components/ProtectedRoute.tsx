import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center bg-cream-50"><div className="font-display text-2xl text-forest animate-pulse">Le Grande Haven</div></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
