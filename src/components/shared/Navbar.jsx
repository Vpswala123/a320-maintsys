import { NavLink } from 'react-router-dom';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

export default function Navbar({ darkMode, toggleTheme, profile, signOut }) {
  const roleColors = {
    admin: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30',
    pilot: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30',
    ame: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30',
  };

  const roleLabels = { admin: 'Admin', pilot: 'Pilot', ame: 'AME' };

  return (
    <nav className="h-[60px] flex items-center justify-between px-6 shrink-0 z-50 transition-all duration-300 backdrop-blur-md bg-[var(--bg-primary)]/90"
      style={{ borderBottom: '1px solid var(--border)' }}>
      
      {/* Left: Logo + System Name */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-blue)] text-lg font-bold shadow-lg transition-all group-hover:border-[var(--accent-blue)]">
            ✈
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-[var(--text-primary)] tracking-tighter uppercase">A320 <span className="text-[var(--accent-blue)]">MaintSys</span></span>
            <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-[0.2em] leading-none uppercase">Virtual Engineering</span>
          </div>
        </div>

        {/* Center-left: Aircraft type + tail number */}
        <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-[var(--border)]">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1 mb-1">Active Fleet</span>
            <div className="flex gap-1.5">
              <select className="bg-[var(--bg-panel-2)] border border-[var(--border)] px-2.5 py-1 rounded text-[10px] font-mono font-bold text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--border-light)] transition-all">
                <option>A320-200</option>
              </select>
              <select className="bg-[var(--bg-panel-2)] border border-[var(--border)] px-2.5 py-1 rounded text-[10px] font-mono font-bold text-[var(--accent-cyan)] outline-none cursor-pointer hover:border-[var(--border-light)] transition-all">
                <option>VT-DEM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Page navigation links */}
      <div className="hidden md:flex items-center gap-1">
        {[
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/manuals', label: 'Manuals' },
          { to: '/logbooks', label: 'Logbooks' },
          { to: '/fleet', label: 'Fleet', adminOnly: true },
          { to: '/users', label: 'Users', adminOnly: true }
        ].map(link => {
          if (link.adminOnly && profile?.role !== 'admin') return null;
          return (
            <NavLink 
              key={link.to}
              to={link.to} 
              className={({isActive}) => `px-5 py-2 rounded text-[10px] uppercase font-bold tracking-widest transition-all
                ${isActive 
                  ? 'bg-[var(--bg-panel)] text-[var(--accent-blue)] border border-[var(--border)] shadow-inner' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)]'
                }`}
            >
              {link.label}
            </NavLink>
          );
        })}
      </div>

      {/* Right: User + role + theme + logout */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-[var(--border)]">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-[var(--text-primary)]">{profile?.name || 'Authorized User'}</span>
            <span className={`text-[9px] px-2 py-0.5 mt-1 rounded border uppercase font-bold tracking-widest ${roleColors[profile?.role] || 'text-[var(--text-muted)] border-[var(--border)]'}`}>
              {roleLabels[profile?.role] || 'RESTRICTED'}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-lg shadow-inner">
            👤
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded hover:bg-[var(--bg-panel)] transition-all text-[var(--text-secondary)] hover:text-[var(--accent-blue)]" title="Toggle Theme">
            {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          <button onClick={signOut} className="w-9 h-9 flex items-center justify-center rounded hover:bg-[var(--bg-panel)] transition-all text-[var(--error)] hover:bg-[var(--error)]/10" title="Sign Out Protocol">
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
