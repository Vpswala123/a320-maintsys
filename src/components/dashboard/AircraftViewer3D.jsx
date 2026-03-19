import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import ComponentInfoPanel from './ComponentInfoPanel'
import ARButton from './ARButton'
import { AIRCRAFT_ZONES } from '../../data/zones'

export default function AircraftViewer3D({ selectedAircraft, components, onComponentSelect }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const modelRef = useRef(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)
  const [selectedZone, setSelectedZone] = useState(null)
  const [loadingModel, setLoadingModel] = useState(true)
  const [subsystemModel, setSubsystemModel] = useState(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b1320)
    scene.fog = new THREE.Fog(0x0b1320, 30, 80)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000)
    camera.position.set(0, 8, 25)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 60
    controls.target.set(0, 0, 0)

    // Lighting — hangar industrial style
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(10, 20, 10)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x2f80ed, 0.2)
    fillLight.position.set(-10, 5, -10)
    scene.add(fillLight)

    // Hangar floor grid
    const gridHelper = new THREE.GridHelper(60, 30, 0x1f2a3a, 0x111a2e)
    scene.add(gridHelper)

    // Load aircraft model
    const loader = new GLTFLoader()
    const basePath = import.meta.env.BASE_URL || '/'

    loader.load(
      `${basePath}models/aircraft/a320_assembly.glb`,
      (gltf) => {
        const model = gltf.scene
        model.scale.set(0.1, 0.1, 0.1)
        model.position.set(0, 0, 0)
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        scene.add(model)
        modelRef.current = model
        setLoadingModel(false)
      },
      (progress) => {
        console.log(`Loading: ${Math.round(progress.loaded / progress.total * 100)}%`)
      },
      (error) => {
        console.warn('Primary model not found, using placeholder')
        createPlaceholderAircraft(scene)
        setLoadingModel(false)
      }
    )

    // Handle click with single/double click detection
    const handleClick = (event) => {
      const rect = mountRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      clickCountRef.current += 1

      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = setTimeout(() => {
        const count = clickCountRef.current
        clickCountRef.current = 0

        if (count === 1) handleSingleClick()
        else if (count >= 2) handleDoubleClick()
      }, 250)
    }

    renderer.domElement.addEventListener('click', handleClick)

    // Animation loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      renderer.domElement.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  function detectZone() {
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true)
    if (intersects.length === 0) return null

    const point = intersects[0].point
    let closest = null
    let minDist = Infinity

    for (const zone of AIRCRAFT_ZONES) {
      const zonePos = new THREE.Vector3(zone.position.x * 0.1, 0, zone.position.z * 0.1)
      const dist = point.distanceTo(zonePos)
      if (dist < zone.radius * 0.1 && dist < minDist) {
        minDist = dist
        closest = zone
      }
    }
    return closest
  }

  function handleSingleClick() {
    const zone = detectZone()
    if (zone) {
      setSelectedZone(zone)
      const component = components?.find(c => c.zone_id === zone.id)
      onComponentSelect?.(zone, component)
    } else {
      setSelectedZone(null)
      onComponentSelect?.(null, null)
    }
  }

  function handleDoubleClick() {
    const zone = detectZone()
    if (zone?.model) {
      setSubsystemModel(zone.model)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Loading indicator */}
      {loadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b1320]/80">
          <div className="text-[#00d4ff] font-mono text-sm animate-pulse">LOADING AIRCRAFT MODEL...</div>
        </div>
      )}

      {/* AR Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <ARButton />
        <button
          onClick={() => {/* share handler */}}
          className="px-3 py-2 bg-[#111a2e] border border-[#1f2a3a] rounded-lg text-[#9ba4b4] text-xs font-mono hover:border-[#2f80ed] transition-colors"
        >
          🔗 Share
        </button>
      </div>

      {/* Subsystem model overlay */}
      {subsystemModel && (
        <SubsystemViewer modelPath={subsystemModel} onClose={() => setSubsystemModel(null)} />
      )}
    </div>
  )
}

function createPlaceholderAircraft(scene) {
  // Build a simple aircraft shape from basic geometries as fallback
  const material = new THREE.MeshStandardMaterial({ color: 0x2f80ed, wireframe: false })

  // Fuselage
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 15, 16), material)
  fuselage.rotation.z = Math.PI / 2
  scene.add(fuselage)

  // Wings
  const wingGeo = new THREE.BoxGeometry(12, 0.1, 2)
  const wings = new THREE.Mesh(wingGeo, material)
  wings.position.y = -0.2
  scene.add(wings)

  // Tail
  const tailGeo = new THREE.BoxGeometry(4, 0.1, 1)
  const tail = new THREE.Mesh(tailGeo, material)
  tail.position.set(-6, 0.5, 0)
  scene.add(tail)
}
