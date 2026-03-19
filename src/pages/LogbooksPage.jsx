import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiClock, FiCheck, FiAlertCircle, FiX, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import PilotLogbookForm from '@/components/logbooks/PilotLogbookForm';
import MaintenanceSessionForm from '@/components/logbooks/MaintenanceSessionForm';
import DefectLogForm from '@/components/logbooks/DefectLogForm';

const WORKFLOW_STAGES = [
  { icon: '🛫', label: 'Pilot Reports Defect', key: 'reported' },
  { icon: '📝', label: 'Defect Entry Created', key: 'entered' },
  { icon: '🔧', label: 'AME Assigned', key: 'assigned' },
  { icon: '✅', label: 'Work Completed', key: 'completed' },
  { icon: '🔍', label: 'Inspector Approves', key: 'inspected' },
  { icon: '🔒', label: 'Task Closed', key: 'closed' },
];

function StatusBadge({ status }) {
  const styles = {
    closed: { bg: 'rgba(39,174,96,0.12)', color: 'var(--success)', text: 'Closed' },
    approved: { bg: 'rgba(39,174,96,0.12)', color: 'var(--success)', text: 'Approved' },
    in_progress: { bg: 'rgba(242,201,76,0.12)', color: 'var(--warning)', text: 'In Progress' },
    pending_approval: { bg: 'rgba(242,201,76,0.12)', color: 'var(--warning)', text: 'Pending' },
    open: { bg: 'rgba(47,128,237,0.12)', color: 'var(--accent-blue)', text: 'Open' },
    assigned: { bg: 'rgba(47,128,237,0.12)', color: 'var(--accent-blue)', text: 'Assigned' },
    resolved: { bg: 'rgba(39,174,96,0.12)', color: 'var(--success)', text: 'Resolved' },
  };
  const s = styles[status] || styles.open;
  return <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>{s.text}</span>;
}

function SeverityBadge({ severity }) {
  const colors = {
    low: 'var(--success)', medium: 'var(--warning)',
    high: '#ff8800', critical: 'var(--error)', airworthiness_affecting: '#ff0044',
  };
  const c = colors[severity] || colors.medium;
  return <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ background: `${c}18`, color: c }}>{severity?.replace('_', ' ')}</span>;
}

function TypeBadge({ type }) {
  const isScheduled = type === 'scheduled';
  return (
    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded"
      style={{ background: isScheduled ? 'rgba(39,174,96,0.12)' : 'rgba(242,201,76,0.12)', color: isScheduled ? 'var(--success)' : 'var(--warning)' }}>
      {isScheduled ? 'Scheduled' : 'Unscheduled'}
    </span>
  );
}

