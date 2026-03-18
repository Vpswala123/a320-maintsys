import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Zone info lookup
const ZONE_INFO = {
  engine:       { zone: 'engine', ata: '71/72', label: 'Engine (CFM56-5B)', system: 'Powerplant' },
  wing:         { zone: 'wing', ata: '57/27', label: 'Wing Assembly', system: 'Wings / Flight Controls' },
  landing_gear: { zone: 'landing_gear', ata: '32', label: 'Landing Gear', system: 'Landing Gear' },
  empennage:    { zone: 'empennage', ata: '55/27', label: 'Empennage', system: 'Stabilizers' },
  fuselage:     { zone: 'fuselage', ata: '53', label: 'Fuselage', system: 'Fuselage Structure' },
  cockpit:      { zone: 'cockpit', ata: '31', label: 'Cockpit / Avionics', system: 'Instruments' },
  doors:        { zone: 'doors', ata: '52', label: 'Doors', system: 'Doors' },
  pylon:        { zone: 'pylon', ata: '54', label: 'Nacelles / Pylons', system: 'Nacelles' },
  apu:          { zone: 'apu', ata: '49', label: 'APU', system: 'Auxiliary Power' },
  cabin:        { zone: 'cabin', ata: '25', label: 'Cabin / Furnishings', system: 'Equipment' },
};

// Keyword-based mapping (checked first)
const ZONE_KEYWORDS = [
  { keywords: ['engine', 'nacelle', 'fan', 'cfm', 'turbine', 'compressor'], zone: 'engine' },
  { keywords: ['wing', 'spar', 'rib', 'aileron', 'flap', 'slat', 'spoiler'], zone: 'wing' },
  { keywords: ['gear', 'landing', 'wheel', 'brake', 'strut', 'tire', 'bogey'], zone: 'landing_gear' },
  { keywords: ['tail', 'stab', 'rudder', 'elevator', 'vertical', 'horizontal', 'fin'], zone: 'empennage' },
  { keywords: ['cockpit', 'windshield', 'nose', 'radome', 'window_front'], zone: 'cockpit' },
  { keywords: ['door', 'hatch', 'exit', 'cargo_door'], zone: 'doors' },
  { keywords: ['pylon', 'mount', 'engine_mount'], zone: 'pylon' },
  { keywords: ['apu', 'auxiliary'], zone: 'apu' },
  { keywords: ['window', 'cabin', 'passenger', 'seat', 'floor', 'interior'], zone: 'cabin' },
  { keywords: ['fuselage', 'body', 'skin', 'frame', 'stringer', 'belly'], zone: 'fuselage' },
];

// Simulated component telemetry per zone
const ZONE_DATA = {
  engine: { health: 93, temp: '580°C', pressure: '320 PSI', cycles: 12040, fh: 42650, nextInsp: '2026-05-10', lastInsp: '2026-01-10', status: 'normal', warnings: [] },
  wing: { health: 96, temp: '21°C', pressure: '—', cycles: 24500, fh: 42650, nextInsp: '2026-12-15', lastInsp: '2025-06-15', status: 'normal', warnings: [] },
  landing_gear: { health: 86, temp: '37°C', pressure: '2935 PSI', cycles: 8600, fh: 42650, nextInsp: '2026-04-20', lastInsp: '2026-02-20', status: 'caution', warnings: ['Tire wear approaching limit', 'Brake disc thickness marginal'] },
  empennage: { health: 98, temp: '15°C', pressure: '—', cycles: 24500, fh: 42650, nextInsp: '2026-12-15', lastInsp: '2025-06-15', status: 'normal', warnings: [] },
  fuselage: { health: 95, temp: '22°C', pressure: '—', cycles: 24500, fh: 42650, nextInsp: '2026-12-15', lastInsp: '2025-06-15', status: 'normal', warnings: [] },
  cockpit: { health: 97, temp: '35°C', pressure: '—', cycles: 24500, fh: 42650, nextInsp: '2026-09-01', lastInsp: '2025-09-01', status: 'normal', warnings: [] },
  doors: { health: 95, temp: '22°C', pressure: '—', cycles: 24500, fh: 42650, nextInsp: '2026-09-01', lastInsp: '2025-09-01', status: 'normal', warnings: [] },
  pylon: { health: 94, temp: '45°C', pressure: '—', cycles: 12040, fh: 42650, nextInsp: '2026-05-10', lastInsp: '2026-01-10', status: 'normal', warnings: [] },
  apu: { health: 82, temp: '380°C', pressure: '—', cycles: 15400, fh: 42650, nextInsp: '2026-06-01', lastInsp: '2025-12-01', status: 'caution', warnings: ['EGT approaching limit during hot starts'] },
  cabin: { health: 91, temp: '24°C', pressure: '—', cycles: 24500, fh: 42650, nextInsp: '2026-09-01', lastInsp: '2025-09-01', status: 'normal', warnings: [] },
};

