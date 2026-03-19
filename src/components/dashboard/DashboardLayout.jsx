import AircraftViewer from '@/components/AircraftViewer';
import ComponentInfoPanel from './ComponentInfoPanel';
import HealthOverviewPanel from './HealthOverviewPanel';
import MaintenanceScheduleWidget from './MaintenanceScheduleWidget';
import ARButton from './ARButton';
import ShareButton from '@/components/shared/ShareButton';
import { useState } from 'react';

export default function DashboardLayout() {
  const [selectedComponent, setSelectedComponent] = useState(null);

  // AR/Share buttons are mock-placed here. In reality, they might overlay the Viewer.
  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Main Grid: Left Panel | Viewer | Right Panel */}
      <div className="flex-1 grid grid-cols-[280px_1fr_260px] overflow-hidden">
        
        {/* LEFT PANEL */}
        <ComponentInfoPanel component={selectedComponent} />

        {/* CENTER: 3D VIEWER + Overlay controls */}
        <div className="relative flex flex-col bg-[var(--bg-panel-2)]/30 backdrop-blur-sm" style={{ borderRight: '1px solid var(--border)' }}>
          {/* Status Label (Top Left) */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="bg-[var(--bg-panel)]/80 backdrop-blur border border-[var(--border)] px-4 py-2 rounded shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                <span className="text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-[0.2em]">Live Visualization</span>
              </div>
              <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Hangar Environment // Node_04
              </div>
            </div>
          </div>

          {/* AR/Share Actions (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <ARButton />
            <ShareButton component={selectedComponent} aircraft="VT-DEM" />
          </div>
          
          <div className="absolute top-4 right-4 z-10 pointers-none text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-tighter opacity-50">
            Precision: High // Latency: 12ms
          </div>

          <div className="absolute bottom-4 left-4 z-10 pointers-none text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-[0.1em] opacity-40">
            MMB: Rotate // RMB: Pan // Scroll: Zoom
          </div>

          <AircraftViewer onComponentSelect={setSelectedComponent} />
        </div>

        {/* RIGHT PANEL */}
        <HealthOverviewPanel />

      </div>

      {/* BOTTOM WIDGET */}
      <div className="h-[220px] shrink-0">
        <MaintenanceScheduleWidget />
      </div>
    </div>
  );
}
