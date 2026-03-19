import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiClock, FiCheck, FiAlertCircle, FiX, FiAlertTriangle, FiBookOpen, FiActivity } from 'react-icons/fi';
import PilotLogbookForm from '@/components/logbooks/PilotLogbookForm';
import MaintenanceSessionForm from '@/components/logbooks/MaintenanceSessionForm';
import DefectLogForm from '@/components/logbooks/DefectLogForm';
import WorkflowTracker from '@/components/logbooks/WorkflowTracker';

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
    closed: { bg: 'var(--success)', color: 'var(--success)', text: 'CLOSED' },
    approved: { bg: 'var(--success)', color: 'var(--success)', text: 'APPROVED' },
    in_progress: { bg: 'var(--warning)', color: 'var(--warning)', text: 'IN PROGRESS' },
    pending_approval: { bg: 'var(--warning)', color: 'var(--warning)', text: 'PENDING' },
    open: { bg: 'var(--accent-blue)', color: 'var(--accent-blue)', text: 'OPEN' },
    assigned: { bg: 'var(--accent-blue)', color: 'var(--accent-blue)', text: 'ASSIGNED' },
    resolved: { bg: 'var(--success)', color: 'var(--success)', text: 'RESOLVED' },
  };
  const s = styles[status] || styles.open;
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest" 
      style={{ background: `${s.bg}10`, color: s.color, borderColor: `${s.bg}30` }}>
      {s.text}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const colors = {
    low: 'var(--success)', medium: 'var(--warning)',
    high: '#ff8800', critical: 'var(--error)', airworthiness_affecting: 'var(--error)',
  };
  const c = colors[severity] || colors.medium;
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest" 
      style={{ background: `${c}10`, color: c, borderColor: `${c}30` }}>
      {severity?.replace('_', ' ')}
    </span>
  );
}

