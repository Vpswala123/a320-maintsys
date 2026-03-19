import { FiClock, FiCalendar, FiPlay, FiSettings } from 'react-icons/fi';

export default function MaintenanceScheduleWidget({ schedules }) {
  const checks = [
    { type: 'A1 Check', limit: '500 FH', remaining: 50, dueText: '50 FH REMAINING', status: 'critical' },
    { type: 'A2 Check', limit: '1000 FH', remaining: 450, dueText: '450 FH REMAINING', status: 'normal' },
    { type: 'C Check', limit: '6000 FH', remaining: 1400, dueText: '1400 FH REMAINING', status: 'normal' },
    { type: 'D Check', limit: '72 MONTHS', remaining: null, dueText: 'DUE MAY 2029', status: 'normal' }
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-panel-2)]/30 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="px-6 h-10 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <FiCalendar className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">Active Maintenance Protocols</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--error)] shadow-[0_0_5px_var(--error)]" />
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest font-mono">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest font-mono">Scheduled</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-5 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {checks.map(check => {
            const isCritical = check.remaining !== null && check.remaining <= 100;
            const accentColor = isCritical ? 'var(--error)' : 'var(--accent-blue)';
            
            return (
              <div key={check.type} className="w-[280px] flex flex-col rounded border bg-[var(--bg-panel)] p-4 transition-all hover:border-[var(--border-light)] group relative overflow-hidden"
                style={{ borderColor: isCritical ? 'var(--error)' : 'var(--border)' }}>
                
                {isCritical && (
                  <div className="absolute top-0 right-0 p-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                    <FiClock className="w-3.5 h-3.5 text-[var(--error)]" />
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest mb-1">{check.type}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">Limit Threshold:</span>
                    <span className="text-[10px] font-mono font-bold text-[var(--accent-cyan)]">{check.limit}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isCritical ? 'text-[var(--error)] animate-pulse' : 'text-[var(--text-secondary)]'}`}>
                      {check.dueText}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className={`flex-[2] h-8 rounded text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                      ${isCritical 
                        ? 'bg-[var(--error)] text-white hover:bg-[var(--error)]/90 shadow-[0_4px_10px_var(--error)]/20' 
                        : 'bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30 text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20'}`}>
                      {isCritical ? <><FiPlay className="w-3 h-3" /> Initiate</> : <><FiSettings className="w-3 h-3" /> Execute</>}
                    </button>
                    <button className="flex-1 h-8 rounded border border-[var(--border-light)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] hover:border-[var(--border)] transition-all">
                      Logs
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
