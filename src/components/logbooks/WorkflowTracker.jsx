import React from 'react';

const STAGES = [
  { id: 'report',    label: 'Pilot Report',     icon: '✈' },
  { id: 'defect',    label: 'Defect Created',   icon: '📋' },
  { id: 'assigned',  label: 'AME Assigned',     icon: '🔧' },
  { id: 'work',      label: 'Work Performed',   icon: '⚙' },
  { id: 'review',    label: 'Inspector Review', icon: '🔍' },
  { id: 'approved',  label: 'Approved',         icon: '✅' },
  { id: 'closed',    label: 'Task Closed',      icon: '🔒' },
];

export default function WorkflowTracker({ currentStageId, history = [] }) {
  // Find index of current stage
  const currentIndex = STAGES.findIndex(s => s.id === currentStageId) || 0;

  return (
    <div className="w-full py-8 px-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
      <div className="flex items-start min-w-max px-4">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          
          // Look up matching history record for timestamp and person
          const record = history.find(h => h.stage_id === stage.id);

          return (
            <div key={stage.id} className="flex items-center">
              
              {/* Stage Node */}
              <div className="flex flex-col items-center relative w-28">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 transition-all duration-300
                    ${isCompleted ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white border-4 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse' : ''}
                    ${isFuture ? 'bg-slate-800 text-slate-500 border-2 border-slate-700' : ''}
                  `}
                >
                  {isCompleted ? '✓' : stage.icon}
                </div>
                
                <div className="mt-4 text-center">
                  <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-slate-500'}`}>
                    {stage.label}
                  </div>
                  
                  {(isCompleted || isCurrent) && record && (
                    <div className="mt-2 text-[10px] text-slate-400">
                      <div className="font-mono">{new Date(record.timestamp).toLocaleDateString()}</div>
                      <div className="font-mono truncate w-24 mx-auto">{new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="mt-1 truncate w-24 mx-auto" title={record.person_name}>{record.person_name}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {index < STAGES.length - 1 && (
                <div className="w-16 h-1 mx-[-10px] relative top-[-30px] z-0 rounded-full"
                  style={{
                    background: isCompleted ? 'linear-gradient(90deg, #22c55e 0%, #3b82f6 100%)' : '#334155'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
