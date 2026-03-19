import { NavLink } from 'react-router-dom';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

export default function Navbar({ darkMode, toggleTheme, profile, signOut }) {
  const roleColors = {
    admin: 'bg-[#a855f720] text-[#a855f7] border-[#a855f750]',
    pilot: 'bg-[#2f80ed20] text-[#2f80ed] border-[#2f80ed50]',
    ame: 'bg-[#27ae6020] text-[#27ae60] border-[#27ae6050]',
  };

  const roleLabels = { admin: 'Admin', pilot: 'Pilot', ame: 'AME' };

  return (
    <nav className="h-[56px] flex items-center justify-between px-6 shrink-0 z-50 transition-colors"
      style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
      
      {/* Left: Logo + System Name */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>✈</div>
          <span className="font-mono font-bold text-base text-[var(--accent-blue)] tracking-wider">A320 MaintSys</span>
        </div>

        {/* Center-left: Aircraft type + tail number */}
        <div className="hidden md:flex items-center gap-2">
          <select className="px-2 py-1.5 rounded text-xs font-mono font-semibold outline-none cursor-pointer"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option>A320</option>
          </select>
          <select className="px-2 py-1.5 rounded text-xs font-mono font-semibold outline-none cursor-pointer"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--accent-cyan)' }}>
            <option>VT-DEM</option>
          </select>
        </div>
      </div>

      {/* Center: Page navigation links */}
      <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.05em] font-semibold">
        <NavLink to="/dashboard" className={({isActive}) => `px-4 py-2 rounded transition-all ${isActive ? 'bg-[var(--bg-panel)] text-[var(--accent-cyan)] border border-[var(--border)]' : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'}`}>Dashboard</NavLink>
        <NavLink to="/manuals" className={({isActive}) => `px-4 py-2 rounded transition-all ${isActive ? 'bg-[var(--bg-panel)] text-[var(--accent-cyan)] border border-[var(--border)]' : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'}`}>Manuals</NavLink>
        <NavLink to="/logbooks" className={({isActive}) => `px-4 py-2 rounded transition-all ${isActive ? 'bg-[var(--bg-panel)] text-[var(--accent-cyan)] border border-[var(--border)]' : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'}`}>Logbooks</NavLink>
        {profile?.role === 'admin' && (
          <NavLink to="/fleet" className={({isActive}) => `px-4 py-2 rounded transition-all ${isActive ? 'bg-[var(--bg-panel)] text-[var(--accent-cyan)] border border-[var(--border)]' : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'}`}>Fleet</NavLink>
        )}
      </div>

      {/* Right: User + role + theme + logout */}
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end pt-1">
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.name || 'User'}</span>
            <span className={`text-[9px] px-1.5 py-[1px] mt-0.5 rounded border uppercase font-mono tracking-wider ${roleColors[profile?.role] || 'text-[var(--text-muted)] border-[var(--border)]'}`}>
              {roleLabels[profile?.role] || 'ROLE'}
            </span>
          </div>
          <div className="w-9 h-9 rounded bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-sm">
            👤
          </div>
        </div>
        
        <div className="flex items-center gap-2 border-l pl-5" style={{ borderColor: 'var(--border)' }}>
          <button onClick={toggleTheme} className="p-2 rounded hover:bg-[var(--bg-panel)] transition-colors text-[var(--text-secondary)]" title="Toggle Theme">
            {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          <button onClick={signOut} className="p-2 rounded hover:bg-[var(--bg-panel)] transition-colors text-[var(--error)]" title="Logout">
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
