import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiClock, FiCheck, FiAlertCircle, FiX, FiAlertTriangle } from 'react-icons/fi';
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
    closed: { bg: 'rgba(39,174,96,0.12)', color: 'var(--color-accent-green)', text: 'Closed' },
    approved: { bg: 'rgba(39,174,96,0.12)', color: 'var(--color-accent-green)', text: 'Approved' },
    in_progress: { bg: 'rgba(242,201,76,0.12)', color: 'var(--color-accent-yellow)', text: 'In Progress' },
    pending_approval: { bg: 'rgba(242,201,76,0.12)', color: 'var(--color-accent-yellow)', text: 'Pending' },
    open: { bg: 'rgba(47,128,237,0.12)', color: 'var(--color-accent)', text: 'Open' },
    assigned: { bg: 'rgba(47,128,237,0.12)', color: 'var(--color-accent)', text: 'Assigned' },
    resolved: { bg: 'rgba(39,174,96,0.12)', color: 'var(--color-accent-green)', text: 'Resolved' },
  };
  const s = styles[status] || styles.open;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.text}</span>;
}

function SeverityBadge({ severity }) {
  const colors = {
    low: 'var(--color-accent-green)', medium: 'var(--color-accent-yellow)',
    high: '#ff8800', critical: 'var(--color-accent-red)', airworthiness_affecting: '#ff0044',
  };
  const c = colors[severity] || colors.medium;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${c}18`, color: c }}>{severity?.replace('_', ' ')}</span>;
}

function TypeBadge({ type }) {
  const isScheduled = type === 'scheduled';
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: isScheduled ? 'rgba(39,174,96,0.12)' : 'rgba(242,201,76,0.12)', color: isScheduled ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)' }}>
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
    { id: 'sessions', label: 'Maintenance Sessions' },
    { id: 'pilot', label: 'Pilot Log' },
    { id: 'defects', label: 'Defect Log' },
    { id: 'workflow', label: 'Workflow' },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Tabs + Action Buttons */}
        <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
          <div className="flex gap-0.5 p-1 rounded-lg" style={{ background: 'var(--color-bg-card)' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab.id ? '' : 'hover:text-[var(--color-text-primary)]'}`}
                style={{
                  background: activeTab === tab.id ? 'rgba(47,128,237,0.15)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {activeTab === 'pilot' && (profile?.role === 'pilot' || profile?.role === 'admin') && (
              <button onClick={() => setShowPilotForm(true)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110"
                style={{ background: 'rgba(47,128,237,0.1)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
                <FiPlus className="w-4 h-4" /> New Pilot Log
              </button>
            )}
            {activeTab === 'sessions' && (profile?.role === 'ame' || profile?.role === 'admin') && (
              <button onClick={() => { setPrefillCheck(null); setShowSessionForm(true); }}
                className="px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110"
                style={{ background: 'rgba(39,174,96,0.1)', borderColor: 'var(--color-accent-green)', color: 'var(--color-accent-green)' }}>
                <FiPlus className="w-4 h-4" /> Start Maintenance Session
              </button>
            )}
            {activeTab === 'defects' && (
              <button onClick={() => setShowDefectForm(true)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:brightness-110"
                style={{ background: 'rgba(235,87,87,0.1)', borderColor: 'var(--color-accent-red)', color: 'var(--color-accent-red)' }}>
                <FiAlertTriangle className="w-4 h-4" /> Report Defect
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {/* === Maintenance Sessions Tab === */}
          {activeTab === 'sessions' && (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              {sessions.length === 0 && !loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No maintenance sessions yet.</p>
                  {(profile?.role === 'ame' || profile?.role === 'admin') && (
                    <button onClick={() => setShowSessionForm(true)} className="mt-2 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                      Create your first session →
                    </button>
                  )}
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Aircraft</th><th>Engineer</th>
                      <th>Type</th><th>Check</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="cursor-pointer">
                        <td className="font-mono">{s.session_date}</td>
                        <td className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{s.aircraft?.tail_number || '—'}</td>
                        <td>{s.profiles?.name || '—'}</td>
                        <td><TypeBadge type={s.maintenance_type} /></td>
                        <td className="font-mono">{s.check_type || '—'}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* === Pilot Log Tab === */}
          {activeTab === 'pilot' && (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              {pilotLogs.length === 0 && !loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No pilot log entries yet.</p>
                  {(profile?.role === 'pilot' || profile?.role === 'admin') && (
                    <button onClick={() => setShowPilotForm(true)} className="mt-2 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                      Create your first log entry →
                    </button>
                  )}
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Aircraft</th><th>From</th><th>To</th>
                      <th>Flight Hrs</th><th>Landings</th><th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pilotLogs.map((l) => (
                      <tr key={l.id}>
                        <td className="font-mono">{l.date}</td>
                        <td className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{l.aircraft?.tail_number || '—'}</td>
                        <td className="font-mono">{l.route_from}</td>
                        <td className="font-mono">{l.route_to}</td>
                        <td className="font-mono">{l.flight_hours ? `${l.flight_hours}h` : '—'}</td>
                        <td className="font-mono">{(l.landings_day || 0) + (l.landings_night || 0)}</td>
                        <td className="max-w-[200px] truncate">{l.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* === Defect Log Tab === */}
          {activeTab === 'defects' && (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              {defects.length === 0 && !loading ? (
                <div className="p-8 text-center">
                  <FiAlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No Defects Reported</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>All systems operational</p>
                  <button onClick={() => setShowDefectForm(true)} className="mt-3 text-xs font-semibold" style={{ color: 'var(--color-accent-red)' }}>
                    Report a defect →
                  </button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Aircraft</th><th>ATA</th><th>Component</th>
                      <th>Description</th><th>Severity</th><th>Reporter</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defects.map((d) => (
                      <tr key={d.id}>
                        <td className="font-mono">{d.created_at?.split('T')[0]}</td>
                        <td className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{d.aircraft?.tail_number || '—'}</td>
                        <td className="font-mono">{d.ata_chapter || '—'}</td>
                        <td>{d.component || '—'}</td>
                        <td className="max-w-[200px] truncate">{d.description}</td>
                        <td><SeverityBadge severity={d.severity} /></td>
                        <td>{d.profiles?.name || '—'}</td>
                        <td><StatusBadge status={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* === Workflow Tab === */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  🔄 Maintenance Workflow Pipeline
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {WORKFLOW_STAGES.map((stage, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <div className={`workflow-step ${i < activeStage ? 'completed' : i === activeStage ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }} onClick={() => setActiveStage(i)}>
                        <span className="text-lg">{stage.icon}</span>
                        <span className="text-[10px] font-semibold text-center leading-tight"
                          style={{ color: i <= activeStage ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {stage.label}
                        </span>
                      </div>
                      {i < WORKFLOW_STAGES.length - 1 && (
                        <div className="workflow-arrow" style={{ color: i < activeStage ? 'var(--color-accent-green)' : 'var(--color-text-muted)' }}>→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Upcoming Checks */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-l overflow-y-auto p-3 space-y-3"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: 'var(--color-text-muted)' }}>
          <FiClock className="w-3 h-3" /> Next Check Schedule
        </h3>
        {schedules.length > 0 ? schedules.map((check, i) => (
          <div key={i} className="p-3 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{check.check_type} Check</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-accent-yellow)' }}>
                {check.aircraft?.tail_number}
              </span>
            </div>
            <div className="text-[10px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
              {check.next_due ? `Due: ${check.next_due}` : check.interval_hours ? `Every ${check.interval_hours} FH` : '—'}
            </div>
            {(profile?.role === 'ame' || profile?.role === 'admin') && (
              <button onClick={() => handleStartCheck(check.check_type)}
                className="w-full py-1.5 rounded border text-[10px] font-semibold transition-all hover:border-[var(--color-accent)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', background: 'transparent' }}>
                Start Session →
              </button>
            )}
          </div>
        )) : (
          <div className="p-3 text-center">
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>No scheduled checks found</p>
          </div>
        )}
      </aside>

      {/* Modals */}
      {showPilotForm && <PilotLogbookForm onClose={() => setShowPilotForm(false)} onSaved={fetchData} />}
      {showSessionForm && <MaintenanceSessionForm onClose={() => { setShowSessionForm(false); setPrefillCheck(null); }} onSaved={fetchData} prefillCheck={prefillCheck} />}
      {showDefectForm && <DefectLogForm onClose={() => setShowDefectForm(false)} onSaved={fetchData} />}
    </div>
  );
}
