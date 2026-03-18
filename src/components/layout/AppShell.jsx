import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FiGrid, FiBook, FiClipboard, FiTruck, FiSettings, FiLogOut, FiSun, FiMoon, FiMenu, FiSearch, FiUsers } from 'react-icons/fi';

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('light');
  };

  const navItems = [
    { to: '/dashboard', icon: FiGrid, label: 'Dash', title: 'Dashboard' },
    { to: '/manuals', icon: FiBook, label: 'Manuals', title: 'Manuals' },
    { to: '/logbooks', icon: FiClipboard, label: 'Logs', title: 'Logbooks' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ to: '/fleet', icon: FiTruck, label: 'Fleet', title: 'Fleet Management' });
    navItems.push({ to: '/users', icon: FiUsers, label: 'Users', title: 'User Management' });
  }

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pilot: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ame: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const roleLabels = { admin: 'Admin', pilot: 'Pilot', ame: 'AME' };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-[56px] flex items-center justify-between px-4 lg:px-6 border-b shrink-0 z-50"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>✈</div>
            <span className="font-mono font-bold text-base" style={{ color: 'var(--color-accent)' }}>A320 MaintSys</span>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--color-accent-green)' }}></span>
              System Online
            </span>
            <select className="px-2 py-1 rounded text-xs font-mono font-semibold border outline-none cursor-pointer"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
              <option>VT-DEM (A320-214)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex relative items-center">
            <FiSearch className="absolute left-3 w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" placeholder="Search ATA..."
              className="pl-9 pr-3 py-1.5 rounded text-xs border outline-none w-44 focus:w-56 transition-all"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg border transition-colors hover:border-[var(--color-accent)]"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            {darkMode ? <FiSun className="w-4 h-4" style={{ color: 'var(--color-accent-yellow)' }} /> :
              <FiMoon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
              style={{ background: 'var(--color-accent)', color: '#fff' }}>
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{profile?.name || 'User'}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${roleColors[profile?.role] || ''}`}>
                {roleLabels[profile?.role] || '—'}
              </span>
              {profile?.employee_id && (
                <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{profile.employee_id}</div>
              )}
            </div>
            <button onClick={signOut} className="p-1.5 rounded transition-colors hover:text-[var(--color-accent-red)]"
              style={{ color: 'var(--color-text-muted)' }} title="Logout">
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative w-[68px] h-[calc(100vh-56px)] border-r flex flex-col justify-between py-3 z-40 transition-transform duration-200`}
          style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}>
          <nav className="flex flex-col items-center gap-2">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} title={item.title}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-all text-[10px] font-semibold uppercase tracking-wide
                  ${isActive
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:text-[var(--color-text-primary)]'}`
                }
                style={({ isActive }) => isActive ? { background: 'rgba(47,128,237,0.12)', boxShadow: 'inset 3px 0 0 var(--color-accent)' } : {}}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col items-center gap-2">
            <NavLink to="/settings" title="Settings"
              className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 border border-transparent transition-all text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:text-[var(--color-text-primary)]">
              <FiSettings className="w-5 h-5" />
              <span>Config</span>
            </NavLink>
          </div>
        </aside>

        {/* Backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Disclaimer */}
      <div className="h-6 shrink-0 flex items-center justify-center text-[10px] border-t"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        ⚠️ DISCLAIMER: Simulated data for educational purposes only — Not official Airbus documentation
      </div>
    </div>
  );
}