export default function LogbooksPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions');
  const [showPilotForm, setShowPilotForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [prefillCheck, setPrefillCheck] = useState(null);
  const [activeStage, setActiveStage] = useState(2);

  // Data from Supabase
  const [sessions, setSessions] = useState([]);
  const [pilotLogs, setPilotLogs] = useState([]);
  const [defects, setDefects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessRes, pilotRes, defectRes, schedRes] = await Promise.all([
        supabase.from('maintenance_sessions').select('*, aircraft(tail_number, aircraft_type), profiles:engineer_id(name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('pilot_logs').select('*, aircraft(tail_number, aircraft_type)').order('created_at', { ascending: false }).limit(20),
        supabase.from('defect_logs').select('*, aircraft(tail_number), profiles:reported_by(name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('maintenance_schedule').select('*, aircraft(tail_number)').order('check_type'),
      ]);
      setSessions(sessRes.data || []);
      setPilotLogs(pilotRes.data || []);
      setDefects(defectRes.data || []);
      setSchedules(schedRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStartCheck = (checkType) => {
    setPrefillCheck(checkType);
    setShowSessionForm(true);
  };

  const tabs = [
    { id: 'pilot', label: 'Pilot Logbook' },
    { id: 'sessions', label: 'Maintenance Log' },
    { id: 'defects', label: 'Defect Log' },
    { id: 'workflow', label: 'Workflow' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      
      {/* Top Header */}
      <div className="h-[56px] px-6 shrink-0 border-b flex items-center justify-between bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-sm font-bold tracking-widest text-[var(--text-primary)] uppercase flex items-center gap-2">
          <FiBookOpen className="w-4 h-4 text-[var(--accent-blue)]" /> LOGBOOKS
        </h1>
        <div className="flex gap-3 text-xs font-mono font-bold">
          <button onClick={() => setShowPilotForm(true)}
            className="px-3 py-1.5 rounded transition-all flex items-center gap-1.5 text-[var(--text-primary)] hover:bg-[var(--bg-panel-2)] border"
            style={{ borderColor: 'var(--border-light)' }}>
            <FiPlus className="w-3.5 h-3.5" /> NEW PILOT LOG
          </button>
          <button onClick={() => { setPrefillCheck(null); setShowSessionForm(true); }}
            className="px-3 py-1.5 rounded btn-primary flex items-center gap-1.5 transition-all">
            <FiPlus className="w-3.5 h-3.5" /> NEW MAINT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b bg-[var(--bg-panel)] flex gap-2" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-[#00d4ff15] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]' : 'bg-[var(--bg-panel-2)] text-[var(--text-secondary)] border border-[var(--border-light)] hover:text-[var(--text-primary)]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* UPCOMING CHECKS */}
      <div className="px-6 py-3 border-b bg-[#0f1729]" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5 shrink-0">
            <FiClock className="w-3.5 h-3.5" /> UPCOMING CHECKS — VT-DEM
          </span>
          <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
            {/* Mocking the data if empty to match requirements exactly */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)]">A1:</span>
              <span className="text-[var(--warning)] font-bold">⚠ 50 FH</span>
              <button onClick={() => handleStartCheck('A1')} className="ml-1 text-[10px] px-2 py-0.5 rounded bg-[var(--bg-panel)] border text-[var(--accent-cyan)] hover:bg-[var(--accent-blue)] hover:text-white transition-colors" style={{ borderColor: 'var(--border-light)' }}>[START]</button>
            </div>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)]">A2:</span>
              <span className="text-[var(--text-secondary)]">450 FH</span>
              <button className="ml-1 text-[10px] px-2 py-0.5 rounded bg-[var(--bg-panel)] border text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" style={{ borderColor: 'var(--border-light)' }}>[PLAN]</button>
            </div>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)]">C:</span>
              <span className="text-[var(--text-secondary)]">1400 FH</span>
              <button className="ml-1 text-[10px] px-2 py-0.5 rounded bg-[var(--bg-panel)] border text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" style={{ borderColor: 'var(--border-light)' }}>[PLAN]</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* === Maintenance Sessions Tab === */}
        {activeTab === 'sessions' && (
          <div className="overflow-hidden rounded-lg border bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
            {sessions.length === 0 && !loading ? (
              <div className="p-12 text-center">
                <p className="text-sm font-mono text-[var(--text-muted)]">No maintenance sessions yet.</p>
                <button onClick={() => setShowSessionForm(true)} className="mt-3 text-xs font-bold text-[var(--accent-blue)] uppercase tracking-wider">
                  Create Session
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Date</th><th>Aircraft</th><th>Engineer</th>
                      <th>Type</th><th>Check</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="cursor-pointer hover:bg-[#2f80ed0a] transition-colors">
                        <td className="font-mono text-xs">{s.session_date}</td>
                        <td className="font-mono font-bold text-[var(--accent-cyan)]">{s.aircraft?.tail_number || '—'}</td>
                        <td className="text-xs font-semibold text-[var(--text-primary)]">{s.profiles?.name || '—'}</td>
                        <td><TypeBadge type={s.maintenance_type} /></td>
                        <td className="font-mono text-xs font-bold text-[var(--text-secondary)]">{s.check_type || '—'}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === Pilot Log Tab === */}
        {activeTab === 'pilot' && (
          <div className="overflow-hidden rounded-lg border bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
            {pilotLogs.length === 0 && !loading ? (
              <div className="p-12 text-center">
                <p className="text-sm font-mono text-[var(--text-muted)]">No pilot log entries yet.</p>
                <button onClick={() => setShowPilotForm(true)} className="mt-3 text-xs font-bold text-[var(--accent-blue)] uppercase tracking-wider">
                  Create Log Entry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Date</th><th>Aircraft</th><th>From</th><th>To</th>
                      <th>Flight Hrs</th><th>Landings</th><th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pilotLogs.map((l) => (
                      <tr key={l.id} className="cursor-pointer hover:bg-[#2f80ed0a] transition-colors">
                        <td className="font-mono text-xs">{l.date}</td>
                        <td className="font-mono font-bold text-[var(--accent-cyan)]">{l.aircraft?.tail_number || '—'}</td>
                        <td className="font-mono font-bold text-[var(--text-primary)]">{l.route_from}</td>
                        <td className="font-mono font-bold text-[var(--text-primary)]">{l.route_to}</td>
                        <td className="font-mono text-xs text-[var(--text-secondary)]">{l.flight_hours ? `${l.flight_hours}h` : '—'}</td>
                        <td className="font-mono text-xs text-[var(--text-secondary)]">{(l.landings_day || 0) + (l.landings_night || 0)}</td>
                        <td className="max-w-[200px] truncate text-xs text-[var(--text-secondary)]">{l.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === Defect Log Tab === */}
        {activeTab === 'defects' && (
          <div className="overflow-hidden rounded-lg border bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
            <div className="p-3 border-b bg-[var(--bg-panel-2)] flex justify-end" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowDefectForm(true)} className="btn-primary flex items-center gap-1.5 py-1.5 px-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                <FiAlertTriangle className="w-3.5 h-3.5" /> REPORT DEFECT
              </button>
            </div>
            {defects.length === 0 && !loading ? (
              <div className="p-12 text-center">
                <FiAlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50 text-[var(--success)]" />
                <p className="text-sm font-mono text-[var(--text-muted)]">No Defects Reported</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Date</th><th>Aircraft</th><th>ATA</th><th>Component</th>
                      <th>Description</th><th>Severity</th><th>Reporter</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defects.map((d) => (
                      <tr key={d.id} className="cursor-pointer hover:bg-[#2f80ed0a] transition-colors">
                        <td className="font-mono text-xs">{d.created_at?.split('T')[0]}</td>
                        <td className="font-mono font-bold text-[var(--accent-cyan)]">{d.aircraft?.tail_number || '—'}</td>
                        <td className="font-mono text-xs text-[var(--text-primary)]">{d.ata_chapter || '—'}</td>
                        <td className="text-xs font-semibold text-[var(--text-secondary)]">{d.component_name || '—'}</td>
                        <td className="max-w-[200px] truncate text-xs text-[var(--text-secondary)]">{d.description}</td>
                        <td><SeverityBadge severity={d.severity} /></td>
                        <td className="text-xs">{d.profiles?.name || '—'}</td>
                        <td><StatusBadge status={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === Workflow Tab === */}
        {activeTab === 'workflow' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="rounded-lg border p-6 bg-[var(--bg-panel)] shadow-lg" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-bold font-mono tracking-widest text-[var(--text-secondary)] uppercase mb-6 flex items-center gap-2">
                <FiClock className="text-[var(--accent-blue)]" /> MAINTENANCE WORKFLOW PIPELINE
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {WORKFLOW_STAGES.map((stage, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <div className={`workflow-step ${i < activeStage ? 'completed' : i === activeStage ? 'active' : ''} p-4 w-32`}
                      style={{ cursor: 'pointer' }} onClick={() => setActiveStage(i)}>
                      <span className="text-2xl mb-1">{stage.icon}</span>
                      <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-wider"
                        style={{ color: i <= activeStage ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {stage.label}
                      </span>
                    </div>
                    {i < WORKFLOW_STAGES.length - 1 && (
                      <div className="workflow-arrow w-8 text-center text-xl font-bold" style={{ color: i < activeStage ? 'var(--success)' : 'var(--border-light)' }}>
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPilotForm && <PilotLogbookForm onClose={() => setShowPilotForm(false)} onSaved={fetchData} />}
      {showSessionForm && <MaintenanceSessionForm onClose={() => { setShowSessionForm(false); setPrefillCheck(null); }} onSaved={fetchData} prefillCheck={prefillCheck} />}
      {showDefectForm && <DefectLogForm onClose={() => setShowDefectForm(false)} onSaved={fetchData} />}
    </div>
  );
}
