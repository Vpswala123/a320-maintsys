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
    admin: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
    pilot: { bg: 'rgba(47,128,237,0.12)', color: '#2f80ed' },
    ame: { bg: 'rgba(39,174,96,0.12)', color: '#27ae60' },
  };
  const s = styles[role] || styles.ame;
  return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{role}</span>;
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
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>User Management</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Create and manage user accounts • {users.length} users registered
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="p-2 rounded-lg border transition-all hover:border-[var(--color-accent)]"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            <button onClick={openNewUserModal}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all hover:brightness-110"
              style={{ background: 'var(--color-accent)' }}>
              <FiPlus className="w-4 h-4" /> Create User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>License No.</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                  No users yet. Click "Create User" to add the first account.
                </td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td><span className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{u.employee_id || '—'}</span></td>
                    <td className="font-semibold">{u.name || '—'}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td className="font-mono">{u.license_number || '—'}</td>
                    <td>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: u.is_active !== false ? 'rgba(39,174,96,0.12)' : 'rgba(235,87,87,0.12)',
                          color: u.is_active !== false ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                        }}>
                        {u.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="font-mono text-[10px]">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button onClick={() => handleToggleActive(u.id, u.is_active !== false)}
                        className="p-1.5 rounded transition-colors hover:bg-[var(--color-bg-card)]" title={u.is_active !== false ? 'Disable' : 'Enable'}>
                        {u.is_active !== false ?
                          <FiToggleRight className="w-4 h-4" style={{ color: 'var(--color-accent-green)' }} /> :
                          <FiToggleLeft className="w-4 h-4" style={{ color: 'var(--color-accent-red)' }} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-4 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>How It Works</h4>
            <ol className="text-[11px] space-y-1.5 list-decimal list-inside" style={{ color: 'var(--color-text-secondary)' }}>
              <li>Click <strong>"Create User"</strong></li>
              <li>Set the role, name, and Employee ID</li>
              <li>A password is auto-generated</li>
              <li>Copy credentials and share with user</li>
              <li>User logs in with Employee ID + Password</li>
            </ol>
          </div>
          <div className="p-4 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Employee ID Format</h4>
            <div className="text-[11px] space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <p><span className="font-mono font-bold" style={{ color: '#a855f7' }}>ADM-XXXX</span> → Administrators</p>
              <p><span className="font-mono font-bold" style={{ color: '#2f80ed' }}>PLT-XXXX</span> → Pilots</p>
              <p><span className="font-mono font-bold" style={{ color: '#27ae60' }}>AME-XXXX</span> → Maintenance Engineers</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>You can customize the ID to any format</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Password Policy</h4>
            <div className="text-[11px] space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <p>• Minimum 6 characters</p>
              <p>• Auto-generated with mixed case + numbers</p>
              <p>• Admin can regenerate anytime</p>
              <p>• Credentials are shown once — copy them!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { if (!createdCreds) setShowModal(false); }}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
          <div className="relative w-full max-w-lg rounded-xl border p-6 animate-slide-up"
            style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {createdCreds ? '✅ User Created!' : 'Create New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg-card)]">
                <FiX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {createdCreds ? (
              /* Credentials Display */
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2" style={{ background: 'rgba(39,174,96,0.05)', borderColor: 'var(--color-accent-green)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-accent-green)' }}>
                    Share these credentials with the user. They won't be shown again.
                  </p>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--color-text-muted)' }}>Name:</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{createdCreds.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--color-text-muted)' }}>Role:</span>
                      <RoleBadge role={createdCreds.role} />
                    </div>
                    <hr style={{ borderColor: 'var(--color-border)' }} />
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--color-text-muted)' }}>Employee ID:</span>
                      <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{createdCreds.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--color-text-muted)' }}>Password:</span>
                      <span className="font-bold" style={{ color: 'var(--color-accent-green)' }}>{createdCreds.password}</span>
                    </div>
                  </div>
                </div>

                <button onClick={copyCredentials}
                  className="w-full py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-[var(--color-accent)]"
                  style={{ borderColor: 'var(--color-border)', color: copied ? 'var(--color-accent-green)' : 'var(--color-accent)', background: 'var(--color-bg-card)' }}>
                  {copied ? <><FiCheck className="w-4 h-4" /> Copied!</> : <><FiCopy className="w-4 h-4" /> Copy Credentials</>}
                </button>

                <button onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:brightness-110"
                  style={{ background: 'var(--color-accent)' }}>
                  Done
                </button>
              </div>
            ) : (
              /* Create Form */
              <div className="space-y-3">
                {/* Role Select */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pilot', label: 'Pilot', color: '#2f80ed' },
                      { id: 'ame', label: 'AME', color: '#27ae60' },
                      { id: 'admin', label: 'Admin', color: '#a855f7' },
                    ].map(r => (
                      <button key={r.id} type="button" onClick={() => handleRoleChange(r.id)}
                        className="py-2 rounded-lg border-2 text-xs font-semibold transition-all"
                        style={{
                          background: newRole === r.id ? `${r.color}15` : 'var(--color-bg-card)',
                          borderColor: newRole === r.id ? r.color : 'var(--color-border)',
                          color: newRole === r.id ? r.color : 'var(--color-text-secondary)',
                        }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Full Name</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ravi Kumar"
                      className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Employee ID</label>
                    <input type="text" value={newEmployeeId} onChange={e => setNewEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono"
                      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-accent)' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>License / Certificate No. (optional)</label>
                  <input type="text" value={newLicense} onChange={e => setNewLicense(e.target.value)} placeholder="e.g. DGCA-AME-12345"
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono"
                    style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Generated Password</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono pr-8"
                        style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                        {showPassword ? <FiEyeOff className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} /> :
                          <FiEye className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />}
                      </button>
                    </div>
                    <button type="button" onClick={() => setNewPassword(generatePassword())}
                      className="px-3 py-2 rounded-lg border text-xs font-semibold transition-all hover:border-[var(--color-accent)]"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', background: 'var(--color-bg-card)' }}>
                      <FiRefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(235,87,87,0.1)', color: 'var(--color-accent-red)' }}>{error}</p>}
                {success && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(39,174,96,0.1)', color: 'var(--color-accent-green)' }}>{success}</p>}

                <button onClick={handleCreate} disabled={creating}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
                  {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                    <><FiPlus className="w-4 h-4" /> Create Account</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
