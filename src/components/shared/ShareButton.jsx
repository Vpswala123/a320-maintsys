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
        className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:border-[var(--color-accent-cyan)] hover:scale-105 active:scale-95"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent-cyan)', background: 'rgba(0,200,255,0.06)' }}>
        <FiShare2 className="w-4 h-4" /> Share
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
          <div className="relative w-full max-w-sm rounded-xl border p-5 animate-slide-up"
            style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              <FiShare2 className="inline w-4 h-4 mr-1.5" style={{ color: 'var(--color-accent-cyan)' }} />
              Share Component View
            </h3>

            {component && (
              <div className="p-2 rounded-lg border mb-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>{component.label || component.zone}</span>
                <span className="text-[10px] ml-2 font-mono" style={{ color: 'var(--color-text-muted)' }}>ATA {component.ata}</span>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input readOnly value={generateShareUrl()} className="flex-1 px-3 py-2 rounded-lg border text-[10px] font-mono outline-none"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
              <button onClick={handleCopy}
                className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all"
                style={{
                  background: copied ? 'rgba(39,174,96,0.1)' : 'rgba(47,128,237,0.1)',
                  borderColor: copied ? 'var(--color-accent-green)' : 'var(--color-accent)',
                  color: copied ? 'var(--color-accent-green)' : 'var(--color-accent)',
                }}>
                {copied ? <><FiCheck className="w-3.5 h-3.5" /> Copied</> : <><FiCopy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
              Anyone with this link can open the same 3D view with the selected component highlighted.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
