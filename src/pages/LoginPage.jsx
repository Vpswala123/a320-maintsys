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
    <div className="min-h-screen bg-[#0b1320] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Hangar background - use CSS gradient to simulate */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1320] via-[#0d1628] to-[#071020] opacity-90" />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <span className="text-green-400 font-mono text-xs flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          SYSTEM ONLINE
        </span>
        <span className="text-[#9ba4b4] font-mono text-xs">A320-200</span>
      </div>

      {/* Login panel */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#111a2e]/90 backdrop-blur border border-[#2f80ed]/30 rounded-xl p-8 shadow-2xl">

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-[#2f80ed] font-semibold text-2xl tracking-widest font-mono">A320 MaintSys</h1>
            <p className="text-[#9ba4b4] text-xs mt-1 tracking-wider">AIRCRAFT MAINTENANCE PLATFORM</p>
          </div>

          {/* Role Selection */}
          <p className="text-[#9ba4b4] text-xs mb-3 font-mono uppercase tracking-wider">Select Your Role</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all
                  ${selectedRole === role.id
                    ? 'border-[#2f80ed] bg-[#2f80ed]/20 text-white'
                    : 'border-[#1f2a3a] bg-[#0b1320]/50 text-[#9ba4b4] hover:border-[#2f80ed]/50'
                  }`}
              >
                <span className="text-2xl">{role.icon}</span>
                <span className="text-xs font-mono font-semibold">{role.label}</span>
                <span className="text-[10px] text-center leading-tight">{role.subtitle}</span>
              </button>
            ))}
          </div>

          {/* Login Form — shows after role selected */}
          {selectedRole && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[#9ba4b4] text-xs font-mono uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@airline.com`}
                  required
                  className="w-full bg-[#0b1320] border border-[#1f2a3a] rounded-lg px-4 py-3 text-[#dce6f2] font-mono text-sm focus:border-[#2f80ed] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[#9ba4b4] text-xs font-mono uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0b1320] border border-[#1f2a3a] rounded-lg px-4 py-3 text-[#dce6f2] font-mono text-sm focus:border-[#2f80ed] focus:outline-none transition-colors"
                />
              </div>
              {error && <p className="text-[#eb5757] text-xs font-mono">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-mono font-semibold text-sm transition-all bg-gradient-to-r from-[#2f80ed] to-[#00d4ff] text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'LOGIN →'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center z-10">
        <p className="text-[#9ba4b4] text-[10px] font-mono">
          Student Demonstration Version — Simulated data for educational purposes only
        </p>
      </div>
    </div>
  )
}
