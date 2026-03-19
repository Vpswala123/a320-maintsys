import { FiAlertTriangle, FiActivity, FiShield, FiTrendingUp } from 'react-icons/fi';

export default function HealthOverviewPanel() {
  const systems = [
    { label: 'Airframe Integrity', pct: 98, trend: 'stable' },
    { label: 'Propulsion [ENG 1]', pct: 82, trend: 'desc' },
    { label: 'Propulsion [ENG 2]', pct: 91, trend: 'stable' },
    { label: 'Hydraulic Vector [A]', pct: 68, trend: 'desc' }, // error
    { label: 'Avionics Matrix', pct: 94, trend: 'stable' },
    { label: 'Pneumatic Flow', pct: 89, trend: 'stable' },
  ];

  const alerts = [
    { text: 'HYD PUMP A — Thermal Breach Detected', system: 'HYD SYS', severity: 'error' },
    { text: 'ENG 1 — Low Pressure Transient', system: 'ENGINE 1', severity: 'warning' }
  ];

  return (
    <aside className="w-[300px] shrink-0 border-l flex flex-col bg-[var(--bg-panel)] h-full overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
      {/* Header - Fleet Analytics */}
      <div className="p-5 bg-[var(--bg-panel-2)]/50 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-[var(--accent-blue)] uppercase">Fleet Analytics</h2>
          <FiTrendingUp className="w-4 h-4 text-[var(--text-muted)] opacity-50" />
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold tracking-tighter text-[var(--text-primary)]">87.4<span className="text-[var(--text-muted)] text-xl">%</span></span>
          <div className="mb-1.5 px-2 py-0.5 rounded bg-[var(--success)]/10 border border-[var(--success)]/20">
            <span className="text-[9px] font-bold text-[var(--success)] uppercase">Fleet Norm</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 space-y-8">
        {/* System Matrix */}
        <div className="space-y-5">
          {systems.map((sys, i) => {
            const color = sys.pct >= 85 ? 'var(--success)' : sys.pct >= 70 ? 'var(--warning)' : 'var(--error)';
            const isCritical = sys.pct < 70;
            
            return (
              <div key={sys.label} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">
                    {sys.label}
                  </span>
                  <span className="font-mono text-[11px] font-bold" style={{ color }}>{sys.pct}%</span>
                </div>
                {/* Digital Segment Bar */}
                <div className="flex gap-0.5 h-1.5">
                  {[...Array(15)].map((_, idx) => (
                    <div key={idx} className="flex-1 rounded-[1px] transition-all duration-300"
                      style={{ 
                        background: (idx / 15 * 100) < sys.pct ? color : 'var(--bg-panel-2)',
                        opacity: (idx / 15 * 100) < sys.pct ? 1 : 0.3,
                        boxShadow: (idx / 15 * 100) < sys.pct && isCritical ? `0 0 5px ${color}` : 'none'
                      }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tactical Alerts */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <FiShield className="w-3 h-3" /> Tactical Alerts
          </h4>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded border transition-all hover:translate-x-1 cursor-default
                ${alert.severity === 'error' 
                  ? 'bg-[var(--error)]/5 border-[var(--error)]/30 border-l-2 border-l-[var(--error)]' 
                  : 'bg-[var(--warning)]/5 border-[var(--warning)]/30 border-l-2 border-l-[var(--warning)]'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <FiAlertTriangle className={`w-3.5 h-3.5 ${alert.severity === 'error' ? 'text-[var(--error)]' : 'text-[var(--warning)]'}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${alert.severity === 'error' ? 'text-[var(--error)]' : 'text-[var(--warning)]'}`}>
                    {alert.system} Priority
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-primary)] leading-snug font-medium">
                  {alert.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
