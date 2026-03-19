import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

import { logAudit } from '@/utils/auditLogger';

export default function DefectLogForm({ onClose, onSaved }) {
  const { user, profile } = useAuth();
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    aircraft_id: '',
    date: new Date().toISOString().split('T')[0],
    ata_chapter: '',
    component_name: '',
    defect_description: '',
    severity: 'Medium',
    affects_airworthiness: false
  });

  useEffect(() => {
    supabase.from('aircraft').select('*').eq('status', 'active')
      .then(({ data }) => setFleet(data || []));
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.aircraft_id || !form.defect_description) {
      setError('Please select an aircraft and provide a description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: newDefect, error: insertErr } = await supabase.from('defect_logs').insert({
        aircraft_id: form.aircraft_id,
        reported_by: user.id, // Or profile.id
        ata_chapter: form.ata_chapter,
        component_name: form.component_name,
        description: form.defect_description, // The prompt used `defect_description`, but the table might be `description`. The prompt code says `defect_description: description`!
        severity: form.severity.toLowerCase(),
        affects_airworthiness: form.affects_airworthiness || form.severity === 'Airworthiness-Affecting',
        status: 'open'
      }).select().single();

      if (insertErr) throw insertErr;

      await logAudit('CREATE', 'defect_logs', newDefect?.id || Date.now());
      
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl p-6 animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">📋</span> Report Aircraft Defect
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aircraft *</label>
            <select value={form.aircraft_id} onChange={e => update('aircraft_id', e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none">
              <option value="">Select Tail Number...</option>
              {fleet.map(a => <option key={a.id} value={a.id}>{a.tail_number} ({a.aircraft_type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
            <input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ATA Chapter</label>
            <input type="text" value={form.ata_chapter} onChange={e => update('ata_chapter', e.target.value)} placeholder="e.g. 21" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Component Name</label>
            <input type="text" value={form.component_name} onChange={e => update('component_name', e.target.value)} placeholder="e.g. Pack 1 Flow Control Valve" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Defect Description *</label>
          <textarea value={form.defect_description} onChange={e => update('defect_description', e.target.value)} rows="4" placeholder="Describe the issue in detail..." className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none resize-none"></textarea>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Severity & Airworthiness</label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {['Low', 'Medium', 'High', 'Critical', 'Airworthiness-Affecting'].map(sev => (
              <button key={sev} onClick={() => {
                  update('severity', sev);
                  if (sev === 'Airworthiness-Affecting') update('affects_airworthiness', true);
                }} 
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border
                  ${form.severity === sev ? 
                    (sev === 'Airworthiness-Affecting' || sev === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500' : 
                     sev === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'bg-blue-500/20 text-blue-400 border-blue-500') 
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600'}`
                }>
                {sev}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-4 pt-4 border-t border-slate-700">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.affects_airworthiness ? 'bg-red-500 border-red-500' : 'bg-slate-900 border-slate-600'}`}>
              {form.affects_airworthiness && <FiCheck className="text-white w-3 h-3" />}
            </div>
            <input type="checkbox" className="hidden" checked={form.affects_airworthiness} onChange={e => update('affects_airworthiness', e.target.checked)} />
            <span className={`text-sm font-semibold ${form.affects_airworthiness ? 'text-red-400' : 'text-slate-400'}`}>
              Affects Airworthiness (Requires Inspector Approval)
            </span>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <FiAlertCircle className="text-red-500 shrink-0 w-5 h-5" />
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Submit Defect</>}
          </button>
        </div>

      </div>
    </div>
  );
}