// Try to classify by mesh name first
function classifyByName(meshName) {
  const lower = (meshName || '').toLowerCase();
  if (!lower) return null;
  for (const entry of ZONE_KEYWORDS) {
    if (entry.keywords.some(kw => lower.includes(kw))) return ZONE_INFO[entry.zone];
  }
  return null;
}

// Classify by 3D position relative to model bounding box (normalized 0-1)
// Aircraft typically oriented: nose = +Z or -Z, wings = +/-X, top = +Y
// We normalize the hit point to the model bounding box to get 0-1 coords
function classifyByPosition(localPoint, bbox) {
  const size = bbox.getSize(new THREE.Vector3());
  const min = bbox.min;

  // Normalize point to 0..1 within the bounding box
  const nx = (localPoint.x - min.x) / (size.x || 1); // 0=left, 1=right
  const ny = (localPoint.y - min.y) / (size.y || 1); // 0=bottom, 1=top
  const nz = (localPoint.z - min.z) / (size.z || 1); // 0=tail, 1=nose (may be inverted)

  // Determine the longest axis (fuselage axis)
  const isXLongest = size.x >= size.y && size.x >= size.z;
  const isZLongest = size.z >= size.x && size.z >= size.y;

  // Use the longest horizontal axis as the fuselage axis
  let along, across, up;
  if (isXLongest) {
    along = nx; across = nz; up = ny;
  } else if (isZLongest) {
    along = nz; across = nx; up = ny;
  } else {
    along = nz; across = nx; up = ny;
  }

  // Bottom of aircraft = landing gear
  if (up < 0.2) {
    return ZONE_INFO.landing_gear;
  }

  // Nose / cockpit region (front 12%)
  if (along > 0.88 || along < 0.12) {
    // Check which end is the nose - cockpit is typically at one end
    if (up > 0.5) return ZONE_INFO.cockpit;
    return ZONE_INFO.landing_gear;
  }

  // Tail / empennage (rear 20%)
  if (along > 0.80 || along < 0.20) {
    if (up > 0.6) return ZONE_INFO.empennage;
    // Very rear + high = APU
    if ((along > 0.90 || along < 0.10) && up > 0.3) return ZONE_INFO.apu;
    return ZONE_INFO.empennage;
  }

  // Wings / engines (sides - far from center X or Z)
  const distFromCenter = Math.abs(across - 0.5);
  if (distFromCenter > 0.25) {
    // Under the wing = engine/pylon
    if (up < 0.35) {
      return distFromCenter > 0.3 ? ZONE_INFO.engine : ZONE_INFO.pylon;
    }
    return ZONE_INFO.wing;
  }

  // Middle section, upper = cabin/doors, lower = fuselage
  if (up > 0.45 && distFromCenter > 0.15) {
    return ZONE_INFO.doors;
  }
  if (up > 0.35) {
    return ZONE_INFO.cabin;
  }

  return ZONE_INFO.fuselage;
}

