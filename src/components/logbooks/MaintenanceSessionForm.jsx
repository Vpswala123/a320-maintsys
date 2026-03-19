import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { requireRole } from '@/utils/rbac';
import { signMaintenanceSession } from '@/utils/signatureService';
import { FiX, FiCheck, FiPlus, FiAlertCircle } from 'react-icons/fi';

const CHECK_TYPES = [
  { type: 'A1', interval: '500 FH',    desc: 'Transit/Line check' },
  { type: 'A2', interval: '1000 FH',   desc: 'Extended A-check' },
  { type: 'A3', interval: '1500 FH',   desc: 'A-check package' },
  { type: 'B',  interval: '6 months',  desc: 'B-check' },
  { type: 'C',  interval: '6000 FH',   desc: 'C-check' },
  { type: 'D',  interval: '~72 months',desc: 'D-check / Heavy' },
];

const UNSCHEDULED_REASONS = [
  'Pilot Defect Report', 'ECAM Warning', 'Hydraulic Leak', 'Abnormal Vibration',
  'Sensor Alert', 'Bird Strike', 'Hard Landing', 'Other',
];



import { logAudit } from '@/utils/auditLogger';

export default function MaintenanceSessionForm({ onClose, onSaved, prefillCheck }) {
  const { user, profile } = useAuth();
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Part A — Session Header
  const [aircraftId, setAircraftId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [airworthinessStatus, setAirworthinessStatus] = useState('serviceable');
  
  const [maintenanceType, setMaintenanceType] = useState(prefillCheck ? 'scheduled' : 'scheduled');
  const [checkType, setCheckType] = useState(prefillCheck || null);
  const [unscheduledReason, setUnscheduledReason] = useState('');
  const [tasks, setTasks] = useState([{ id: 1, ata: '', description: '', time: '', result: 'Serviceable', signature: '' }]);

  useEffect(() => {
    supabase.from('aircraft').select('*').eq('status', 'active')
      .then(({ data }) => setFleet(data || []));
  }, []);

  function addTask() {
    setTasks(prev => [...prev, {
      id: Date.now(),
      ata: '',
      description: '',
      time: '',
      result: 'Serviceable',
      signature: ''
    }]);
  }

  function updateTask(id, field, value) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function removeTask(id) {
    if (tasks.length > 1) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  }

  async function handleSubmit() {
    try {
      requireRole(profile, ['ame', 'admin']);
    } catch (err) {
      setError(err.message);
      return;
    }

    if (!aircraftId) {
      setError('Please select an aircraft.');
      return;
    }

    if (maintenanceType === 'scheduled' && !checkType) {
      setError('Please select a check type.');
      return;
    }

    if (maintenanceType === 'unscheduled' && !unscheduledReason) {
      setError('Please select an unscheduled reason.');
      return;
    }

    const uncompletedTasks = tasks.filter(t => !t.description || !t.signature);
    if (uncompletedTasks.length > 0 && tasks.length > 0 && tasks[0].description) {
      setError('Please complete description and signature for all added tasks.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedAircraft = fleet.find(a => a.id === aircraftId);
      
      const { data: session, error: sessionErr } = await supabase.from('maintenance_sessions').insert({
        aircraft_id: aircraftId,
        engineer_id: user.id,
        session_date: sessionDate,
        maintenance_type: maintenanceType,
        check_type: maintenanceType === 'scheduled' ? checkType : null,
        reason_if_unscheduled: maintenanceType === 'unscheduled' ? unscheduledReason : null,
        detailed_notes: notes,
        airworthiness_status: airworthinessStatus,
        status: 'open',
      }).select().single();

      if (sessionErr) throw sessionErr;

      const validTasks = tasks.filter(task => task.description.trim());
      let entries = [];
      if (validTasks.length > 0) {
        entries = validTasks.map((row) => ({
          session_id: session.id,
          ata_chapter: row.ata || null,
          task_description: row.description,
          time_taken_hours: row.time ? parseFloat(row.time) : null,
          result: row.result || null,
          engineer_signature: row.signature || profile?.name,
        }));

        const { error: entriesErr } = await supabase.from('maintenance_entries').insert(entries);
        if (entriesErr) throw entriesErr;
      }
      
      const sigHash = await signMaintenanceSession(session, entries);
      const { error: updateSigErr } = await supabase.from('maintenance_sessions')
        .update({ digital_signature_hash: sigHash, status: 'submitted' })
        .eq('id', session.id);
      if (updateSigErr) throw updateSigErr;

      await logAudit('CREATE', 'maintenance_session', session.id, { maintenance_type: maintenanceType, check_type: checkType, task_count: validTasks.length, digital_signature: sigHash });
      
      alert('Session submitted for approval');
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!requireRole(profile, ['ame', 'admin'])) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 z-[100]" onClick={onClose}>
        <div className="bg-[var(--bg-panel)] border border-[var(--error)] rounded-xl p-6 text-center max-w-sm" onClick={e => e.stopPropagation()}>
          <FiAlertCircle className="w-12 h-12 text-[var(--error)] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
          <p className="text-[var(--text-secondary)] mb-6 text-xs font-mono">This form is ONLY accessible to role = 'ame' or 'admin'.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[var(--bg-panel)] border shadow-2xl overflow-hidden" 
           style={{ borderColor: 'var(--border)', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 bg-[#0f1729]" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-mono font-bold tracking-widest text-[var(--accent-blue)] flex items-center gap-2 uppercase">
            <span className="text-xl">🔧</span> MAINTENANCE SESSION FORM
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)] transition-colors rounded">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Part A: Session Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">AIRCRAFT TAIL NUMBER *</label>
              <select value={aircraftId} onChange={e => setAircraftId(e.target.value)} 
                className="w-full bg-[var(--bg-panel-2)] border text-[var(--text-primary)] font-mono text-sm px-4 py-2.5 outline-none transition-colors focus:border-[var(--accent-blue)]"
                style={{ borderColor: 'var(--border)' }}>
                <option value="">Select Aircraft...</option>
                {fleet.map(a => <option key={a.id} value={a.id}>{a.tail_number} ({a.aircraft_type})</option>)}
              </select>
            </div>
            <div>
              <label className="label block mb-2">SESSION DATE</label>
              <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} 
                className="w-full bg-[var(--bg-panel-2)] border text-[var(--text-primary)] font-mono text-sm px-4 py-2.5 outline-none transition-colors focus:border-[var(--accent-blue)]"
                style={{ borderColor: 'var(--border)' }} />
            </div>
          </div>

          <hr className="border-[var(--border)] my-6" />

          {/* Part B & C: Maintenance Type & Check/Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="label block mb-3">MAINTENANCE TYPE</label>
              <div className="grid grid-cols-2 gap-3 h-[42px]">
                <button onClick={() => setMaintenanceType('scheduled')}
                  className={`font-bold font-mono text-xs uppercase tracking-wider rounded border transition-colors flex items-center justify-center gap-2
                  ${maintenanceType === 'scheduled' ? 'bg-[#27ae6015] border-[var(--success)] text-[var(--success)]' : 'bg-[var(--bg-panel-2)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)]'}`}>
                  ● Scheduled
                </button>
                <button onClick={() => setMaintenanceType('unscheduled')}
                  className={`font-bold font-mono text-xs uppercase tracking-wider rounded border transition-colors flex items-center justify-center gap-2
                  ${maintenanceType === 'unscheduled' ? 'bg-[#f2c94c15] border-[var(--warning)] text-[var(--warning)]' : 'bg-[var(--bg-panel-2)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)]'}`}>
                  ○ Unscheduled
                </button>
              </div>
            </div>

            <div>
              <label className="label block mb-3">
                {maintenanceType === 'scheduled' ? 'SELECT CHECK PACKAGE' : 'UNSCHEDULED REASON'}
              </label>
              {maintenanceType === 'scheduled' ? (
                <div className="grid grid-cols-6 gap-2 h-[42px]">
                  {CHECK_TYPES.map(ct => (
                    <button key={ct.type} onClick={() => setCheckType(ct.type)} title={ct.desc}
                      className={`font-bold font-mono text-xs rounded border transition-all flex items-center justify-center
                      ${checkType === ct.type ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)] text-white' : 'bg-[var(--bg-panel-2)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)]'}`}>
                      {ct.type}
                    </button>
                  ))}
                </div>
              ) : (
                <select value={unscheduledReason} onChange={e => setUnscheduledReason(e.target.value)} 
                  className="w-full h-[42px] bg-[var(--bg-panel-2)] border text-[var(--text-primary)] font-mono text-sm px-4 outline-none transition-colors focus:border-[var(--accent-blue)]"
                  style={{ borderColor: 'var(--border)' }}>
                  <option value="">Select reason...</option>
                  {UNSCHEDULED_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>
          </div>

          <hr className="border-[var(--border)] my-6" />

          {/* Part D: Task Rows */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label block">TASK ENTRIES</label>
              <button onClick={addTask} className="text-[10px] font-mono font-bold flex items-center gap-1 text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] transition-colors px-2 py-1 rounded hover:bg-[#2f80ed15]">
                <FiPlus className="w-3 h-3" /> ADD TASK
              </button>
            </div>
            
            <div className="border rounded bg-[var(--bg-panel-2)] overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="p-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider w-16 uppercase">ATA</th>
                    <th className="p-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider uppercase">Action Performed</th>
                    <th className="p-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider w-20 uppercase">Time(H)</th>
                    <th className="p-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider w-36 uppercase">Result</th>
                    <th className="p-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider w-40 uppercase">Sign-off</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b last:border-0 hover:bg-[var(--bg-primary)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-1.5"><input value={task.ata} onChange={e => updateTask(task.id, 'ata', e.target.value)} placeholder="xx" className="w-full bg-[var(--bg-panel)] border text-[var(--text-primary)] rounded px-2 py-1.5 text-xs font-mono outline-none" style={{ borderColor: 'var(--border)' }} /></td>
                      <td className="p-1.5"><input value={task.description} onChange={e => updateTask(task.id, 'description', e.target.value)} placeholder="Detailed description..." className="w-full bg-[var(--bg-panel)] border text-[var(--text-primary)] rounded px-2 py-1.5 text-xs outline-none" style={{ borderColor: 'var(--border)' }} /></td>
                      <td className="p-1.5"><input value={task.time} onChange={e => updateTask(task.id, 'time', e.target.value)} placeholder="0.0" className="w-full bg-[var(--bg-panel)] border text-[var(--text-primary)] rounded px-2 py-1.5 text-xs font-mono outline-none" style={{ borderColor: 'var(--border)' }} /></td>
                      <td className="p-1.5">
                        <select value={task.result} onChange={e => updateTask(task.id, 'result', e.target.value)} className="w-full bg-[var(--bg-panel)] border text-[var(--text-primary)] rounded px-2 py-1.5 text-xs outline-none" style={{ borderColor: 'var(--border)' }}>
                          <option value="Serviceable">Serviceable</option>
                          <option value="Unserviceable">Unserviceable</option>
                          <option value="Deferred">Deferred</option>
                        </select>
                      </td>
                      <td className="p-1.5"><input value={task.signature} onChange={e => updateTask(task.id, 'signature', e.target.value)} placeholder="Initials" className="w-full bg-[var(--bg-panel)] border text-[var(--success)] rounded px-2 py-1.5 text-xs font-serif italic font-bold outline-none" style={{ borderColor: 'var(--border)' }} /></td>
                      <td className="p-1.5 text-center">
                        <button onClick={() => removeTask(task.id)} disabled={tasks.length === 1} className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[#eb575715] rounded disabled:opacity-30 transition-colors mx-auto">
                          <FiX className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part E: Notes & Airworthiness */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6">
            <div>
              <label className="label block mb-2">DETAILED NOTES</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" placeholder="Enter findings, limitations, or general comments..."
                className="w-full bg-[var(--bg-panel-2)] border text-[var(--text-primary)] text-sm rounded px-4 py-3 outline-none resize-none focus:border-[var(--accent-blue)] transition-colors"
                style={{ borderColor: 'var(--border)' }}></textarea>
            </div>
            <div>
              <label className="label block mb-2">AIRWORTHINESS RELEASE</label>
              <div className="space-y-2 p-3 bg-[var(--bg-panel-2)] border rounded" style={{ borderColor: 'var(--border)' }}>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${airworthinessStatus === 'serviceable' ? 'border-[var(--success)]' : 'border-[var(--text-muted)]'}`}>
                    {airworthinessStatus === 'serviceable' && <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>}
                  </div>
                  <input type="radio" className="hidden" checked={airworthinessStatus === 'serviceable'} onChange={() => setAirworthinessStatus('serviceable')} />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--success)]">Serviceable</span>
                </label>
                <div className="h-px bg-[var(--border)] my-2"></div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${airworthinessStatus === 'unserviceable' ? 'border-[var(--error)]' : 'border-[var(--text-muted)]'}`}>
                    {airworthinessStatus === 'unserviceable' && <div className="w-2 h-2 bg-[var(--error)] rounded-full"></div>}
                  </div>
                  <input type="radio" className="hidden" checked={airworthinessStatus === 'unserviceable'} onChange={() => setAirworthinessStatus('unserviceable')} />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--error)]">AOG / Unserviceable</span>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#eb575715] border rounded flex items-center gap-3" style={{ borderColor: 'var(--error)' }}>
              <FiAlertCircle className="shrink-0 w-4 h-4 text-[var(--error)]" />
              <p className="text-xs font-bold text-[var(--error)]">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-[var(--bg-panel-2)] flex justify-end shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary shadow-lg flex items-center gap-2 tracking-wider px-8">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> SUBMIT APPROVAL</>}
          </button>
        </div>

      </div>
    </div>
  );
}