function TypeBadge({ type }) {
  const isScheduled = type === 'scheduled';
  const color = isScheduled ? 'var(--success)' : 'var(--warning)';
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest" 
      style={{ background: `${color}10`, color, borderColor: `${color}30` }}>
      {isScheduled ? 'SCHEDULED' : 'UNSCHEDULED'}
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
    { id: 'sessions', label: 'Maintenance Log' },
    { id: 'defects', label: 'Defect Register' },
    { id: 'pilot', label: 'Pilot Records' },
    { id: 'workflow', label: 'Lifecycle Workflow' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      
      {/* Top Header - Engineering Deck */}
      <div className="h-[64px] px-8 shrink-0 border-b flex items-center justify-between bg-[var(--bg-panel)]/50 backdrop-blur-md" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col">
          <h1 className="text-xs font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase flex items-center gap-3">
            <FiBookOpen className="w-4 h-4 text-[var(--accent-blue)]" /> Digital Fleet Archive
          </h1>
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">Registry: VT-DEM // Node: 0x7A4</span>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setShowPilotForm(true)}
            className="h-9 px-4 rounded border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:border-[var(--border-light)] hover:bg-[var(--bg-panel-2)] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border)' }}>
            <FiPlus className="w-3.5 h-3.5 text-[var(--accent-cyan)]" /> New Record
          </button>
          <button onClick={() => { setPrefillCheck(null); setShowSessionForm(true); }}
            className="h-9 px-4 rounded bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/40 text-[var(--accent-blue)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-[var(--accent-blue)]/20">
            <FiActivity className="w-3.5 h-3.5" /> Maintenance Protocol
          </button>
        </div>
      </div>

      {/* Tabs - CAD Style */}
      <div className="px-8 py-0 h-10 border-b bg-[var(--bg-panel)] flex gap-4" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 h-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all relative
              ${activeTab === tab.id 
                ? 'text-[var(--accent-cyan)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent-cyan)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* STATUS OVERLAY */}
      <div className="px-8 py-3 bg-[var(--bg-panel-2)]/30 border-b flex items-center gap-8" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Active Queues:</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-[var(--text-primary)] font-bold">A1:</span>
              <span className="text-[var(--warning)] font-bold animate-pulse">50FH</span>
              <button onClick={() => handleStartCheck('A1')} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--accent-cyan)] hover:bg-[var(--accent-blue)] hover:text-white">INTIATE</button>
            </div>
            <div className="w-px h-3 bg-[var(--border)]" />
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-[var(--text-primary)] font-bold">A2:</span>
              <span className="text-[var(--text-muted)]">450FH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="panel overflow-hidden border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl">
          {activeTab === 'sessions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--bg-panel-2)]/50 border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-3">Sequence Date</th>
                    <th className="px-6 py-3">Registry</th>
                    <th className="px-6 py-3">Assigned Agent</th>
                    <th className="px-6 py-3">Protocol Type</th>
                    <th className="px-6 py-3">Check Identity</th>
                    <th className="px-6 py-3">Completion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sessions.map((s) => (
                    <tr key={s.id} className="group hover:bg-[var(--bg-panel-2)]/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-[var(--text-secondary)]">{s.session_date}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[var(--accent-cyan)]">{s.aircraft?.tail_number || '—'}</td>
                      <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{s.profiles?.name || 'SYSTEM'}</td>
                      <td className="px-6 py-4"><TypeBadge type={s.maintenance_type} /></td>
                      <td className="px-6 py-4 font-mono text-[11px] font-bold text-[var(--text-secondary)] tracking-tighter">{s.check_type || 'AD-HOC'}</td>
                      <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'defects' && (
            <div className="overflow-x-auto">
              <div className="px-6 py-4 bg-[var(--bg-panel-2)]/30 border-b border-[var(--border)] flex justify-between items-center">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Historical Fault Matrix</span>
                <button onClick={() => setShowDefectForm(true)} className="h-8 px-4 rounded bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30 text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--error)]/20 transition-all">
                  Report Critical Defect
                </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--bg-panel-2)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Registry</th>
                    <th className="px-6 py-3">ATA Chapter</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {defects.map((d) => (
                    <tr key={d.id} className="group hover:bg-[var(--error)]/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-[var(--text-secondary)]">{d.created_at?.split('T')[0]}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[var(--accent-cyan)]">{d.aircraft?.tail_number || '—'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[var(--text-primary)]">ATA {d.ata_chapter || 'NA'}</td>
                      <td className="px-6 py-4 max-w-[250px] truncate text-[11px] text-[var(--text-secondary)] font-medium leading-snug">{d.description}</td>
                      <td className="px-6 py-4"><SeverityBadge severity={d.severity} /></td>
                      <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pilot' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--bg-panel-2)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-3">Flight Date</th>
                    <th className="px-6 py-3">Registry</th>
                    <th className="px-6 py-3">Route Vector</th>
                    <th className="px-6 py-3">Flight Duration</th>
                    <th className="px-6 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {pilotLogs.map((l) => (
                    <tr key={l.id} className="group hover:bg-[var(--bg-panel-2)]/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-[var(--text-secondary)]">{l.date}</td>
                      <td className="px-6 py-4 font-mono font-bold text-[var(--accent-cyan)]">{l.aircraft?.tail_number || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase font-mono">{l.route_from} ➔ {l.route_to}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] font-bold text-[var(--accent-blue)]">{l.flight_hours ? `${l.flight_hours} HR` : '—'}</td>
                      <td className="px-6 py-4 max-w-[300px] truncate text-[11px] text-[var(--text-secondary)] tracking-tight">{l.remarks || 'NO UNUSUAL OBSERVANCE'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="p-12 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <FiClock className="w-5 h-5 text-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]/20" />
                <div>
                  <h3 className="text-xs font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase">Deployment Pipeline</h3>
                  <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1">Status Verification // Active Phase Analysis</p>
                </div>
              </div>
              <WorkflowTracker currentStageId={WORKFLOW_STAGES[activeStage]?.key} />
            </div>
          )}
        </div>
      </div>

      {/* Modals - Glassmorphic Overlays */}
      {showPilotForm && <PilotLogbookForm onClose={() => setShowPilotForm(false)} onSaved={fetchData} />}
      {showSessionForm && <MaintenanceSessionForm onClose={() => { setShowSessionForm(false); setPrefillCheck(null); }} onSaved={fetchData} prefillCheck={prefillCheck} />}
      {showDefectForm && <DefectLogForm onClose={() => setShowDefectForm(false)} onSaved={fetchData} />}
    </div>
  );
}
