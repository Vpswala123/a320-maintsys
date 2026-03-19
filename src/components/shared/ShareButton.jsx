import { useState } from 'react';
import { FiShare2, FiCopy, FiCheck } from 'react-icons/fi';

export default function ShareButton({ component, aircraft }) {
  const [showPanel, setShowPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const params = new URLSearchParams();
    if (component?.zone) params.set('zone', component.zone);
    if (component?.label) params.set('component', component.label);
    if (aircraft) params.set('aircraft', aircraft);
    return `${window.location.origin}/dashboard?${params.toString()}`;
  };

  const handleCopy = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button onClick={() => setShowPanel(true)}
        className="h-9 px-4 rounded border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 active:scale-95 shadow-lg shadow-[var(--accent-cyan)]/5"
        style={{ borderColor: 'var(--border)', color: 'var(--accent-cyan)', background: 'var(--bg-panel)' }}>
        <FiShare2 className="w-4 h-4" /> Share Hub
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-[var(--bg-primary)]/60" />
          <div className="relative w-full max-w-sm panel p-6 animate-slide-up shadow-2xl border-[var(--border-light)] bg-[var(--bg-panel)]/90 backdrop-blur-2xl"
            onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center gap-2">
                <FiShare2 className="w-4 h-4 text-[var(--accent-cyan)]" />
                Data Provisioning
              </h3>
              <button onClick={() => setShowPanel(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">✕</button>
            </div>

            {component && (
              <div className="p-4 rounded border mb-5 bg-[var(--bg-panel-2)] border-[var(--border)] group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-wider">{component.label || component.zone}</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">ATA {component.ata}</span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] leading-snug">
                  Holographic context sync ready for external transmission.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input readOnly value={generateShareUrl()} 
                    className="w-full px-3 py-2.5 rounded border text-[10px] font-mono outline-none bg-[var(--bg-panel-2)] border-[var(--border)] text-[var(--text-secondary)] focus:border-[var(--accent-blue)] transition-colors" />
                </div>
                <button onClick={handleCopy}
                  className={`px-4 rounded border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md
                    ${copied 
                      ? 'bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]' 
                      : 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20'
                    }`}>
                  {copied ? <><FiCheck className="w-3.5 h-3.5" /> Copied</> : <><FiCopy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>

              <p className="text-[9px] text-[var(--text-muted)] text-center font-mono uppercase tracking-wider leading-relaxed">
                Persistent link generated. Remote node will inherit current visualization parameters.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
