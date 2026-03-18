import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import AircraftViewer from '@/components/AircraftViewer';
import ARButton from '@/components/dashboard/ARButton';
import ShareButton from '@/components/shared/ShareButton';
import { FiAlertTriangle, FiClock, FiFileText, FiActivity, FiThermometer, FiTool } from 'react-icons/fi';

function HealthBar({ value }) {
  const color = value >= 85 ? 'var(--color-accent-green)' : value >= 70 ? 'var(--color-accent-yellow)' : 'var(--color-accent-red)';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [aircraft, setAircraft] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch aircraft list
    supabase.from('aircraft').select('id, tail_number, aircraft_type').order('tail_number')
      .then(({ data }) => {
        setAircraft(data || []);
        if (data?.length > 0) setSelectedAircraftId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedAircraftId) return;
    // Fetch data for selected aircraft
    Promise.all([
      supabase.from('maintenance_schedule').select('*').eq('aircraft_id', selectedAircraftId).order('next_due'),
      supabase.from('maintenance_sessions').select('*, profiles:engineer_id(name)').eq('aircraft_id', selectedAircraftId).order('created_at', { ascending: false }).limit(5),
      supabase.from('components').select('*').eq('aircraft_id', selectedAircraftId).lt('health', 85).order('health'),
    ]).then(([schedRes, logRes, alertRes]) => {
      setSchedules(schedRes.data || []);
      setRecentLogs(logRes.data || []);
      setAlerts(alertRes.data || []);
    });
  }, [selectedAircraftId]);

  const selectedAc = aircraft.find(a => a.id === selectedAircraftId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <select value={selectedAircraftId} onChange={e => setSelectedAircraftId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold outline-none"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
            {aircraft.map(a => <option key={a.id} value={a.id}>{a.tail_number} ({a.aircraft_type})</option>)}
          </select>
          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>DIGITAL TWIN</span>
        </div>
        <div className="flex items-center gap-2">
          <ARButton componentName={selectedComponent?.label} />
          <ShareButton component={selectedComponent} aircraft={selectedAc?.tail_number} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Component Info Panel */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r overflow-y-auto p-3 space-y-3"
          style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}>
          
          {/* Component Info */}
          {selectedComponent ? (
            <div className="p-3 rounded-xl border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <h4 className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{selectedComponent.label}</h4>
              <p className="text-[10px] font-mono mb-2" style={{ color: 'var(--color-accent)' }}>ATA {selectedComponent.ata}</p>
              <div className="space-y-1.5 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex justify-between"><span>System</span><span className="font-mono">{selectedComponent.system}</span></div>
                <div className="flex justify-between"><span>Health</span><span className="font-mono font-bold" style={{ color: selectedComponent.health >= 85 ? 'var(--color-accent-green)' : selectedComponent.health >= 70 ? 'var(--color-accent-yellow)' : 'var(--color-accent-red)' }}>{selectedComponent.health}%</span></div>
                <HealthBar value={selectedComponent.health} />
                <div className="flex justify-between"><span>Temp</span><span className="font-mono">{selectedComponent.temp}</span></div>
                {selectedComponent.pressure !== '—' && <div className="flex justify-between"><span>Pressure</span><span className="font-mono">{selectedComponent.pressure}</span></div>}
                <div className="flex justify-between"><span>Cycles</span><span className="font-mono">{selectedComponent.cycles?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Flight Hrs</span><span className="font-mono">{selectedComponent.fh?.toLocaleString()}</span></div>
              </div>
              <hr className="my-2" style={{ borderColor: 'var(--color-border)' }} />
              <div className="space-y-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex justify-between"><span>Last Insp</span><span className="font-mono">{selectedComponent.lastInsp}</span></div>
                <div className="flex justify-between"><span>Next Insp</span><span className="font-mono">{selectedComponent.nextInsp}</span></div>
              </div>
              {selectedComponent.warnings?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedComponent.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1 text-[9px] px-2 py-1 rounded"
                      style={{ background: 'rgba(242,201,76,0.08)', color: 'var(--color-accent-yellow)' }}>
                      <FiAlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <FiActivity className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Click a component</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>to view telemetry data</p>
            </div>
          )}

          {/* Alerts */}
          <div>
            <h4 className="text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5"
              style={{ color: 'var(--color-text-muted)' }}>
              <FiAlertTriangle className="w-3 h-3" /> Active Alerts ({alerts.length})
            </h4>
            {alerts.length === 0 ? (
              <div className="p-2 rounded-lg text-[10px] text-center" style={{ color: 'var(--color-accent-green)' }}>
                ✅ No active alerts
              </div>
            ) : alerts.slice(0, 4).map((a, i) => (
              <div key={i} className="p-2 rounded-lg border mb-1 text-[10px]"
                style={{ background: `${a.warning_status === 'critical' ? 'rgba(235,87,87,0.06)' : 'rgba(242,201,76,0.06)'}`, borderColor: 'var(--color-border)' }}>
                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{a.name}</div>
                <div className="font-mono" style={{ color: a.warning_status === 'critical' ? 'var(--color-accent-red)' : 'var(--color-accent-yellow)' }}>
                  Health: {Number(a.health).toFixed(0)}% • ATA {a.ata_chapter}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: 3D Viewer */}
        <div className="flex-1 relative">
          <AircraftViewer onComponentSelect={setSelectedComponent} />
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="shrink-0 border-t px-4 py-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-panel)' }}>
        <div className="grid grid-cols-3 gap-3">
          {/* Health Summary */}
          <div className="p-2 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h5 className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}>
              <FiThermometer className="w-3 h-3" /> Component Health
            </h5>
            <div className="space-y-1">
              {[
                { label: 'Engine (CFM56)', pct: 93 },
                { label: 'Landing Gear', pct: 86 },
                { label: 'APU', pct: 82 },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] w-24 truncate" style={{ color: 'var(--color-text-secondary)' }}>{c.label}</span>
                  <HealthBar value={c.pct} />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="p-2 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h5 className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}>
              <FiClock className="w-3 h-3" /> Upcoming Maintenance
            </h5>
            <div className="space-y-1">
              {schedules.length > 0 ? schedules.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{s.check_type} Check</span>
                  <span className="font-mono" style={{ color: 'var(--color-accent-yellow)' }}>{s.next_due || `${s.interval_hours} FH`}</span>
                </div>
              )) : (
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>No scheduled checks</p>
              )}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="p-2 rounded-lg border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h5 className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}>
              <FiFileText className="w-3 h-3" /> Recent Logs
            </h5>
            <div className="space-y-1">
              {recentLogs.length > 0 ? recentLogs.slice(0, 3).map((l, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span style={{ color: 'var(--color-text-secondary)' }}>{l.maintenance_type === 'scheduled' ? '✓' : '⚠'} {l.check_type || l.maintenance_type}</span>
                  <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>{l.session_date}</span>
                </div>
              )) : (
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>No recent logs</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
