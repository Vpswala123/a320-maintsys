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
        <div className="relative flex flex-col border-r bg-black/20" style={{ borderColor: 'var(--border)' }}>
          {/* Overlay controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <ARButton componentName={selectedComponent?.label} />
            <ShareButton component={selectedComponent} aircraft="VT-DEM" />
          </div>
          
          <div className="absolute top-4 left-4 z-10 pointers-none">
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] px-3 py-1.5 rounded text-xs font-mono font-bold text-[var(--accent-blue)]">
              A320 in hangar environment
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-10 pointers-none text-[10px] text-[var(--text-muted)] font-mono">
            [Rotate / Zoom / Pan]
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
