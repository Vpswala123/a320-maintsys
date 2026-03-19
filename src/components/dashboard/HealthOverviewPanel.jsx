import { FiAlertTriangle } from 'react-icons/fi';

export default function HealthOverviewPanel() {
  const systems = [
    { label: 'Overall', pct: 87 },
    { label: 'ENGINE 1', pct: 82 },
    { label: 'ENGINE 2', pct: 91 },
    { label: 'HYD SYS', pct: 68 }, // red
    { label: 'ELEC SYS', pct: 94 },
    { label: 'LAND GEAR', pct: 97 },
  ];

  const alerts = [
    { text: 'HYD PUMP — Maint Due', system: 'HYD SYS' },
    { text: 'ENG 1 — 50FH to check', system: 'ENGINE 1' }
  ];

  return (
    <aside className="w-[260px] shrink-0 border-l flex flex-col bg-[var(--bg-panel)] h-full overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-bold tracking-wide text-[var(--text-primary)]">AIRCRAFT HEALTH</h2>
      </div>

      <div className="p-4 flex-1 space-y-6">
        <div className="space-y-4">
          {systems.map((sys, i) => {
            const color = sys.pct >= 85 ? 'var(--success)' : sys.pct >= 70 ? 'var(--warning)' : 'var(--error)';
            const isOverall = sys.label === 'Overall';
            
            return (
              <div key={sys.label} className={isOverall ? 'mb-6 pb-6 border-b border-[var(--border)]' : ''}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs ${isOverall ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] uppercase'}`}>
                    {sys.label}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color }}>{sys.pct}%</span>
                </div>
                {/* Health Bar Blocks */}
                <div className="flex gap-0.5 h-2">
                  {[...Array(10)].map((_, idx) => (
                    <div key={idx} className="flex-1 rounded-sm"
                      style={{ background: (idx * 10) < sys.pct ? color : 'var(--bg-panel-2)' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alerts Section */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="label mb-3">ACTIVE ALERTS</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-2 rounded border"
                style={{ background: 'var(--bg-panel-2)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
                <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--warning)' }} />
                <span>{alert.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
