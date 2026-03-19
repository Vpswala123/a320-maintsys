import { useState, useRef, useEffect } from 'react'
import { FiCamera, FiStopCircle, FiInfo } from 'react-icons/fi'

export default function ARButton() {
  const [arSupported, setArSupported] = useState(null)
  const [arActive, setArActive] = useState(false)
  const sessionRef = useRef(null)

  // Check AR support on mount
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(supported => {
        setArSupported(supported)
      })
    } else {
      setArSupported(false)
    }
  }, [])

  async function startAR() {
    if (!navigator.xr || !arSupported) {
      // Fallback: open model-viewer AR
      const arUrl = `https://arvr.google.com/scene-viewer/1.0?file=${window.location.origin}/aircraft.glb&mode=ar_preferred`;
      window.open(arUrl, '_blank')
      return
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      })
      sessionRef.current = session
      setArActive(true)

      session.addEventListener('end', () => {
        setArActive(false)
        sessionRef.current = null
      })
    } catch (err) {
      console.error('AR failed:', err)
      alert('AR initialization failed. Ensure you are using a compatible mobile browser (Chrome/Android or Safari/iOS).')
    }
  }

  function stopAR() {
    sessionRef.current?.end()
  }

  if (arSupported === false) {
    return (
      <button
        onClick={() => alert('Spatial Visualization requires a compatible mobile device with AR capabilities (Chrome on Android or Safari on iOS).')}
        className="h-9 px-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:border-[var(--border-light)] hover:text-[var(--text-primary)] transition-all"
      >
        <FiInfo className="w-3.5 h-3.5 opacity-60" /> AR Mobile
      </button>
    )
  }

  return (
    <button
      onClick={arActive ? stopAR : startAR}
      className={`h-9 px-4 rounded text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 shadow-lg
        ${arActive
          ? 'bg-[var(--error)]/10 border-[var(--error)] text-[var(--error)]'
          : 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20 shadow-[var(--accent-blue)]/5'
        }`}
    >
      {arActive ? (
        <><FiStopCircle className="w-4 h-4" /> Terminate AR</>
      ) : (
        <><FiCamera className="w-4 h-4 text-[var(--accent-cyan)]" /> Spatial View</>
      )}
    </button>
  )
}
