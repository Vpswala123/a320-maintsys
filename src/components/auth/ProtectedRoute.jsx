import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b1320]">
      <div className="text-[#00d4ff] font-mono text-sm animate-pulse">
        LOADING SYSTEM...
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
