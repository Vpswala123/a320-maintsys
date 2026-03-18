import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const DEMO_ACCOUNTS = [
  { id: 'ADM-0001', role: 'admin', label: 'Admin', icon: '🛡️', desc: 'Fleet management, user control, approvals' },
  { id: 'PLT-1001', role: 'pilot', label: 'Pilot', icon: '🛫', desc: 'Flight logs, defect reporting, 3D view' },
  { id: 'AME-2001', role: 'ame', label: 'AME', icon: '🔧', desc: 'Maintenance sessions, task entries, inspections' },
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (account) => {
    setLoading(true);
    setError('');
    try {
      await signIn(account.id.toLowerCase(), 'Demo@1234');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId.trim() || !password.trim()) {
      setError('Please enter Employee ID and Password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(employeeId, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl animate-slide-up">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
            ✈
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            A320 MaintSys
          </h1>
          <p className="text-[10px] mt-1 font-mono tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            VIRTUAL MAINTENANCE & DIGITAL LOGBOOK
          </p>
        </div>

        {/* System Status */}
        <div className="flex items-center justify-center gap-2 mb-5 py-2 rounded-lg" style={{ background: 'rgba(39,174,96,0.06)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-green)' }} />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--color-accent-green)' }}>SYSTEM ONLINE</span>
        </div>

        {/* Demo Account Quick Login */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Quick Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.id} onClick={() => handleDemoLogin(acc)} disabled={loading}
                className="p-3 rounded-xl border text-center transition-all hover:border-[var(--color-accent)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="text-xl mb-1">{acc.icon}</div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{acc.label}</div>
                <div className="text-[8px] mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>{acc.id}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>OR SIGN IN MANUALLY</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {DEMO_ACCOUNTS.map(acc => (
            <button key={acc.role} onClick={() => { setSelectedRole(acc.role); setEmployeeId(acc.id); }}
              className={`py-2 rounded-lg border text-xs font-semibold transition-all ${selectedRole === acc.role ? '' : 'opacity-50'}`}
              style={{
                background: selectedRole === acc.role ? 'rgba(47,128,237,0.1)' : 'var(--color-bg-card)',
                borderColor: selectedRole === acc.role ? 'var(--color-accent)' : 'var(--color-border)',
                color: selectedRole === acc.role ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}>
              {acc.icon} {acc.label}
            </button>
          ))}
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Employee ID
            </label>
            <input value={employeeId} onChange={e => setEmployeeId(e.target.value)}
              placeholder="ADM-0001" className="w-full px-3 py-2.5 rounded-lg border text-xs outline-none font-mono"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(235,87,87,0.08)', border: '1px solid rgba(235,87,87,0.2)' }}>
              <p className="text-xs" style={{ color: 'var(--color-accent-red)' }}>⚠ {error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-[9px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            ⚠️ This system uses simulated data for educational purposes only.<br />
            Not official Airbus documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
