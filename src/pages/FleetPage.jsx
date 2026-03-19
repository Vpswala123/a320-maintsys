import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiSearch, FiUpload, FiX, FiCheck, FiAlertCircle, FiAirplay } from 'react-icons/fi';

const AIRCRAFT_TYPES = ['A320-214', 'A320-232', 'A320-251N', 'A320-271N'];
const STATUSES = ['active', 'in_maintenance', 'grounded'];

function StatusBadge({ status }) {
  const m = {
    active: { bg: 'rgba(39,174,96,0.1)', color: 'var(--success)', label: 'ACTIVE' },
    in_maintenance: { bg: 'rgba(242,201,76,0.1)', color: 'var(--warning)', label: 'MAINTENANCE' },
    grounded: { bg: 'rgba(235,87,87,0.1)', color: 'var(--error)', label: 'GROUNDED' },
  };
  const s = m[status] || m.active;
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-transparent font-mono" 
      style={{ background: s.bg, color: s.color, borderColor: `${s.color}33` }}>
      {s.label}
    </span>
  );
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

  return (
    <div className="h-full flex overflow-hidden bg-[var(--bg-primary)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Fleet Management</h1>
            <div className="h-6 w-[1px] bg-[var(--border)]" />
            <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">{filtered.length} UNITS IN SYSTEM</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search tail, type, or airline..."
                className="pl-9 pr-3 py-2 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs outline-none w-64 focus:border-[var(--accent-blue)] transition-colors text-[var(--text-primary)]" 
              />
            </div>
            
            {profile?.role === 'admin' && (
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 rounded border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-panel-2)] transition-colors uppercase tracking-wider">
                  <FiUpload className="w-3.5 h-3.5" /> Import
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
                <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-1.5 px-4 h-9">
                  <FiPlus className="w-4 h-4" /> Add Aircraft
                </button>
              </div>
            )}
          </div>
        </div>

        {importMsg && (
          <div className="mb-4 px-4 py-2 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded text-xs text-[var(--success)] font-bold">
            {importMsg}
          </div>
        )}

        {/* Aircraft Grid */}
        <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] border-t-[var(--accent-blue)] animate-spin" />
              <span className="text-xs font-mono text-[var(--text-muted)]">SYNCING FLEET DATA...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filtered.map(ac => (
                <div key={ac.id} onClick={() => selectAircraft(ac)}
                  className={`panel relative overflow-hidden group cursor-pointer transition-all hover:border-[var(--accent-blue)] 
                    ${selectedAircraft?.id === ac.id ? 'ring-1 ring-[var(--accent-blue)] border-[var(--accent-blue)] shadow-[0_0_15px_rgba(47,128,237,0.15)]' : ''}`}>
                  
                  {/* Status Bar Top */}
                  <div className="absolute top-0 left-0 right-0 h-[3px]" 
                    style={{ background: ac.status === 'active' ? 'var(--success)' : ac.status === 'in_maintenance' ? 'var(--warning)' : 'var(--error)' }} />
                  
                  <div className="p-4 pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold font-mono text-[var(--accent-blue)] tracking-tighter">{ac.tail_number}</h3>
                        <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">{ac.aircraft_type}</p>
                      </div>
                      <StatusBadge status={ac.status} />
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-0.5">Flight Hours</p>
                          <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{Number(ac.total_fh || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-0.5">Cycles</p>
                          <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{Number(ac.total_cycles || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold">MSN: {ac.msn || '—'}</span>
                        {ac.airlines && (
                          <span className="text-[10px] font-bold text-[var(--accent-cyan)] opacity-80 flex items-center gap-1">
                            <FiAirplay className="w-3 h-3" /> {ac.airlines.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Fleet Status Banner */}
        <div className="mt-6 flex flex-wrap gap-3 pb-2">
          {[
            { label: 'TOTAL FLEET', value: aircraft.length, color: 'var(--text-primary)' },
            { label: 'ACTIVE', value: aircraft.filter(a => a.status === 'active').length, color: 'var(--success)' },
            { label: 'MAINTENANCE', value: aircraft.filter(a => a.status === 'in_maintenance').length, color: 'var(--warning)' },
            { label: 'GROUNDED', value: aircraft.filter(a => a.status === 'grounded').length, color: 'var(--error)' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 min-w-[140px] panel px-4 py-3 flex items-center justify-between bg-[var(--bg-panel-2)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider">{stat.label}</span>
              <span className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Detailed Intelligence Panel */}
      {selectedAircraft && (
        <aside className="hidden xl:flex w-[320px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-panel)] flex-col">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-panel-2)]/50">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">AIRCRAFT DOSSIER</h3>
              <p className="text-[10px] font-mono text-[var(--accent-blue)] font-bold">{selectedAircraft.tail_number}</p>
            </div>
            <button onClick={() => setSelectedAircraft(null)} className="p-1.5 rounded hover:bg-[var(--bg-panel-2)] transition-colors">
              <FiX className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Core Specs */}
            <section className="space-y-3">
              <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" /> Technical Profile
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  ['Model Type', selectedAircraft.aircraft_type],
                  ['Manufacturer Serial No.', selectedAircraft.msn || 'N/A'],
                  ['Total Time (AF)', `${Number(selectedAircraft.total_fh || 0).toLocaleString()} FH`],
                  ['Landings (AC)', Number(selectedAircraft.total_cycles || 0).toLocaleString()],
                  ['Year of Manufacture', selectedAircraft.year_of_manufacture || 'Unknown'],
                  ['Current Status', selectedAircraft.status.toUpperCase()]
                ].map(([lbl, val], i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--border)] border-dashed last:border-0">
                    <span className="text-[11px] text-[var(--text-secondary)]">{lbl}</span>
                    <span className="text-[11px] font-mono font-bold text-[var(--text-primary)]">{val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Maintenance History */}
            <section className="space-y-3">
              <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" /> Maintenance History
              </h4>
              <div className="space-y-2">
                {sessions.length > 0 ? sessions.map((s, i) => (
                  <div key={i} className="p-3 rounded border border-[var(--border)] bg-[var(--bg-panel-2)]/30 hover:bg-[var(--bg-panel-2)] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono text-[var(--text-primary)]">{s.session_date}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${s.maintenance_type === 'scheduled' ? 'border-[var(--success)]/30 text-[var(--success)]' : 'border-[var(--warning)]/30 text-[var(--warning)]'}`}>
                        {(s.check_type || s.maintenance_type).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" /> Signed by: <span className="text-[var(--text-primary)] font-semibold">{s.profiles?.name || 'Unknown'}</span>
                    </p>
                  </div>
                )) : (
                  <div className="py-8 text-center panel bg-transparent border-dashed">
                    <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">No history recorded</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-panel-2)]/30">
            <button className="w-full btn-secondary h-9 text-xs font-bold tracking-widest">
              GENERATE TECHNICAL REPORT
            </button>
          </div>
        </aside>
      )}

      {/* Add Aircraft Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md panel overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-panel-2)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">ADD NEW ASSET</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest leading-none">Fleet Inventory Update</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded hover:bg-[var(--border)] transition-colors">
                <FiX className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Tail Number (Registration)</label>
                  <input 
                    value={newAc.tail_number} 
                    onChange={e => setNewAc(p => ({ ...p, tail_number: e.target.value.toUpperCase() }))}
                    placeholder="e.g. VT-ANR" 
                    className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono font-bold text-[var(--accent-blue)] outline-none focus:border-[var(--accent-blue)]"
                  />
                </div>
                <div>
                  <label className="label">Airframe Type</label>
                  <select 
                    value={newAc.aircraft_type} 
                    onChange={e => setNewAc(p => ({ ...p, aircraft_type: e.target.value }))}
                    className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-bold text-[var(--text-primary)] outline-none"
                  >
                    {AIRCRAFT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">MSN (Serial No.)</label>
                  <input 
                    value={newAc.msn} 
                    onChange={e => setNewAc(p => ({ ...p, msn: e.target.value }))}
                    placeholder="5432"
                    className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">Operating Airline</label>
                  <select 
                    value={newAc.airline_id} 
                    onChange={e => setNewAc(p => ({ ...p, airline_id: e.target.value }))}
                    className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="">Select operator...</option>
                    {airlines.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Accumulated FH</label>
                  <input 
                    type="number" 
                    value={newAc.total_fh} 
                    onChange={e => setNewAc(p => ({ ...p, total_fh: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="label">Cycles (AC)</label>
                  <input 
                    type="number" 
                    value={newAc.total_cycles} 
                    onChange={e => setNewAc(p => ({ ...p, total_cycles: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-[var(--bg-panel-2)] border border-[var(--border)] rounded text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded text-[var(--error)] animate-shake">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 btn-secondary h-11 text-xs">
                  CANCEL
                </button>
                <button 
                  onClick={handleAddAircraft} 
                  disabled={saving}
                  className="flex-[2] btn-primary h-11 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><FiCheck className="w-4 h-4" /> COMMISSION ASSET</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
    </div>
  );
}