export default function AircraftViewer({ onComponentSelect }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const modelRef = useRef(null);
  const modelBBoxRef = useRef(null);
  const highlightRef = useRef(null);
  const animFrameRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('normal'); // normal, wireframe, xray

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 80, 200);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 500);
    camera.position.set(25, 12, 30);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.6);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-20, 10, -10);
    scene.add(fillLight);

    // Ground grid
    const grid = new THREE.GridHelper(100, 50, 0x1a2744, 0x0d1529);
    grid.position.y = -0.5;
    scene.add(grid);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      '/aircraft.glb',
      (gltf) => {
        const model = gltf.scene;
        // Center and scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 20 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += 2;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.originalMaterial = child.material.clone();
          }
        });

        scene.add(model);
        modelRef.current = model;
        // Store the scaled bounding box for position-based zone detection
        modelBBoxRef.current = new THREE.Box3().setFromObject(model);
        controls.target.set(0, 2, 0);
        controls.update();
        setLoaded(true);
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (error) => {
        console.error('Model load error:', error);
      }
    );

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Click handler for raycasting
  const handleClick = useCallback((e) => {
    if (!modelRef.current || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(modelRef.current, true);

    // Reset previous highlight
    if (highlightRef.current) {
      highlightRef.current.material = highlightRef.current.userData.originalMaterial.clone();
      highlightRef.current = null;
    }

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const hitPoint = intersects[0].point;

      // Try name-based first, fall back to position-based
      let zone = classifyByName(hit.name || hit.parent?.name || '');
      if (!zone && modelBBoxRef.current) {
        zone = classifyByPosition(hitPoint, modelBBoxRef.current);
      }
      if (!zone) zone = ZONE_INFO.fuselage;

      const data = ZONE_DATA[zone.zone] || ZONE_DATA.fuselage;

      // Highlight clicked part
      hit.material = hit.material.clone();
      hit.material.emissive = new THREE.Color(
        data.status === 'warning' ? 0xff4444 :
        data.status === 'caution' ? 0xffaa00 : 0x00aaff
      );
      hit.material.emissiveIntensity = 0.4;
      highlightRef.current = hit;

      onComponentSelect?.({
        meshName: hit.name || hit.parent?.name || 'Unknown Part',
        ...zone,
        ...data,
      });
    }
  }, [onComponentSelect]);

  // View mode toggle
  const toggleViewMode = useCallback((mode) => {
    if (!modelRef.current) return;
    setViewMode(mode);
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        if (mode === 'wireframe') {
          child.material = child.userData.originalMaterial.clone();
          child.material.wireframe = true;
        } else if (mode === 'xray') {
          child.material = child.userData.originalMaterial.clone();
          child.material.transparent = true;
          child.material.opacity = 0.35;
          child.material.depthWrite = false;
        } else {
          child.material = child.userData.originalMaterial.clone();
        }
      }
    });
    highlightRef.current = null;
  }, []);

  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(25, 12, 30);
    controlsRef.current.target.set(0, 2, 0);
    controlsRef.current.update();
  }, []);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '300px' }}>
      <div ref={mountRef} className="w-full h-full cursor-crosshair" onClick={handleClick} />

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ background: 'rgba(10,14,26,0.9)' }}>
          <div className="w-16 h-16 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono mb-2" style={{ color: 'var(--color-accent)' }}>Loading 3D Model</p>
          <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%`, background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-cyan))' }} />
          </div>
          <p className="text-[10px] mt-1.5 font-mono" style={{ color: 'var(--color-text-muted)' }}>{loadProgress}%</p>
        </div>
      )}

      {/* Toolbar */}
      {loaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-lg z-20"
          style={{ background: 'rgba(10,14,26,0.85)', border: '1px solid var(--color-border)', backdropFilter: 'blur(8px)' }}>
          <button onClick={resetCamera} className="px-2.5 py-1 rounded text-[10px] font-semibold transition-colors hover:text-[var(--color-accent)]"
            style={{ color: 'var(--color-text-secondary)' }}>↻ Reset</button>
          {['normal', 'wireframe', 'xray'].map(m => (
            <button key={m} onClick={() => toggleViewMode(m)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${viewMode === m ? 'text-white' : ''}`}
              style={{
                color: viewMode === m ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                background: viewMode === m ? 'rgba(47,128,237,0.15)' : 'transparent',
              }}>
              {m === 'normal' ? '◼ Solid' : m === 'wireframe' ? '◇ Wire' : '◻ X-Ray'}
            </button>
          ))}
        </div>
      )}

      {/* Click instruction */}
      {loaded && (
        <div className="absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded z-20"
          style={{ background: 'rgba(10,14,26,0.7)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
          Click any part to inspect
        </div>
      )}
    </div>
  );
}
