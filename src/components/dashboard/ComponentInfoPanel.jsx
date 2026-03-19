import { FiAlertTriangle } from 'react-icons/fi';

export default function ComponentInfoPanel({ component }) {
  if (!component) {
    return (
      <aside className="w-[280px] shrink-0 border-r flex flex-col p-4 bg-[var(--bg-panel)] h-full overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
          <p className="text-sm font-semibold tracking-wider text-[var(--text-secondary)]">SELECT ZONE</p>
          <p className="text-[11px] mt-2 font-mono text-[var(--text-muted)]">Click 3D model to view details</p>
        </div>
      </aside>
    );
  }

  const healthColor = component.health >= 85 ? 'var(--success)' : component.health >= 70 ? 'var(--warning)' : 'var(--error)';

  return (
    <aside className="w-[280px] shrink-0 border-r flex flex-col bg-[var(--bg-panel)] h-full overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold tracking-wide uppercase text-[var(--text-primary)]">{component.label}</h2>
        <h3 className="text-xs font-mono mt-1 text-[var(--accent-blue)]">ATA {component.ata} — {component.system}</h3>
      </div>

      {/* Health */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h4 className="label mb-2">HEALTH</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[var(--bg-panel-2)] overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${component.health || 0}%`, backgroundColor: healthColor }} />
          </div>
          <span className="font-mono font-bold text-sm" style={{ color: healthColor }}>{component.health || 0}%</span>
          {component.health < 85 && <FiAlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />}
        </div>
      </div>

      {/* Sensors */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h4 className="label mb-3">SENSOR READINGS</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">Temperature</span>
            <span className="data-value">{component.temp || 'Normal'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">EGT</span>
            <span className="data-value">{component.egt || 'Normal'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">Oil Pressure</span>
            <span className="data-value">{component.pressure || 'Normal'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">Vibration</span>
            <span className="data-value">{component.vibration || 'Low'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">Cycle Hours</span>
            <span className="data-value">{component.fh ? `${component.fh.toLocaleString()} FH` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Inspections */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h4 className="label mb-3">INSPECTIONS</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">Last</span>
            <span className="font-mono text-xs text-[var(--text-primary)]">{component.lastInsp || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">Next</span>
            <span className="font-mono text-xs text-[var(--text-primary)]">{component.nextInsp || '—'}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[var(--text-secondary)]">Status</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${component.health < 85 ? 'bg-[#f2c94c20] text-[#f2c94c]' : 'bg-[#27ae6020] text-[#27ae60]'}`}>
              {component.health < 85 ? <><FiAlertTriangle className="w-3 h-3"/> Maintenance Due</> : 'Operational'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-wrap gap-2 mt-auto">
        <button className="flex-1 btn-primary text-[10px] py-2">VIEW FULL</button>
        <button className="flex-1 btn-primary text-[10px] py-2 bg-none border" style={{ background: 'transparent', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>SHARE</button>
        <button className="flex-1 btn-primary text-[10px] py-2 bg-none border" style={{ background: 'transparent', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>LOG</button>
      </div>
    </aside>
  );
}
