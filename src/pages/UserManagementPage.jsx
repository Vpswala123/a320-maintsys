import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FiPlus, FiRefreshCw, FiX, FiEye, FiEyeOff, FiCheck, FiCopy, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function generateEmployeeId(role) {
  const prefixes = { admin: 'ADM', pilot: 'PLT', ame: 'AME' };
  const prefix = prefixes[role] || 'USR';
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${num}`;
}

function RoleBadge({ role }) {
  const styles = {
    admin: { bg: 'rgba(168,85,247,0.1)', color: '#b983ff', label: 'ADMIN' },
    pilot: { bg: 'rgba(47,128,237,0.1)', color: 'var(--accent-blue)', label: 'PILOT' },
    ame: { bg: 'rgba(39,174,96,0.1)', color: 'var(--success)', label: 'AME' },
  };
  const s = styles[role] || styles.ame;
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-transparent font-mono tracking-wider" 
      style={{ background: s.bg, color: s.color, borderColor: `${s.color}33` }}>
      {s.label}
    </span>
  );
}

export default function UserManagementPage() {
  const { createUser, listUsers, toggleUserActive } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New user form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('ame');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Credentials display after creation
  const [createdCreds, setCreatedCreds] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openNewUserModal = () => {
    const role = 'ame';
    setNewRole(role);
    setNewEmployeeId(generateEmployeeId(role));
    setNewPassword(generatePassword());
    setNewName('');
    setNewLicense('');
    setError('');
    setSuccess('');
    setCreatedCreds(null);
    setShowModal(true);
  };

  const handleRoleChange = (role) => {
    setNewRole(role);
    setNewEmployeeId(generateEmployeeId(role));
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newEmployeeId.trim() || !newPassword) {
      setError('Name, Employee ID, and Password are required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await createUser(newEmployeeId, newPassword, newName, newRole, newLicense);
      setCreatedCreds({ employeeId: newEmployeeId, password: newPassword, name: newName, role: newRole });
      setSuccess(`User "${newName}" created successfully!`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await toggleUserActive(userId, !currentActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
    } catch (err) {
      setError(err.message);
    }
  };

  const copyCredentials = () => {
    if (createdCreds) {
      navigator.clipboard?.writeText(`Employee ID: ${createdCreds.employeeId}\nPassword: ${createdCreds.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[var(--bg-primary)] custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">User Management</h1>
            <p className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider mt-1 uppercase">
              Personnel Directory • {users.length} Registered Accounts
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadUsers} className="p-2.5 rounded border border-[var(--border)] bg-[var(--bg-panel-2)] transition-colors hover:border-[var(--accent-blue)]" title="Refresh List">
              <FiRefreshCw className={`w-4 h-4 text-[var(--text-secondary)] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openNewUserModal} className="btn-primary flex items-center gap-2 px-5 h-10">
              <FiPlus className="w-4 h-4" /> Create User Account
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="panel overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-32">Employee ID</th>
                  <th>Full Name</th>
                  <th className="w-24 text-center">Role</th>
                  <th>License / ID</th>
                  <th className="w-24 text-center">Status</th>
                  <th>Onboarded</th>
                  <th className="w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest">QUERYING USER DATABASE...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <p className="text-xs text-[var(--text-muted)] tracking-widest font-bold">NO USERS REGISTERED IN SYSTEM</p>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--bg-panel-2)]/30 transition-colors">
                      <td><span className="font-mono font-bold text-[var(--accent-blue)] tracking-tighter">{u.employee_id || '—'}</span></td>
                      <td className="font-semibold text-[var(--text-primary)]">{u.name || '—'}</td>
                      <td className="text-center"><RoleBadge role={u.role} /></td>
                      <td><span className="font-mono text-[10px] text-[var(--text-secondary)]">{u.license_number || 'GLOBAL-ID'}</span></td>
                      <td className="text-center">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded border font-mono tracking-wider"
                          style={{
                            background: u.is_active !== false ? 'rgba(39,174,96,0.1)' : 'rgba(235,87,87,0.1)',
                            color: u.is_active !== false ? 'var(--success)' : 'var(--error)',
                            borderColor: u.is_active !== false ? 'rgba(39,174,96,0.2)' : 'rgba(235,87,87,0.2)',
                          }}>
                          {u.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td><span className="font-mono text-[10px] text-[var(--text-muted)]">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span></td>
                      <td className="text-right">
                        <button onClick={() => handleToggleActive(u.id, u.is_active !== false)}
                          className={`p-2 rounded transition-colors hover:bg-[var(--bg-panel-2)] ${u.is_active !== false ? 'text-[var(--success)]' : 'text-[var(--error)]'}`} 
                          title={u.is_active !== false ? 'Deactivate Account' : 'Activate Account'}>
                          {u.is_active !== false ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reference Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="panel p-5 bg-[var(--bg-panel-2)]/50">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" /> Provisioning Protocol
            </h4>
            <ul className="text-[11px] space-y-2.5 text-[var(--text-secondary)] leading-relaxed">
              <li className="flex gap-2">
                <span className="text-[var(--accent-blue)] font-bold font-mono">01.</span>
                <span>Select operational role to calibrate specific access level and permissions.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--accent-blue)] font-bold font-mono">02.</span>
                <span>Credentials are generated algorithmically. Password entropy is forced to high.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--accent-blue)] font-bold font-mono">03.</span>
                <span>Employee ID acts as the unique system identifier for all digital signatures.</span>
              </li>
            </ul>
          </div>

          <div className="panel p-5 bg-[var(--bg-panel-2)]/50">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> Identity Standards
            </h4>
            <div className="space-y-3">
              {[
                { r: 'ADMIN', code: 'ADM-XXXX', color: '#b983ff' },
                { r: 'PILOT', code: 'PLT-XXXX', color: 'var(--accent-blue)' },
                { r: 'ENGINEER', code: 'AME-XXXX', color: 'var(--success)' },
              ].map((std, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-[var(--border)] border-dashed last:border-0 pb-2">
                  <span className="text-[11px] font-bold" style={{ color: std.color }}>{std.r}</span>
                  <span className="text-[11px] font-mono text-[var(--text-primary)]">{std.code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5 bg-[var(--bg-panel-2)]/50">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" /> Security Policy
            </h4>
            <div className="text-[11px] space-y-2 text-[var(--text-secondary)]">
              <div className="p-2 rounded bg-[var(--bg-primary)]/50 border border-[var(--border)]">
                <p className="font-mono text-[10px] leading-tight">
                  SIGNATURE ENFORCEMENT: ALL LOGBOOK ENTRIES REQUIRE VALIDATED EMPLOYEE ID HASH.
                </p>
              </div>
              <p>• Multi-factor authentication recommended for Admin.</p>
              <p>• Temporary passwords valid for first login only.</p>
              <p>• Licensed AME must provide valid Cert number.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { if (!createdCreds) setShowModal(false); }}>
          <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg panel overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-panel-2)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                  {createdCreds ? 'REGISTRATION COMPLETE' : 'PROVISION NEW USER'}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest leading-none">
                  {createdCreds ? 'Access Credentials Generated' : 'System Access Authorization'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--border)] transition-colors">
                <FiX className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {createdCreds ? (
              /* Credentials display window - Premium style */
              <div className="p-6 space-y-5">
                <div className="p-5 rounded border border-[var(--success)]/30 bg-[var(--success)]/5 space-y-4">
                  <div className="flex items-center gap-2 text-[var(--success)] mb-2">
                    <FiCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Security Credentials Generated Successfully</span>
                  </div>
                  
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                    "Transmit these credentials via secure channel. This sequence will be purged from display upon closing this window."
                  </p>

                  <div className="grid grid-cols-1 gap-3 py-4 border-y border-[var(--success)]/20">
                    <div className="flex justify-between items-center bg-[var(--bg-panel-2)]/50 p-2 rounded">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Target Name</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{createdCreds.name}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[var(--bg-panel-2)]/50 p-2 rounded">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Access Code (ID)</span>
                      <span className="text-sm font-mono font-bold text-[var(--accent-blue)]">{createdCreds.employeeId}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[var(--bg-panel-2)]/50 p-2 rounded">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Encryption Key</span>
                      <span className="text-sm font-mono font-bold text-[var(--success)] tracking-widest">{createdCreds.password}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={copyCredentials} className={`flex-1 btn-secondary h-11 flex items-center justify-center gap-2 font-bold tracking-widest transition-all ${copied ? 'border-[var(--success)] text-[var(--success)]' : ''}`}>
                    {copied ? <><FiCheck className="w-4 h-4" /> COPIED TO CLIPBOARD</> : <><FiCopy className="w-4 h-4" /> COPY DATA STRIP</>}
                  </button>
                  <button onClick={() => setShowModal(false)} className="flex-1 btn-primary h-11 font-bold tracking-widest">
                    INITIALIZE LOGIN
                  </button>
                </div>
              </div>
            ) : (
              /* Entry Form */
              <div className="p-6 space-y-5">
                {/* Role Toggles */}
                <div>
                  <label className="label mb-2">ASSIGN OPERATIONAL ROLE</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'pilot', label: 'PILOT', color: 'var(--accent-blue)' },
                      { id: 'ame', label: 'AME', color: 'var(--success)' },
                      { id: 'admin', label: 'ADMIN', color: '#b983ff' },
                    ].map(r => (
                      <button key={r.id} type="button" onClick={() => handleRoleChange(r.id)}
                        className="py-2.5 rounded border-2 text-[10px] font-bold transition-all font-mono tracking-widest"
                        style={{
                          background: newRole === r.id ? `${r.color}15` : 'var(--bg-panel-2)',
                          borderColor: newRole === r.id ? r.color : 'var(--border)',
                          color: newRole === r.id ? r.color : 'var(--text-secondary)',
                        }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">FULL PERSONNEL NAME</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. MARCUS AURELIUS"
                      className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <label className="label">EMPLOYEE ID (SYSTEM ID)</label>
                    <input type="text" value={newEmployeeId} onChange={e => setNewEmployeeId(e.target.value)}
                      className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono font-bold text-[var(--accent-blue)] outline-none" />
                  </div>
                  <div>
                    <label className="label">LICENSE / CERTIFICATE</label>
                    <input type="text" value={newLicense} onChange={e => setNewLicense(e.target.value)} placeholder="AME-CERT-XXXX"
                      className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono text-[var(--text-primary)] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="label">SECURITY ENCRYPTION KEY (PASSWORD)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono font-bold text-[var(--text-primary)] pr-10 outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button type="button" onClick={() => setNewPassword(generatePassword())}
                      className="w-11 h-11 flex items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-panel-2)] hover:border-[var(--accent-blue)] transition-colors text-[var(--accent-blue)]"
                      title="Regenerate Key">
                      <FiRefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded flex items-center gap-2 text-[var(--error)] animate-shake">
                    <FiAlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
                  </div>
                )}

                <button onClick={handleCreate} disabled={creating}
                  className="w-full h-12 btn-primary flex items-center justify-center gap-2 font-bold tracking-[0.2em]">
                  {creating ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                    <><FiPlus className="w-5 h-5" /> AUTHORIZE PERSONNEL</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
