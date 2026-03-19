import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { requireRole } from '@/utils/rbac';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

import { logAudit } from '@/utils/auditLogger';

export default function PilotLogbookForm({ onClose, onSaved }) {
  const { user, profile } = useAuth();
  
  const [fleet, setFleet] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    aircraft_type: 'A320',
    aircraft_registration: '',
    tail_number: '',
    date: new Date().toISOString().split('T')[0],
    engine_type: '',
    pilot_in_command: profile?.name || '',
    co_pilot: '',
    route_from: '',
    route_to: '',
    departure_time: '',
    arrival_time: '',
    block_hours: '0.0',
    landings_day: 0,
    landings_night: 0,
    remarks: '',
    defect_noted: false,
    pilot_signature: ''
  });

  useEffect(() => {
    supabase.from('aircraft').select('*').eq('status', 'active').order('tail_number')
      .then(({ data }) => setFleet(data || []));
  }, []);

  // Auto-populate based on selected tail number
  useEffect(() => {
    if (form.tail_number && fleet.length > 0) {
      const ac = fleet.find(a => a.tail_number === form.tail_number);
      if (ac) {
        setForm(prev => ({
          ...prev,
          aircraft_registration: ac.registration || '',
          engine_type: ac.engine_type || 'CFM56-5B',
          aircraft_type: ac.aircraft_type || 'A320'
        }));
      }
    }
  }, [form.tail_number, fleet]);

  // Auto-calculate block hours
  useEffect(() => {
    if (form.departure_time && form.arrival_time) {
      const [dh, dm] = form.departure_time.split(':').map(Number);
      const [ah, am] = form.arrival_time.split(':').map(Number);
      let mins = (ah * 60 + am) - (dh * 60 + dm);
      if (mins < 0) mins += 1440;
      setForm(prev => ({ ...prev, block_hours: (mins / 60).toFixed(1) }));
    }
  }, [form.departure_time, form.arrival_time]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    try {
      requireRole(profile, ['pilot', 'admin']);
    } catch (err) {
      setError(err.message);
      return;
    }
    
    if (!form.tail_number || !form.route_from || !form.route_to || !form.pilot_signature) {
      setError('Please fill all required fields (Tail Number, Route, Signature).');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const aircraft = fleet.find(a => a.tail_number === form.tail_number);
      
      const { data, error: insertErr } = await supabase.from('pilot_logs').insert({
        aircraft_id: aircraft?.id,
        pilot_id: user.id,
        date: form.date,
        route_from: form.route_from,
        route_to: form.route_to,
        departure_time: form.departure_time || null,
        arrival_time: form.arrival_time || null,
        flight_hours: parseFloat(form.block_hours),
        landings_day: form.landings_day,
        landings_night: form.landings_night,
        remarks: form.remarks,
        signature: form.pilot_signature,
        // Optional tracking
        engine_type: form.engine_type,
        co_pilot: form.co_pilot,
        defect_noted: form.defect_noted
      }).select().single();

      if (insertErr) throw insertErr;
      
      await logAudit('CREATE', 'pilot_logs', data?.id || Date.now());
      
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile || !['pilot', 'admin'].includes(profile.role)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <div className="relative w-full max-w-md bg-slate-900 border border-red-500/50 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">You must have the 'pilot' or 'admin' role to access this form.</p>
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Close</button>
        </div>
      </div>
    );
  }

  const inputStyle = { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border p-6 animate-slide-up"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>✈ Pilot Logbook Form</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Required fields are marked with *</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-[var(--color-bg-card)]">
            <FiX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          
          {/* Aircraft Select */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Aircraft Type</label>
              <select value={form.aircraft_type} onChange={e => update('aircraft_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
                <option value="A320">Airbus A320</option>
                <option value="A321">Airbus A321</option>
                <option value="B737">Boeing 737</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Tail Number *</label>
              <select value={form.tail_number} onChange={e => update('tail_number', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
                <option value="">Select tail...</option>
                {fleet.map(a => <option key={a.id} value={a.tail_number}>{a.tail_number}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Registration</label>
              <input value={form.aircraft_registration} readOnly className="w-full px-3 py-2 rounded-lg border text-sm outline-none opacity-70" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Date</label>
              <input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Engine Type</label>
              <input value={form.engine_type} readOnly className="w-full px-3 py-2 rounded-lg border text-sm outline-none opacity-70" style={inputStyle} />
            </div>
          </div>

          <hr className="border-[var(--color-border)] opacity-50" />

          {/* Crew */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Pilot in Command *</label>
              <input value={form.pilot_in_command} onChange={e => update('pilot_in_command', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Co-Pilot</label>
              <input value={form.co_pilot} onChange={e => update('co_pilot', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          {/* Route & Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Route FROM *</label>
              <input value={form.route_from} onChange={e => update('route_from', e.target.value.toUpperCase())} maxLength={3} placeholder="DEL" className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Route TO *</label>
              <input value={form.route_to} onChange={e => update('route_to', e.target.value.toUpperCase())} maxLength={3} placeholder="BOM" className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Dep Time</label>
              <input type="time" value={form.departure_time} onChange={e => update('departure_time', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Arr Time</label>
              <input type="time" value={form.arrival_time} onChange={e => update('arrival_time', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Block Hours</label>
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-3 py-2 rounded-lg text-sm flex items-center h-[38px]">
                {form.block_hours}
              </div>
            </div>
          </div>

          {/* Landings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Landings Day</label>
              <input type="number" min="0" value={form.landings_day} onChange={e => update('landings_day', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Landings Night</label>
              <input type="number" min="0" value={form.landings_night} onChange={e => update('landings_night', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono" style={inputStyle} />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Remarks / Defect Report</label>
            <textarea value={form.remarks} onChange={e => update('remarks', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={inputStyle} />
          </div>

          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input type="checkbox" checked={form.defect_noted} onChange={e => update('defect_noted', e.target.checked)} className="w-4 h-4 rounded text-red-500 bg-slate-900 border-slate-700 focus:ring-red-500" />
              <span className={`text-sm font-semibold ${form.defect_noted ? 'text-red-400' : 'text-slate-400'}`}>Defect Noted</span>
            </label>
            <div className="flex-1">
              <input value={form.pilot_signature} onChange={e => update('pilot_signature', e.target.value)} placeholder="Type Pilot Signature *" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-green-400 font-serif italic outline-none focus:border-green-500/50" />
            </div>
          </div>
          
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving} className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Save</>}
        </button>

      </div>
    </div>
  );
}
