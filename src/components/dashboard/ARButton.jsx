import { useState, useRef } from 'react'

export default function ARButton() {
  const [arSupported, setArSupported] = useState(null)
  const [arActive, setArActive] = useState(false)
  const sessionRef = useRef(null)

  // Check AR support on mount
  useState(() => {
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
      const link = document.createElement('a')
      link.href = `intent://arvr.google.com/scene-viewer/1.0?file=${window.location.origin}/models/aircraft/a320_assembly.glb#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`
      window.open(`https://arvr.google.com/scene-viewer/1.0?file=${window.location.origin}/models/aircraft/a320_assembly.glb&mode=ar_preferred`, '_blank')
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

      // TODO: Set up AR rendering loop with hit-test for surface detection
      // This requires connecting to the Three.js renderer's XR system
    } catch (err) {
      console.error('AR failed:', err)
      alert('AR not available on this device/browser. Try Chrome on Android.')
    }
  }

  function stopAR() {
    sessionRef.current?.end()
  }

  if (arSupported === false) {
    return (
      <button
        onClick={() => alert('AR requires Chrome on Android or Safari on iOS. Open this URL on your phone.')}
        className="px-3 py-2 bg-[#111a2e] border border-[#1f2a3a] rounded-lg text-[#9ba4b4] text-xs font-mono"
      >
        📷 AR (Mobile)
      </button>
    )
  }

  return (
    <button
      onClick={arActive ? stopAR : startAR}
      className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all
        ${arActive
          ? 'bg-[#eb5757]/20 border-[#eb5757] text-[#eb5757]'
          : 'bg-[#2f80ed]/20 border-[#2f80ed] text-[#2f80ed] hover:bg-[#2f80ed]/30'
        }`}
    >
      {arActive ? '⏹ Stop AR' : '📷 AR View'}
    </button>
  )
}
