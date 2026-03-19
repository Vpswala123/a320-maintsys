import React from 'react';
import { FiSmartphone, FiCpu, FiShield, FiExternalLink, FiLayers } from 'react-icons/fi';

export default function ARSharePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background Tech Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-blue)]/5 blur-[120px] rounded-full" />
      
      {/* Header */}
      <div className="relative z-10 text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 mb-4">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--accent-cyan)] tracking-[0.3em] uppercase">Digital Twin Provisioning</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-[var(--text-primary)] mb-2">
          AR <span className="text-[var(--accent-blue)]">Spatial Link</span>
        </h1>
        <p className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
          Initialize holographic overlay for on-site structural inspection
        </p>
      </div>

      {/* Main Provisioning Panel */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
        
        {/* Left: Session Telemetry */}
        <div className="panel p-8 bg-[var(--bg-panel)]/80 backdrop-blur-xl flex flex-col justify-between border-[var(--border-light)] shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded bg-[var(--bg-panel-2)] border border-[var(--border)] text-[var(--accent-blue)]">
                <FiCpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Active Core Process</h3>
                <p className="text-[10px] font-mono text-[var(--text-muted)]">NODE_AUTO_SYNC_ENABLED</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block pl-1">Configuration Parameters</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-[var(--bg-panel-2)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-muted)] block mb-1 uppercase">AIRCRAFT ID</span>
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">A320-MS-2024</span>
                  </div>
                  <div className="p-3 rounded bg-[var(--bg-panel-2)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-muted)] block mb-1 uppercase">SYNC STATUS</span>
                    <span className="text-xs font-mono font-bold text-[var(--success)]">LOCKED</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block pl-1">Security Protocol</label>
                <div className="p-4 rounded border border-[var(--border)] bg-[var(--bg-panel-2)]/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <FiShield className="text-[var(--accent-blue)] w-4 h-4" />
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                      End-to-end encrypted spatial data tunnel established.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiLayers className="text-[var(--accent-cyan)] w-4 h-4" />
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                      Supporting 1:1 scale holographic projection (WebXR).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)] hidden md:block">
            <p className="text-[9px] font-mono text-[var(--text-muted)] leading-relaxed uppercase tracking-wider">
              Verification node: <span className="text-[var(--text-secondary)]">0xAF32...D9</span>
              <br />
              Generated: {new Date().toLocaleTimeString()} UTC
            </p>
          </div>
        </div>

        {/* Right: QR Provisioning */}
        <div className="panel p-10 bg-[var(--bg-panel-2)] border-[var(--border-light)] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
          {/* Animated Tech Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--accent-blue)] opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--accent-blue)] opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--accent-blue)] opacity-40 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--accent-blue)] opacity-40 group-hover:opacity-100 transition-opacity" />

          <div className="relative mb-8 p-3 bg-white/5 rounded-xl border border-[var(--border-light)] group-hover:scale-[1.02] transition-transform duration-500">
            <img 
              src="/assets/ar-qr.png" 
              alt="AR Provisioning QR" 
              className="w-48 h-48 rounded-lg shadow-2xl"
            />
            {/* Scan animation line */}
            <div className="absolute top-3 left-3 right-3 h-[1px] bg-[var(--accent-cyan)] shadow-[0_0_15px_var(--accent-cyan)] animate-scan opacity-60" />
          </div>

          <div className="text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-[0.2em]">Scan to Activate</h3>
              <p className="text-[10px] text-[var(--text-muted)] max-w-[200px] mx-auto">
                Open your device camera or AR viewer to initialize the session.
              </p>
            </div>

            <button className="h-11 px-6 rounded bg-[var(--bg-panel)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-blue)] transition-all flex items-center gap-2 mx-auto uppercase tracking-widest shadow-xl">
              <FiExternalLink className="w-4 h-4" /> Manual Access Link
            </button>
          </div>
        </div>

      </div>

      {/* Device Icons Compatibility */}
      <div className="mt-12 flex items-center gap-12 text-[var(--text-muted)] animate-fade-in delay-200">
        <div className="flex flex-col items-center gap-3">
          <FiSmartphone className="w-8 h-8 opacity-40" />
          <span className="text-[9px] font-bold uppercase tracking-widest">iOS Vision</span>
        </div>
        <div className="w-[1px] h-8 bg-[var(--border)]" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 opacity-40 flex items-center justify-center font-bold text-xl">A</div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Android Spatial</span>
        </div>
        <div className="w-[1px] h-8 bg-[var(--border)]" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 opacity-40 flex items-center justify-center font-bold">WebXR</div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Browser Native</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-[9px] font-mono text-[var(--text-muted)] opacity-40 uppercase tracking-widest">
        Proprietary AR Streaming Protocol v2.4 // Air-to-Ground Data Link Encrypted
      </div>
    </div>
  );
}
