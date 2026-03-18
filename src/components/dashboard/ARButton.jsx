import { useState } from 'react';
import { FiBox, FiSmartphone, FiAlertCircle } from 'react-icons/fi';

export default function ARButton({ modelUrl = '/aircraft.glb', componentName }) {
  const [showPanel, setShowPanel] = useState(false);
  const [arStatus, setArStatus] = useState('idle'); // idle, checking, available, unavailable

  const checkWebXR = async () => {
    if (!navigator.xr) {
      setArStatus('unavailable');
      return false;
    }
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      setArStatus(supported ? 'available' : 'unavailable');
      return supported;
    } catch {
      setArStatus('unavailable');
      return false;
    }
  };

  const startWebXR = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay'],
      });
      console.log('WebXR AR session started:', session);
      // The session would need to be connected to a Three.js renderer
      // For demo purposes, we just log the session
    } catch (err) {
      console.error('WebXR error:', err);
      setArStatus('unavailable');
    }
  };

  const handleClick = async () => {
    setShowPanel(true);
    setArStatus('checking');
    await checkWebXR();
  };

  return (
    <>
      <button onClick={handleClick}
        className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:border-[var(--color-accent)] hover:scale-105 active:scale-95"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', background: 'rgba(47,128,237,0.06)' }}>
        <FiBox className="w-4 h-4" /> AR View
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
          <div className="relative w-full max-w-sm rounded-xl border p-5 animate-slide-up"
            style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              <FiBox className="inline w-4 h-4 mr-1.5" style={{ color: 'var(--color-accent)' }} />
              Augmented Reality View
            </h3>

            {componentName && (
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Component: <span className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{componentName}</span>
              </p>
            )}

            {/* Model Viewer Fallback */}
            <div className="rounded-lg overflow-hidden mb-4 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
              <model-viewer
                src={modelUrl}
                alt="A320 Aircraft 3D Model"
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                touch-action="pan-y"
                shadow-intensity="1"
                auto-rotate
                style={{ width: '100%', height: '240px', background: 'var(--color-bg-card)' }}>
                <button slot="ar-button"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
                  <FiSmartphone className="inline w-3.5 h-3.5 mr-1" /> View in Your Space
                </button>
              </model-viewer>
            </div>

            {/* WebXR Status */}
            <div className="p-3 rounded-lg border mb-3" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${arStatus === 'available' ? 'bg-green-500' : arStatus === 'unavailable' ? 'bg-red-500' : arStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {arStatus === 'available' ? 'WebXR AR Available' : arStatus === 'unavailable' ? 'WebXR Not Available' : arStatus === 'checking' ? 'Checking...' : 'Not Checked'}
                </span>
              </div>
              {arStatus === 'available' && (
                <button onClick={startWebXR}
                  className="w-full mt-2 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-cyan))' }}>
                  Launch Immersive AR Session
                </button>
              )}
              {arStatus === 'unavailable' && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Use the model-viewer above or open on a mobile device with AR support.
                </p>
              )}
            </div>

            <div className="flex items-start gap-1.5 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
              <FiAlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>AR requires a WebXR-compatible browser (Chrome on Android). iOS uses Quick Look via model-viewer.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
