import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ManualsPage from '@/pages/ManualsPage';
import LogbooksPage from '@/pages/LogbooksPage';
import FleetPage from '@/pages/FleetPage';
import UserManagementPage from '@/pages/UserManagementPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[var(--color-text-muted)] font-mono text-sm">Loading system...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[var(--color-text-muted)] font-mono text-sm">A320 MaintSys</p>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="manuals" element={<ManualsPage />} />
        <Route path="logbooks" element={<LogbooksPage />} />
        <Route path="fleet" element={<ProtectedRoute allowedRoles={['admin']}><FleetPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
