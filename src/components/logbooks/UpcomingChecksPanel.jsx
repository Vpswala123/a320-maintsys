import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiClock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function UpcomingChecksPanel({ aircraftId, onStartCheck }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFH, setCurrentFH] = useState(0); // This should ideally come from aircraft data

  useEffect(() => {
    async function fetchChecks() {
      if (!aircraftId) return;
      setLoading(true);
      
      // Get aircraft details for current flight hours
      const { data: ac } = await supabase.from('aircraft').select('total_flight_hours').eq('id', aircraftId).single();
      if (ac) setCurrentFH(ac.total_flight_hours || 0);

      // Get schedule
      const { data } = await supabase
        .from('maintenance_schedule')
        .select('*')
        .eq('aircraft_id', aircraftId)
        .order('next_due_fh', { ascending: true });
        
      setSchedule(data || []);
      setLoading(false);
    }
    fetchChecks();
  }, [aircraftId]);

  function getCheckStatus(item, current) {
    const remainingFH = (item.next_due_fh || 0) - current;
    if (remainingFH <= 0) return 'overdue';
    if (remainingFH <= 50) return 'due_soon';
    return 'ok';
  }

  if (!aircraftId) {
    return (
      <div className="p-4 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
        <p className="text-sm text-slate-500 font-semibold">Select an aircraft to view upcoming checks.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <FiClock className="text-blue-400 w-5 h-5" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Checks</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {schedule.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No scheduled checks found.</p>
        ) : (
          schedule.map((check) => {
            const status = getCheckStatus(check, currentFH);
            const remaining = (check.next_due_fh || 0) - currentFH;
            
            return (
              <div key={check.id} className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors 
                ${status === 'overdue' ? 'bg-red-500/10 border-red-500/30' : 
                  status === 'due_soon' ? 'bg-yellow-500/10 border-yellow-500/30' : 
                  'bg-slate-800 border-slate-700'}`}>
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {status === 'overdue' ? <FiAlertTriangle className="text-red-500 w-4 h-4" /> : 
                       status === 'due_soon' ? <FiAlertTriangle className="text-yellow-500 w-4 h-4" /> : 
                       <FiCheckCircle className="text-green-500 w-4 h-4" />}
                      {check.check_type} Check
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Interval: {check.interval_hours} FH</p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded
                      ${status === 'overdue' ? 'bg-red-500/20 text-red-400' : 
                        status === 'due_soon' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-300'}`}>
                      {check.next_due_fh} FH
                    </span>
                    <p className={`text-[9px] mt-1 ${status === 'overdue' ? 'text-red-400' : 'text-slate-500'}`}>
                      {remaining > 0 ? `${remaining} FH left` : `Overdue by ${Math.abs(remaining)} FH`}
                    </p>
                  </div>
                </div>

                {onStartCheck && (
                  <button 
                    onClick={() => onStartCheck(check.check_type)}
                    className="mt-1 w-full py-1.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-blue-400 hover:bg-slate-800 hover:border-blue-500 transition-colors">
                    Start Session →
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
