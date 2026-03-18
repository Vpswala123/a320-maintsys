import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function PilotLogbookForm({ onClose, onSaved }) {
  const { user, profile } = useAuth();
  const [aircraft, setAircraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    aircraft_id: '',
    log_date: new Date().toISOString().split('T')[0],
    pilot_in_command: profile?.name || '',
    co_pilot: '',
    route_from: '',
    route_to: '',
    departure_time: '',
    arrival_time: '',
    landings_day: 0,
    landings_night: 0,
    remarks: '',
    signature: '',
  });

  useEffect(() => {
    supabase.from('aircraft').select('id, tail_number, aircraft_type').order('tail_number')
      .then(({ data }) => setAircraft(data || []));
  }, []);

  const selectedAc = aircraft.find(a => a.id === form.aircraft_id);

  // Calculate block time
  const blockTime = (() => {
    if (!form.departure_time || !form.arrival_time) return '';
    const [dh, dm] = form.departure_time.split(':').map(Number);
    const [ah, am] = form.arrival_time.split(':').map(Number);
    let mins = (ah * 60 + am) - (dh * 60 + dm);
    if (mins < 0) mins += 1440;
    return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
  })();

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.aircraft_id || !form.route_from || !form.route_to || !form.signature) {
      setError('Please fill all required fields and sign the entry.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Calculate flight hours as decimal
      let flight_hours = null;
      if (form.departure_time && form.arrival_time) {
        const [dh, dm] = form.departure_time.split(':').map(Number);
        const [ah, am] = form.arrival_time.split(':').map(Number);
        let mins = (ah * 60 + am) - (dh * 60 + dm);
        if (mins < 0) mins += 1440;
        flight_hours = parseFloat((mins / 60).toFixed(2));
      }

      const { error: insertErr } = await supabase.from('pilot_logs').insert({
        aircraft_id: form.aircraft_id,
        pilot_id: user.id,
        date: form.log_date,
        route_from: form.route_from,
        route_to: form.route_to,
        departure_time: form.departure_time || null,
        arrival_time: form.arrival_time || null,
        flight_hours,
        landings_day: form.landings_day,
        landings_night: form.landings_night,
        remarks: form.remarks,
        signature: form.signature,
      });

      if (insertErr) throw insertErr;
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
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border p-6 animate-slide-up"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>New Pilot Log Entry</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Record flight details and landings</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-bg-card)]">
            <FiX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Aircraft Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Aircraft *</label>
            <select value={form.aircraft_id} onChange={e => update('aircraft_id', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}>
              <option value="">Select aircraft...</option>
              {aircraft.map(a => <option key={a.id} value={a.id}>{a.tail_number} ({a.aircraft_type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Date</label>
            <input type="date" value={form.log_date} onChange={e => update('log_date', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
        </div>

        {/* Crew */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Pilot in Command</label>
            <input value={form.pilot_in_command} onChange={e => update('pilot_in_command', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Co-Pilot</label>
            <input value={form.co_pilot} onChange={e => update('co_pilot', e.target.value)} placeholder="Optional"
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle} />
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--color-border)' }} />

        {/* Route & Times */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>From *</label>
            <input value={form.route_from} onChange={e => update('route_from', e.target.value.toUpperCase())}
              placeholder="DEL" maxLength={4}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>To *</label>
            <input value={form.route_to} onChange={e => update('route_to', e.target.value.toUpperCase())}
              placeholder="BOM" maxLength={4}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Departure</label>
            <input type="time" value={form.departure_time} onChange={e => update('departure_time', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Arrival</label>
            <input type="time" value={form.arrival_time} onChange={e => update('arrival_time', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
        </div>

        {blockTime && (
          <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.2)' }}>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Block Time: </span>
            <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{blockTime}</span>
          </div>
        )}

        {/* Landings */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Landings — Day</label>
            <input type="number" min="0" value={form.landings_day} onChange={e => update('landings_day', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Landings — Night</label>
            <input type="number" min="0" value={form.landings_night} onChange={e => update('landings_night', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Total</label>
            <div className="px-3 py-2 rounded-lg border text-xs font-mono font-bold" style={{ ...inputStyle, color: 'var(--color-accent)' }}>
              {form.landings_day + form.landings_night}
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Remarks / Defect Report</label>
          <textarea value={form.remarks} onChange={e => update('remarks', e.target.value)} rows={3}
            placeholder="Normal operations / observed defects..."
            className="w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none" style={inputStyle} />
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--color-border)' }} />

        {/* Signature */}
        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Pilot Signature (type name) *
          </label>
          <input value={form.signature} onChange={e => update('signature', e.target.value)}
            placeholder="Enter your full name as digital signature"
            className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle} />
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(235,87,87,0.1)', border: '1px solid rgba(235,87,87,0.2)' }}>
            <FiAlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent-red)' }} />
            <p className="text-xs" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
            <><FiCheck className="w-4 h-4" /> Save Log Entry</>}
        </button>

        <p className="text-center mt-3 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
          ⚠️ Simulated data for educational purposes only
        </p>
      </div>
    </div>
  );
}
