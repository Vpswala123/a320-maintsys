import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/layout/AppShell';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ManualsPage from '@/pages/ManualsPage';
import LogbooksPage from '@/pages/LogbooksPage';
import FleetPage from '@/pages/FleetPage';
import ARSharePage from '@/pages/ARSharePage';
import UserManagementPage from '@/pages/UserManagementPage';

// Simplified Protected Route for nested layout
function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen font-mono" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Initialising System...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Area with AppShell Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/manuals" element={<ManualsPage />} />
            <Route path="/logbooks" element={<LogbooksPage />} />
            <Route path="/fleet" element={<ProtectedRoute allowedRoles={['admin']}><FleetPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
          </Route>

          <Route path="/ar-share" element={<ARSharePage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
