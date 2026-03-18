import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FiX, FiCheck, FiPlus, FiAlertCircle } from 'react-icons/fi';

const CHECK_TYPES = [
  { value: 'A1', label: 'A1 Check (500 FH)' },
  { value: 'A2', label: 'A2 Check (1000 FH)' },
  { value: 'A3', label: 'A3 Check (1500 FH)' },
  { value: 'B', label: 'B Check (6 months)' },
  { value: 'C', label: 'C Check (6000 FH / 20-24 mo)' },
  { value: 'D', label: 'D Check (6-10 years / heavy)' },
];

const UNSCHEDULED_REASONS = [
  'Pilot Defect Report', 'ECAM Warning', 'Hydraulic Leak', 'Abnormal Vibration',
  'Sensor Alert', 'Bird Strike', 'Hard Landing', 'Other',
];

const AIRWORTHINESS_OPTIONS = [
  { value: 'serviceable', label: 'Aircraft serviceable for flight' },
  { value: 'unserviceable', label: 'Aircraft not serviceable — defect open' },
  { value: 'deferred', label: 'Deferred defect raised (MEL)' },
];

export default function MaintenanceSessionForm({ onClose, onSaved, prefillCheck }) {
  const { user, profile } = useAuth();
  const [aircraft, setAircraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [header, setHeader] = useState({
    aircraft_id: '',
    session_date: new Date().toISOString().split('T')[0],
    place: '',
    maintenance_type: prefillCheck ? 'scheduled' : 'scheduled',
    check_type: prefillCheck || 'A1',
    reason: '',
    airworthiness: 'serviceable',
    mel_reference: '',
    notes: '',
    signature: '',
  });

  const [taskRows, setTaskRows] = useState([
    { ata: '', task: '', time: '', result: 'Serviceable', signature: '' }
  ]);

  useEffect(() => {
    supabase.from('aircraft').select('id, tail_number, aircraft_type').order('tail_number')
      .then(({ data }) => setAircraft(data || []));
  }, []);

  const updateHeader = (field, value) => setHeader(prev => ({ ...prev, [field]: value }));

  const addTaskRow = () => {
    setTaskRows(prev => [...prev, { ata: '', task: '', time: '', result: 'Serviceable', signature: '' }]);
  };

  const removeTaskRow = (index) => {
    if (taskRows.length > 1) setTaskRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateTaskRow = (index, field, value) => {
    setTaskRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  // Generate SHA-256 digital signature
  const generateDigitalSignature = async (data) => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async () => {
    if (!header.aircraft_id || !header.signature) {
      setError('Please select an aircraft and sign the session.');
      return;
    }
    if (taskRows.every(r => !r.task.trim())) {
      setError('Please add at least one task entry.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Generate digital signature hash
      const sigHash = await generateDigitalSignature({
        engineer: profile?.name,
        date: header.session_date,
        tasks: taskRows.filter(r => r.task.trim()),
        timestamp: new Date().toISOString(),
      });

      // Insert session
      const { data: session, error: sessionErr } = await supabase.from('maintenance_sessions').insert({
        aircraft_id: header.aircraft_id,
        engineer_id: user.id,
        session_date: header.session_date,
        place: header.place || null,
        maintenance_type: header.maintenance_type,
        check_type: header.maintenance_type === 'scheduled' ? header.check_type : null,
        reason_if_unscheduled: header.maintenance_type === 'unscheduled' ? header.reason : null,
        status: 'open',
      }).select().single();

      if (sessionErr) throw sessionErr;

      // Insert task entries
      const validTasks = taskRows.filter(r => r.task.trim());
      if (validTasks.length > 0) {
        const entries = validTasks.map((row, i) => ({
          session_id: session.id,
          ata_chapter: row.ata || null,
          task_description: row.task,
          time_taken: row.time ? parseFloat(row.time) : null,
          result: row.result || null,
          signature: row.signature || header.signature,
        }));

        const { error: entriesErr } = await supabase.from('maintenance_entries').insert(entries);
        if (entriesErr) throw entriesErr;
      }

      // Log to audit trail
      await supabase.from('audit_trail').insert({
        user_id: user.id,
        action: 'CREATE_MAINTENANCE_SESSION',
        module: 'logbooks',
        record_id: session.id,
        details: { maintenance_type: header.maintenance_type, check_type: header.check_type, task_count: validTasks.length, digital_signature: sigHash },
      });

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border p-6 animate-slide-up"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Start Maintenance Session</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Engineer: {profile?.name} • License: {profile?.license_number || '—'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-bg-card)]">
            <FiX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Session Header Fields */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Aircraft *</label>
            <select value={header.aircraft_id} onChange={e => updateHeader('aircraft_id', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}>
              <option value="">Select...</option>
              {aircraft.map(a => <option key={a.id} value={a.id}>{a.tail_number} ({a.aircraft_type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Date</label>
            <input type="date" value={header.session_date} onChange={e => updateHeader('session_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Location</label>
            <input value={header.place} onChange={e => updateHeader('place', e.target.value)} placeholder="e.g. DEL Hangar 3"
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle} />
          </div>
        </div>

        {/* Maintenance Type Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Maintenance Type</label>
            <div className="flex gap-2">
              {['scheduled', 'unscheduled'].map(t => (
                <button key={t} onClick={() => updateHeader('maintenance_type', t)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${header.maintenance_type === t ? '' : 'opacity-50'}`}
                  style={{
                    background: header.maintenance_type === t ? (t === 'scheduled' ? 'rgba(39,174,96,0.1)' : 'rgba(242,201,76,0.1)') : 'var(--color-bg-card)',
                    borderColor: header.maintenance_type === t ? (t === 'scheduled' ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)') : 'var(--color-border)',
                    color: header.maintenance_type === t ? (t === 'scheduled' ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)') : 'var(--color-text-secondary)',
                  }}>
                  {t === 'scheduled' ? '✓ Scheduled' : '⚠ Unscheduled'}
                </button>
              ))}
            </div>
          </div>
          <div>
            {header.maintenance_type === 'scheduled' ? (
              <>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Check Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {CHECK_TYPES.map(ct => (
                    <button key={ct.value} onClick={() => updateHeader('check_type', ct.value)}
                      className={`px-2.5 py-1.5 rounded border text-[10px] font-semibold transition-all ${header.check_type === ct.value ? '' : 'opacity-50'}`}
                      style={{
                        background: header.check_type === ct.value ? 'rgba(47,128,237,0.1)' : 'var(--color-bg-card)',
                        borderColor: header.check_type === ct.value ? 'var(--color-accent)' : 'var(--color-border)',
                        color: header.check_type === ct.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      }}>
                      {ct.value}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Reason</label>
                <select value={header.reason} onChange={e => updateHeader('reason', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}>
                  <option value="">Select reason...</option>
                  {UNSCHEDULED_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </>
            )}
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--color-border)' }} />

        {/* Task Entries */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Task Entries</h4>
          <button onClick={addTaskRow}
            className="px-3 py-1 rounded border text-[10px] font-semibold flex items-center gap-1 transition-all hover:border-[var(--color-accent)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
            <FiPlus className="w-3 h-3" /> Add Task
          </button>
        </div>

        <div className="space-y-2 mb-4 max-h-[30vh] overflow-y-auto pr-1">
          {taskRows.map((row, i) => (
            <div key={i} className="grid grid-cols-[70px_1fr_70px_110px_110px_28px] gap-2 items-center p-2 rounded-lg border"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <input value={row.ata} onChange={e => updateTaskRow(i, 'ata', e.target.value)}
                placeholder="ATA" className="px-2 py-1.5 rounded border text-xs outline-none font-mono"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              <input value={row.task} onChange={e => updateTaskRow(i, 'task', e.target.value)}
                placeholder="Task description" className="px-2 py-1.5 rounded border text-xs outline-none"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              <input value={row.time} onChange={e => updateTaskRow(i, 'time', e.target.value)}
                placeholder="Hrs" className="px-2 py-1.5 rounded border text-xs outline-none font-mono"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              <select value={row.result} onChange={e => updateTaskRow(i, 'result', e.target.value)}
                className="px-2 py-1.5 rounded border text-xs outline-none"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <option>Serviceable</option>
                <option>Unserviceable</option>
                <option>Deferred</option>
              </select>
              <input value={row.signature} onChange={e => updateTaskRow(i, 'signature', e.target.value)}
                placeholder="Signature" className="px-2 py-1.5 rounded border text-xs outline-none"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              <button onClick={() => removeTaskRow(i)} className="p-1 rounded hover:bg-[var(--color-bg-primary)]"
                style={{ visibility: taskRows.length > 1 ? 'visible' : 'hidden' }}>
                <FiX className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addTaskRow}
          className="w-full py-2 rounded-lg border-2 border-dashed text-xs font-semibold transition-all hover:border-[var(--color-accent)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          + Add Task Row
        </button>

        <hr className="my-4" style={{ borderColor: 'var(--color-border)' }} />

        {/* Notes & Airworthiness */}
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Detailed Notes</label>
          <textarea value={header.notes} onChange={e => updateHeader('notes', e.target.value)} rows={3}
            placeholder="Additional remarks, observations, findings..."
            className="w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none" style={inputStyle} />
        </div>

        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Airworthiness Status</label>
          <div className="space-y-1.5">
            {AIRWORTHINESS_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="airworthiness" value={opt.value}
                  checked={header.airworthiness === opt.value}
                  onChange={e => updateHeader('airworthiness', e.target.value)}
                  className="accent-[var(--color-accent)]" />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {header.airworthiness === 'deferred' && (
            <input value={header.mel_reference} onChange={e => updateHeader('mel_reference', e.target.value)}
              placeholder="MEL Reference Number" className="mt-2 w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          )}
        </div>

        {/* Signature */}
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Engineer Digital Signature *
          </label>
          <input value={header.signature} onChange={e => updateHeader('signature', e.target.value)}
            placeholder="Type your name to sign this session"
            className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle} />
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(235,87,87,0.1)', border: '1px solid rgba(235,87,87,0.2)' }}>
            <FiAlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent-red)' }} />
            <p className="text-xs" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleSubmit} disabled={saving}
            className="py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'var(--color-accent)' }}>
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
              <><FiCheck className="w-4 h-4" /> Save Session</>}
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
              <><FiCheck className="w-4 h-4" /> Sign & Submit</>}
          </button>
        </div>

        <p className="text-center mt-3 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
          ⚠️ Simulated data for educational purposes only
        </p>
      </div>
    </div>
  );
}
