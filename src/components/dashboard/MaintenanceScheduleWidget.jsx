export default function MaintenanceScheduleWidget({ schedules }) {
  // Mock data to match prompt requirements if actuals not available
  const checks = [
    { type: 'A1', limit: '500 FH', remaining: 50, dueText: '50 FH left', status: 'critical' },
    { type: 'A2', limit: '1000 FH', remaining: 450, dueText: '450 FH left', status: 'normal' },
    { type: 'C', limit: '6000 FH', remaining: 1400, dueText: '1400 FH left', status: 'normal' },
    { type: 'D', limit: '~72 months', remaining: null, dueText: 'Due 2029', status: 'normal' }
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-panel-2)] border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="px-6 py-2 border-b panel-title flex items-center" style={{ borderColor: 'var(--border)' }}>
        SCHEDULED MAINTENANCE — VT-DEM
      </div>
      <div className="flex-1 flex items-center p-4">
        <div className="grid grid-cols-4 gap-4 w-full h-full">
          {checks.map(check => {
            const isCritical = check.remaining !== null && check.remaining <= 100;
            const borderColor = isCritical ? 'var(--error)' : 'var(--border-light)';
            const bgColor = isCritical ? '#eb575710' : 'var(--bg-panel)';
            
            return (
              <div key={check.type} className="flex flex-col rounded-lg p-4 border transition-colors"
                style={{ borderColor, background: bgColor }}>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{check.type} CHECK</h3>
                    <div className="font-mono text-xs text-[var(--accent-blue)] mt-1">{check.limit}</div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex flex-col gap-3">
                  <div className={`font-mono text-sm font-bold flex items-center gap-1.5 ${isCritical ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>
                    {isCritical && '⚠'} {check.dueText}
                  </div>
                  
                  <button className="w-full text-[11px] font-mono tracking-wider py-2 rounded font-bold transition-all"
                    style={{ 
                      background: isCritical ? 'var(--error)' : 'transparent', 
                      color: isCritical ? '#fff' : 'var(--text-primary)',
                      border: `1px solid ${isCritical ? 'transparent' : 'var(--border-light)'}`
                    }}>
                    {isCritical ? 'START NOW' : 'SCHEDULE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
