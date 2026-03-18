/**
 * threeViewer.js — Three.js 3D Aircraft Viewer
 * Loads GLB model, handles raycasting, zone-based interaction
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SubsystemViewer } from './subsystemViewer.js';

// Aircraft interaction zones mapped to bounding boxes (normalized coords)
// These define regions of the model that correspond to component zones
const ZONE_DEFINITIONS = {
  ENGINE_ZONE:       { xMin: -0.6, xMax: 0.6, yMin: -0.35, yMax: -0.05, zMin: -0.1, zMax: 0.4 },
  WING_ZONE:         { xMin: -1.0, xMax: 1.0, yMin: -0.3, yMax: 0.05,  zMin: -0.2, zMax: 0.5 },
  LANDING_GEAR_ZONE: { xMin: -0.4, xMax: 0.4, yMin: -0.55, yMax: -0.25, zMin: -0.3, zMax: 0.3 },
  APU_ZONE:          { xMin: -0.15, xMax: 0.15, yMin: -0.1, yMax: 0.15, zMin: -0.9, zMax: -0.5 },
  COCKPIT_ZONE:      { xMin: -0.15, xMax: 0.15, yMin: -0.05, yMax: 0.2, zMin: 0.6, zMax: 1.0 },
  FUSELAGE_ZONE:     { xMin: -0.25, xMax: 0.25, yMin: -0.15, yMax: 0.2, zMin: -0.5, zMax: 0.6 }
};

export class AircraftViewer {
  constructor(containerId, onComponentSelect, onSubsystemSelect) {
    this.container = document.getElementById(containerId);
    this.onComponentSelect = onComponentSelect;
    this.onSubsystemSelect = onSubsystemSelect;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.modelBounds = null;
    this.wireframeMode = false;
    this.originalMaterials = new Map();
    this.highlightedMesh = null;
    
    this.level = 1; // 1 = Aircraft, 2 = Subsystem
    this.subsystemViewer = null;

    this._init();
  }

  _init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0e1a, 0.0015);

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    this.camera.position.set(30, 20, 50);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0e1a, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2; // Reduced for subsystem view
    this.controls.maxDistance = 200;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    
    // Subsystem Viewer setup
    this.subsystemViewer = new SubsystemViewer(this.scene, this.camera, this.controls);

    // Lighting
    this._setupLights();

    // Ground grid
    this._setupGround();

    this.container.addEventListener('dblclick', (e) => this._onDoubleClick(e));
    this.container.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('resize', () => this._onResize());

    // Animate
    this._animate();
  }

  _setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x4488cc, 0.5);
    this.scene.add(ambient);

    // Main directional
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -80;
    dirLight.shadow.camera.right = 80;
    dirLight.shadow.camera.top = 80;
    dirLight.shadow.camera.bottom = -80;
    this.scene.add(dirLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.4);
    fillLight.position.set(-30, 30, -30);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.3);
    rimLight.position.set(0, -20, -50);
    this.scene.add(rimLight);

    // Hemisphere
    const hemiLight = new THREE.HemisphereLight(0x88bbff, 0x334455, 0.3);
    this.scene.add(hemiLight);
  }

  _setupGround() {
    const gridHelper = new THREE.GridHelper(200, 40, 0x1a2744, 0x111827);
    gridHelper.position.y = -15;
    this.scene.add(gridHelper);
  }

  loadModel(path) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        path,
        (gltf) => {
          try {
            this.model = gltf.scene;

            // Compute bounding box for normalization
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // Center and scale model
            this.model.position.sub(center);
            const scale = 40 / maxDim;
            this.model.scale.setScalar(scale);

            // Recompute bounds after scaling
            this.modelBounds = new THREE.Box3().setFromObject(this.model);

            // Store original materials
            this.model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  this.originalMaterials.set(child.uuid, child.material.clone());
                }
              }
            });

            this.scene.add(this.model);

            // Position camera
            const boundCenter = this.modelBounds.getCenter(new THREE.Vector3());
            const boundSize = this.modelBounds.getSize(new THREE.Vector3());
            const maxBound = Math.max(boundSize.x, boundSize.y, boundSize.z);
            this.camera.position.set(
              boundCenter.x + maxBound * 0.8,
              boundCenter.y + maxBound * 0.5,
              boundCenter.z + maxBound * 0.8
            );
            this.controls.target.copy(boundCenter);
            this.controls.update();

            resolve();
          } catch (err) {
            reject(err);
          }
        },
        (progress) => {
          if (progress.total > 0) {
            const pct = Math.round((progress.loaded / progress.total) * 100);
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) loadingText.textContent = `Loading Aircraft Model... ${pct}%`;
          }
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  _getZoneFromPoint(point) {
    if (!this.modelBounds) return 'FUSELAGE_ZONE';

    const bounds = this.modelBounds;
    const bCenter = bounds.getCenter(new THREE.Vector3());
    const bSize = bounds.getSize(new THREE.Vector3());

    // Normalize point to -1..1 range relative to model bounds
    const nx = (point.x - bCenter.x) / (bSize.x / 2);
    const ny = (point.y - bCenter.y) / (bSize.y / 2);
    const nz = (point.z - bCenter.z) / (bSize.z / 2);

    // Check zones in priority order
    const zoneChecks = [
      'ENGINE_ZONE', 'LANDING_GEAR_ZONE', 'APU_ZONE',
      'COCKPIT_ZONE', 'WING_ZONE', 'FUSELAGE_ZONE'
    ];

    for (const zoneName of zoneChecks) {
      const z = ZONE_DEFINITIONS[zoneName];
      if (nx >= z.xMin && nx <= z.xMax &&
          ny >= z.yMin && ny <= z.yMax &&
          nz >= z.zMin && nz <= z.zMax) {
        return zoneName;
      }
    }

    // Fallback: use position heuristics
    if (Math.abs(nx) > 0.5) return 'WING_ZONE';
    if (ny < -0.2) return 'LANDING_GEAR_ZONE';
    if (nz > 0.5) return 'COCKPIT_ZONE';
    if (nz < -0.4) return 'APU_ZONE';
    return 'FUSELAGE_ZONE';
  }

  _onDoubleClick(event) {
    if (this.level === 2) {
      // Handle subsystem level click
      const comp = this.subsystemViewer.onClick(event, this.container);
      if (comp && this.onComponentSelect) {
        this.onComponentSelect(comp);
      }
      return;
    }

    if (!this.model) return;

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.model, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const zone = this._getZoneFromPoint(point);

      // Highlight
      this._highlightAtPoint(intersects[0]);

      // Trigger subsystem transition
      const subsystemMap = {
        'ENGINE_ZONE': 'engine',
        'WING_ZONE': 'wing',
        'LANDING_GEAR_ZONE': 'landing_gear',
        'FUSELAGE_ZONE': 'fuselage',
        'COCKPIT_ZONE': 'cockpit',
        'APU_ZONE': 'apu'
      };
      
      const subId = subsystemMap[zone];
      if (this.onSubsystemSelect && subId) {
        this.onSubsystemSelect(subId, zone);
      }
    }
  }

  _onMouseMove(event) {
    if (this.level === 2) {
      this.subsystemViewer.onMouseMove(event, this.container);
      return;
    }

    if (!this.model) return;
    const rect = this.container.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const my = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);
    const intersects = this.raycaster.intersectObject(this.model, true);

    this.container.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
  }

  _highlightAtPoint(intersect) {
    // Reset previous highlight
    this._clearHighlight();

    const mesh = intersect.object;
    if (mesh.isMesh && mesh.material) {
      this.highlightedMesh = mesh;
      const hlMat = mesh.material.clone();
      hlMat.emissive = new THREE.Color(0x38bdf8);
      hlMat.emissiveIntensity = 0.3;
      if (hlMat.transparent !== undefined) {
        hlMat.transparent = true;
        hlMat.opacity = Math.max(hlMat.opacity || 1, 0.85);
      }
      mesh.material = hlMat;
    }
  }

  _clearHighlight() {
    if (this.highlightedMesh && this.originalMaterials.has(this.highlightedMesh.uuid)) {
      this.highlightedMesh.material = this.originalMaterials.get(this.highlightedMesh.uuid).clone();
      this.highlightedMesh = null;
    }
  }

  resetView() {
    if (this.level === 2) {
      this.subsystemViewer._positionCamera();
      return;
    }
    if (!this.modelBounds) return;
    const center = this.modelBounds.getCenter(new THREE.Vector3());
    const size = this.modelBounds.getSize(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z);
    
    // Simple transition
    const targetPos = new THREE.Vector3(center.x + max * 0.8, center.y + max * 0.5, center.z + max * 0.8);
    
    let frame = 0;
    const animateCamera = () => {
      frame++;
      if (frame > 60) return; // 1 second roughly
      const t = frame / 60;
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerp(targetPos, ease * 0.1);
      this.controls.target.lerp(center, ease * 0.1);
      this.controls.update();
      requestAnimationFrame(animateCamera);
    };
    animateCamera();
  }

  // ---- Navigation API ----
  
  enterSubsystem(subsystemId, components, subsystemData) {
    this.level = 2;
    
    // Hide aircraft model
    if (this.model) {
      this.model.visible = false;
    }
    
    // Show procedural subsystem
    this.subsystemViewer.show(subsystemId, components, subsystemData);
  }
  
  exitSubsystem() {
    this.level = 1;
    this.subsystemViewer.clear();
    this._clearHighlight();
    
    // Show aircraft model
    if (this.model) {
      this.model.visible = true;
      this.resetView();
    }
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    if (!this.model) return;
    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = this.wireframeMode;
      }
    });
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate(time) {
    requestAnimationFrame((t) => this._animate(t));
    this.controls.update();
    if (this.level === 2) {
      this.subsystemViewer.animate(time * 0.001);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
