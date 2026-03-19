import { FiAlertTriangle, FiActivity, FiSearch, FiFileText, FiShare2 } from 'react-icons/fi';

export default function ComponentInfoPanel({ component }) {
  if (!component) {
    return (
      <aside className="w-[300px] shrink-0 border-r flex flex-col bg-[var(--bg-panel)] h-full overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40 group">
          <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mb-4 group-hover:border-[var(--accent-blue)] transition-colors">
            <FiSearch className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-[10px] font-bold tracking-[0.3em] text-[var(--text-secondary)] uppercase">Standby Mode</h3>
          <p className="text-[9px] mt-2 font-mono text-[var(--text-muted)] leading-relaxed uppercase">
            Awaiting structural selection via digital twin interface
          </p>
        </div>
      </aside>
    );
  }

  const healthColor = component.health >= 85 ? 'var(--success)' : component.health >= 70 ? 'var(--warning)' : 'var(--error)';

  return (
    <aside className="w-[300px] shrink-0 border-r flex flex-col bg-[var(--bg-panel)] h-full overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
      {/* Header - Technical Identity */}
      <div className="p-5 bg-[var(--bg-panel-2)]/50 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="px-1.5 py-0.5 rounded bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30">
            <span className="text-[9px] font-bold text-[var(--accent-blue)] uppercase tracking-wider">Zone {component.ata?.split('/')[0] || 'NA'}</span>
          </div>
          <div className="h-[1px] flex-1 bg-[var(--border)]" />
        </div>
        <h2 className="text-xl font-bold tracking-tighter text-[var(--text-primary)] leading-tight uppercase">{component.label}</h2>
        <div className="flex items-center gap-2 mt-2">
          <FiActivity className="w-3 h-3 text-[var(--text-muted)]" />
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
            {component.system} // ATA {component.ata}
          </span>
        </div>
      </div>

      {/* Critical Status - Health Vector */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Integrity Vector</h4>
          <span className="font-mono font-bold text-xs" style={{ color: healthColor }}>{component.health || 0}%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-[var(--bg-panel-2)] overflow-hidden border border-[var(--border)]">
          <div className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${component.health || 0}%`, backgroundColor: healthColor, boxShadow: `0 0 10px ${healthColor}40` }} />
        </div>
        {component.health < 85 && (
          <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded bg-[var(--warning)]/5 border border-[var(--warning)]/20">
            <FiAlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" />
            <span className="text-[9px] font-bold text-[var(--warning)] uppercase tracking-tighter">Degradation Detected</span>
          </div>
        )}
      </div>

      {/* Telemetry Matrix */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Telemetry Matrix</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Temp', value: component.temp || '24°C' },
            { label: 'Pressure', value: component.pressure || '29PSI' },
            { label: 'Cycles', value: component.cycles?.toLocaleString() || '12,405' },
            { label: 'Hours', value: component.fh ? `${component.fh.toLocaleString()} FH` : '42,650' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block">{item.label}</span>
              <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle & Scheduling */}
      <div className="p-5 flex-1">
        <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Lifecycle Events</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] mt-1.5" />
            <div>
              <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-0.5">Last Inspection</span>
              <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">{component.lastInsp || '2026-01-10'}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] mt-1.5 shadow-[0_0_5px_var(--accent-blue)]" />
            <div>
              <span className="text-[9px] text-[var(--text-muted)] uppercase block mb-0.5">Next Check Required</span>
              <span className="text-[10px] font-mono font-bold text-[var(--accent-blue)]">{component.nextInsp || '2026-05-15'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Protocol Overlay */}
      <div className="p-5 bg-[var(--bg-panel-2)]/80 border-t border-[var(--border)] flex gap-2">
        <button className="flex-1 h-9 flex items-center justify-center gap-2 rounded border border-[var(--border-light)] bg-[var(--bg-panel)] text-[9px] font-bold text-[var(--text-primary)] uppercase tracking-widest hover:border-[var(--accent-blue)] transition-all">
          <FiFileText className="w-3.5 h-3.5 text-[var(--accent-blue)]" /> AMM
        </button>
        <button className="flex-1 h-9 flex items-center justify-center gap-2 rounded border border-[var(--border-light)] bg-[var(--bg-panel)] text-[9px] font-bold text-[var(--text-primary)] uppercase tracking-widest hover:border-[var(--accent-cyan)] transition-all">
          <FiShare2 className="w-3.5 h-3.5 text-[var(--accent-cyan)]" /> Link
        </button>
      </div>
    </aside>
  );
}
