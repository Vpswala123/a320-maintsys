import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiSearch, FiUpload, FiX, FiCheck, FiAlertCircle, FiAirplay } from 'react-icons/fi';

const AIRCRAFT_TYPES = ['A320-214', 'A320-232', 'A320-251N', 'A320-271N'];
const STATUSES = ['active', 'in_maintenance', 'grounded'];

function StatusBadge({ status }) {
  const m = {
    active: { bg: 'rgba(39,174,96,0.12)', color: 'var(--color-accent-green)', label: 'Active' },
    in_maintenance: { bg: 'rgba(242,201,76,0.12)', color: 'var(--color-accent-yellow)', label: 'In Maintenance' },
    grounded: { bg: 'rgba(235,87,87,0.12)', color: 'var(--color-accent-red)', label: 'Grounded' },
  };
  const s = m[status] || m.active;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function FleetPage() {
  const { profile } = useAuth();
  const [aircraft, setAircraft] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const [newAc, setNewAc] = useState({
    tail_number: '',
    aircraft_type: 'A320-214',
    msn: '',
    airline_id: '',
    total_fh: 0,
    total_cycles: 0,
    year_of_manufacture: 2018,
    status: 'active',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [acRes, alRes] = await Promise.all([
      supabase.from('aircraft').select('*, airlines(name, country)').order('tail_number'),
      supabase.from('airlines').select('*').order('name'),
    ]);
    setAircraft(acRes.data || []);
    setAirlines(alRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selectAircraft = async (ac) => {
    setSelectedAircraft(ac);
    const { data } = await supabase.from('maintenance_sessions')
      .select('*, profiles:engineer_id(name)')
      .eq('aircraft_id', ac.id)
      .order('session_date', { ascending: false })
      .limit(10);
    setSessions(data || []);
  };

  const handleAddAircraft = async () => {
    if (!newAc.tail_number.trim()) { setError('Tail number is required'); return; }
    setSaving(true);
    setError('');
    try {
      const { error: insertErr } = await supabase.from('aircraft').insert({
        tail_number: newAc.tail_number.toUpperCase(),
        aircraft_type: newAc.aircraft_type,
        msn: newAc.msn || null,
        airline_id: newAc.airline_id || null,
        total_fh: newAc.total_fh,
        total_cycles: newAc.total_cycles,
        year_of_manufacture: newAc.year_of_manufacture,
        status: newAc.status,
      });
      if (insertErr) throw insertErr;
      setShowAddForm(false);
      setNewAc({ tail_number: '', aircraft_type: 'A320-214', msn: '', airline_id: '', total_fh: 0, total_cycles: 0, year_of_manufacture: 2018, status: 'active' });
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      let imported = 0;
      for (const item of items) {
        if (!item.tail_number) continue;
        const { error } = await supabase.from('aircraft').insert({
          tail_number: item.tail_number,
          aircraft_type: item.aircraft_type || 'A320-214',
          msn: item.msn || null,
          total_fh: item.total_fh || 0,
          total_cycles: item.total_cycles || 0,
          year_of_manufacture: item.year_of_manufacture || null,
          status: item.status || 'active',
        });
        if (!error) imported++;
      }
      setImportMsg(`Imported ${imported} of ${items.length} aircraft`);
      fetchData();
      setTimeout(() => setImportMsg(''), 4000);
    } catch (err) {
      setImportMsg(`Import error: ${err.message}`);
    }
    e.target.value = '';
  };

  const filtered = aircraft.filter(a =>
    a.tail_number.toLowerCase().includes(search.toLowerCase()) ||
    a.aircraft_type.toLowerCase().includes(search.toLowerCase()) ||
    a.airlines?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fleet..."
                className="pl-9 pr-3 py-2 rounded-lg border text-xs outline-none w-60" style={inputStyle} />
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{filtered.length} aircraft</span>
          </div>
          {profile?.role === 'admin' && (
            <div className="flex gap-2">
              <label className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <FiUpload className="w-3.5 h-3.5" /> Import JSON
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <button onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110"
                style={{ background: 'rgba(47,128,237,0.1)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
                <FiPlus className="w-4 h-4" /> Add Aircraft
              </button>
            </div>
          )}
        </div>

        {importMsg && (
          <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(39,174,96,0.08)', color: 'var(--color-accent-green)', border: '1px solid rgba(39,174,96,0.2)' }}>
            {importMsg}
          </div>
        )}

        {/* Aircraft Grid */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="w-12 h-12 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {filtered.map(ac => (
                <div key={ac.id} onClick={() => selectAircraft(ac)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-[var(--color-accent)] ${selectedAircraft?.id === ac.id ? 'ring-1 ring-[var(--color-accent)]' : ''}`}
                  style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--color-accent)' }}>{ac.tail_number}</h3>
                    <StatusBadge status={ac.status} />
                  </div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{ac.aircraft_type}</p>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    <span>FH: {Number(ac.total_fh || 0).toLocaleString()}</span>
                    <span>FC: {Number(ac.total_cycles || 0).toLocaleString()}</span>
                    <span>MSN: {ac.msn || '—'}</span>
                    <span>MFG: {ac.year_of_manufacture || '—'}</span>
                  </div>
                  {ac.airlines && (
                    <div className="mt-2 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      ✈ {ac.airlines.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fleet Overview */}
        <div className="mt-4 p-3 rounded-lg border grid grid-cols-4 gap-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="text-center">
            <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-accent)' }}>{aircraft.length}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Total Fleet</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-accent-green)' }}>{aircraft.filter(a => a.status === 'active').length}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-accent-yellow)' }}>{aircraft.filter(a => a.status === 'in_maintenance').length}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>In Maintenance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-accent-red)' }}>{aircraft.filter(a => a.status === 'grounded').length}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Grounded</div>
          </div>
        </div>
      </div>

      {/* Right: Detail Panel */}
      {selectedAircraft && (
        <aside className="hidden lg:block w-[280px] shrink-0 border-l overflow-y-auto p-3 space-y-3"
          style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--color-accent)' }}>{selectedAircraft.tail_number}</h3>
            <button onClick={() => setSelectedAircraft(null)} className="p-1 rounded hover:bg-[var(--color-bg-card)]">
              <FiX className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex justify-between"><span>Type</span><span className="font-mono font-bold">{selectedAircraft.aircraft_type}</span></div>
            <div className="flex justify-between"><span>MSN</span><span className="font-mono">{selectedAircraft.msn || '—'}</span></div>
            <div className="flex justify-between"><span>Total FH</span><span className="font-mono">{Number(selectedAircraft.total_fh || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Total FC</span><span className="font-mono">{Number(selectedAircraft.total_cycles || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Year</span><span className="font-mono">{selectedAircraft.year_of_manufacture || '—'}</span></div>
            <div className="flex justify-between"><span>Status</span><StatusBadge status={selectedAircraft.status} /></div>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />
          
          <h4 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Recent Maintenance ({sessions.length})
          </h4>
          {sessions.length > 0 ? sessions.map((s, i) => (
            <div key={i} className="p-2 rounded-lg border text-xs" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold">{s.session_date}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: s.maintenance_type === 'scheduled' ? 'rgba(39,174,96,0.12)' : 'rgba(242,201,76,0.12)', color: s.maintenance_type === 'scheduled' ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)' }}>
                  {s.check_type || s.maintenance_type}
                </span>
              </div>
              <div>{s.profiles?.name || '—'}</div>
            </div>
          )) : (
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>No maintenance history</p>
          )}
        </aside>
      )}

      {/* Add Aircraft Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
          <div className="relative w-full max-w-md rounded-xl border p-6 animate-slide-up"
            style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Add Aircraft</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded"><FiX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Tail Number *</label>
                <input value={newAc.tail_number} onChange={e => setNewAc(p => ({ ...p, tail_number: e.target.value.toUpperCase() }))}
                  placeholder="VT-XXX" className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Type</label>
                  <select value={newAc.aircraft_type} onChange={e => setNewAc(p => ({ ...p, aircraft_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}>
                    {AIRCRAFT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>MSN</label>
                  <input value={newAc.msn} onChange={e => setNewAc(p => ({ ...p, msn: e.target.value }))}
                    placeholder="e.g. 5678" className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Airline</label>
                <select value={newAc.airline_id} onChange={e => setNewAc(p => ({ ...p, airline_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-xs outline-none" style={inputStyle}>
                  <option value="">Select airline...</option>
                  {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Total FH</label>
                  <input type="number" min="0" value={newAc.total_fh} onChange={e => setNewAc(p => ({ ...p, total_fh: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Cycles</label>
                  <input type="number" min="0" value={newAc.total_cycles} onChange={e => setNewAc(p => ({ ...p, total_cycles: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Year Built</label>
                  <input type="number" min="1990" max="2030" value={newAc.year_of_manufacture} onChange={e => setNewAc(p => ({ ...p, year_of_manufacture: parseInt(e.target.value) || 2018 }))}
                    className="w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono" style={inputStyle} />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(235,87,87,0.1)', border: '1px solid rgba(235,87,87,0.2)' }}>
                <FiAlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent-red)' }} />
                <p className="text-xs" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
              </div>
            )}

            <button onClick={handleAddAircraft} disabled={saving}
              className="w-full mt-4 py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                <><FiCheck className="w-4 h-4" /> Add to Fleet</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
