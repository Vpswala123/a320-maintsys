import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'var(--color-accent-green)' },
  { value: 'medium', label: 'Medium', color: 'var(--color-accent-yellow)' },
  { value: 'high', label: 'High', color: '#ff8800' },
  { value: 'critical', label: 'Critical', color: 'var(--color-accent-red)' },
  { value: 'airworthiness_affecting', label: 'Airworthiness Affecting', color: '#ff0044' },
];

export default function DefectLogForm({ onClose, onSaved }) {
  const { user } = useAuth();
  const [aircraft, setAircraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    aircraft_id: '',
    ata_chapter: '',
    component: '',
    description: '',
    severity: 'medium',
  });

  useEffect(() => {
    supabase.from('aircraft').select('id, tail_number, aircraft_type').order('tail_number')
      .then(({ data }) => setAircraft(data || []));
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.aircraft_id || !form.description.trim()) {
      setError('Aircraft and defect description are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { error: insertErr } = await supabase.from('defect_logs').insert({
        aircraft_id: form.aircraft_id,
        reported_by: user.id,
        ata_chapter: form.ata_chapter || null,
        component: form.component || null,
        description: form.description,
        severity: form.severity,
        status: 'open',
      });
      if (insertErr) throw insertErr;

      await supabase.from('audit_trail').insert({
        user_id: user.id,
        action: 'REPORT_DEFECT',
        module: 'defect_log',
        details: { aircraft_id: form.aircraft_id, severity: form.severity, ata: form.ata_chapter },
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
      <div className="relative w-full max-w-lg rounded-xl border p-6 animate-slide-up"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Report Defect</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>File a new defect report</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-bg-card)]">
            <FiX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Aircraft *</label>
            <select value={form.aircraft_id} onChange={e => update('aircraft_id', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}>
              <option value="">Select aircraft...</option>
              {aircraft.map(a => <option key={a.id} value={a.id}>{a.tail_number} ({a.aircraft_type})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>ATA Chapter</label>
              <input value={form.ata_chapter} onChange={e => update('ata_chapter', e.target.value)}
                placeholder="e.g. 29" className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Component</label>
              <input value={form.component} onChange={e => update('component', e.target.value)}
                placeholder="e.g. Hydraulic Pump" className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Defect Description *</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4}
              placeholder="Describe the defect in detail..."
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none" style={inputStyle} />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Severity</label>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITY_LEVELS.map(s => (
                <button key={s.value} onClick={() => update('severity', s.value)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${form.severity === s.value ? '' : 'opacity-40'}`}
                  style={{
                    background: form.severity === s.value ? `${s.color}18` : 'var(--color-bg-card)',
                    borderColor: form.severity === s.value ? s.color : 'var(--color-border)',
                    color: form.severity === s.value ? s.color : 'var(--color-text-secondary)',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
            {form.severity === 'airworthiness_affecting' && (
              <p className="mt-2 text-[10px] px-2 py-1 rounded" style={{ background: 'rgba(255,0,68,0.08)', color: '#ff0044' }}>
                ⚠ Airworthiness-affecting defects require inspector approval before task closure.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(235,87,87,0.1)', border: '1px solid rgba(235,87,87,0.2)' }}>
            <FiAlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent-red)' }} />
            <p className="text-xs" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full mt-4 py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-red), #ff4466)' }}>
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
            <><FiAlertCircle className="w-4 h-4" /> Submit Defect Report</>}
        </button>
      </div>
    </div>
  );
}
