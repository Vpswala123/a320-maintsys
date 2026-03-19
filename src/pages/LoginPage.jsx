import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const ROLES = [
  { id: 'pilot', label: 'Pilot', icon: '✈', subtitle: 'Aircraft Pilot' },
  { id: 'ame', label: 'AME', icon: '🔧', subtitle: 'Maintenance Engineer' },
  { id: 'admin', label: 'Admin', icon: '🏢', subtitle: 'Company / Airline' }
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (!selectedRole) { setError('Please select your role first'); return }
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-panel-2)] to-[var(--bg-primary)] opacity-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-blue)]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent-cyan)]/5 blur-[120px] rounded-full" />

      {/* Top status bar style */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-panel-2)] border border-[var(--border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[10px] font-mono text-[var(--success)] font-bold tracking-widest">SYSTEM ONLINE</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-tighter">SECURE NODE: 127.0.0.1</span>
        </div>
        <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          A320 MaintSys <span className="text-[var(--text-secondary)]">v4.2.0</span>
        </div>
      </div>

      {/* Login panel */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 animate-slide-up">
        <div className="panel p-10 bg-[var(--bg-panel)]/80 backdrop-blur-2xl border-[var(--border-light)] shadow-2xl relative">
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20">
            <div className="absolute top-4 right-4 w-8 h-[1px] bg-[var(--accent-blue)]" />
            <div className="absolute top-4 right-4 w-[1px] h-8 bg-[var(--accent-blue)]" />
          </div>

          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 mb-4 rounded border border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10">
              <span className="text-[10px] font-bold text-[var(--accent-blue)] tracking-[0.4em] uppercase">Engineering Desktop</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-[var(--text-primary)]">
              A320 <span className="text-[var(--accent-blue)]">MaintSys</span>
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-mono uppercase tracking-[0.2em] leading-relaxed">
              Unified Maintenance & Engineering Interface
            </p>
          </div>

          {/* Role Selection Grid */}
          <div className="space-y-4 mb-8">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block pl-1">
              Authentication Context
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded border transition-all duration-300 group
                    ${selectedRole === role.id
                      ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/10'
                      : 'border-[var(--border)] bg-[var(--bg-panel-2)]/50 text-[var(--text-muted)] hover:border-[var(--border-light)]'
                    }`}
                >
                  <span className={`text-xl group-hover:scale-110 transition-transform ${selectedRole === role.id ? 'opacity-100' : 'opacity-60'}`}>
                    {role.icon}
                  </span>
                  <div className="text-center">
                    <span className={`text-[10px] font-bold block leading-none ${selectedRole === role.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {role.label.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Entry Section */}
          <div className={`overflow-hidden transition-all duration-500 ${selectedRole ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={handleLogin} className="space-y-5 pt-2">
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter Employee ID / Email"
                    required
                    className="w-full bg-[var(--bg-panel-2)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text-primary)] font-mono text-xs focus:border-[var(--accent-blue)] outline-none transition-all placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Security Key"
                    required
                    className="w-full bg-[var(--bg-panel-2)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text-primary)] font-mono text-xs focus:border-[var(--accent-blue)] outline-none transition-all placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 rounded bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-[10px] font-bold tracking-tight animate-shake flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[var(--error)]" />
                  {error.toUpperCase()}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 btn-primary font-bold tracking-[0.3em] text-[11px] uppercase shadow-lg shadow-[var(--accent-blue)]/10"
              >
                {loading ? 'Authenticating...' : 'Access Terminal →'}
              </button>
            </form>
          </div>

          {!selectedRole && (
            <div className="py-6 text-center">
              <p className="text-[10px] font-mono text-[var(--text-muted)] animate-pulse">
                WAITING FOR ROLE SELECTION...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10 px-6">
        <div className="max-w-md mx-auto">
          <p className="text-[var(--text-muted)] text-[9px] font-mono uppercase tracking-[0.1em] leading-relaxed opacity-60">
            Unauthorized access prohibited. All terminal activity is recorded under aviation security protocols.
            <br />
            ISO 9001:2015 & EASA PART-145 COMPLIANT INTERFACE
          </p>
        </div>
      </div>
    </div>
  );
}
