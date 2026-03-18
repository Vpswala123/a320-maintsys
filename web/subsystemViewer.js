/**
 * subsystemViewer.js — Procedural 3D Subsystem Viewer
 * Generates schematic 3D models for each aircraft subsystem using Three.js primitives
 * Components are colored by health status and clickable via raycasting
 */

import * as THREE from 'three';

// Shape & layout definitions for each subsystem's components
const COMPONENT_SHAPES = {
  // ENGINE components — linear arrangement front-to-back
  engine: {
    eng_fan:        { shape:'cylinder', r:1.2, h:0.6,  pos:[-4,0,0],  rot:[0,0,Math.PI/2] },
    eng_hpc:        { shape:'cylinder', r:0.9, h:1.2,  pos:[-2.5,0,0],rot:[0,0,Math.PI/2] },
    eng_combustion: { shape:'torus',    r:0.8, tube:0.25, pos:[-0.8,0,0], rot:[0,Math.PI/2,0] },
    eng_hpt:        { shape:'cylinder', r:0.7, h:0.5,  pos:[0.5,0,0], rot:[0,0,Math.PI/2] },
    eng_lpt:        { shape:'cylinder', r:0.85,h:0.8,  pos:[1.5,0,0], rot:[0,0,Math.PI/2] },
    eng_fadec:      { shape:'box',      w:0.5, h:0.4, d:0.3, pos:[0,-1.5,1] },
    eng_reverser:   { shape:'cylinder', r:1.3, h:0.4,  pos:[3,0,0],   rot:[0,0,Math.PI/2] },
    eng_fcu:        { shape:'box',      w:0.4, h:0.3, d:0.3, pos:[-1,-1.5,0.8] },
    eng_oil:        { shape:'sphere',   r:0.3, pos:[0.5,-1.5,-0.5] },
    eng_ignition:   { shape:'box',      w:0.2, h:0.2, d:0.5, pos:[-0.8,1,0.5] },
    eng_gearbox:    { shape:'box',      w:0.6, h:0.5, d:0.5, pos:[0,-1.5,0] },
    eng_starter:    { shape:'cylinder', r:0.2, h:0.5,  pos:[-3,-1.2,0], rot:[Math.PI/2,0,0] },
    eng_nacelle:    { shape:'cylinder', r:1.4, h:6,    pos:[0,0,0],   rot:[0,0,Math.PI/2], wireOnly:true },
  },
  // WING components — grid layout
  wing: {
    wing_flap_act:  { shape:'box',      w:1.5, h:0.15, d:0.3, pos:[-3,-1,1] },
    wing_slat_act:  { shape:'box',      w:1.5, h:0.15, d:0.3, pos:[-3,1,-1] },
    wing_spoiler:   { shape:'box',      w:0.8, h:0.08, d:2,   pos:[0,0.3,0] },
    wing_aileron:   { shape:'box',      w:1.2, h:0.1,  d:0.4, pos:[3,-0.5,0] },
    wing_fuel_tank: { shape:'box',      w:3,   h:0.4,  d:1.5, pos:[0,-0.5,0], wireOnly:true },
    wing_anti_ice:  { shape:'cylinder', r:0.1, h:5,    pos:[0,1,-1.2],rot:[0,0,Math.PI/2] },
    wing_hyd_green: { shape:'cylinder', r:0.15,h:0.5,  pos:[-2,-1.2,0.5] },
    wing_hyd_yellow:{ shape:'cylinder', r:0.15,h:0.5,  pos:[-1,-1.2,0.5] },
    wing_hyd_blue:  { shape:'cylinder', r:0.15,h:0.5,  pos:[0,-1.2,0.5] },
    wing_ptu:       { shape:'box',      w:0.3, h:0.3, d:0.3, pos:[-1.5,-1.2,0] },
    wing_fuel_pump: { shape:'cylinder', r:0.2, h:0.3,  pos:[1,-1.2,0] },
    wing_vent_valve:{ shape:'sphere',   r:0.15, pos:[3,0.5,0.8] },
    wing_sfcc:      { shape:'box',      w:0.4, h:0.3, d:0.2, pos:[-2,-1.2,-0.5] },
  },
  // LANDING GEAR — symmetric layout
  landing_gear: {
    lg_main_strut_l: { shape:'cylinder', r:0.2, h:2.5, pos:[-2,-0.5,0] },
    lg_main_strut_r: { shape:'cylinder', r:0.2, h:2.5, pos:[2,-0.5,0] },
    lg_nose_strut:   { shape:'cylinder', r:0.15,h:2,   pos:[0,-0.3,3] },
    lg_brake_l1:     { shape:'torus',    r:0.4, tube:0.08, pos:[-2,-2,0.3], rot:[Math.PI/2,0,0] },
    lg_brake_l2:     { shape:'torus',    r:0.4, tube:0.08, pos:[-2,-2,-0.3],rot:[Math.PI/2,0,0] },
    lg_brake_r1:     { shape:'torus',    r:0.4, tube:0.08, pos:[2,-2,0.3],  rot:[Math.PI/2,0,0] },
    lg_brake_r2:     { shape:'torus',    r:0.4, tube:0.08, pos:[2,-2,-0.3], rot:[Math.PI/2,0,0] },
    lg_wheel_main:   { shape:'cylinder', r:0.5, h:0.25, pos:[-2,-2,0], rot:[Math.PI/2,0,0] },
    lg_wheel_nose:   { shape:'cylinder', r:0.35,h:0.2,  pos:[0,-1.8,3],rot:[Math.PI/2,0,0] },
    lg_antiskid:     { shape:'box',      w:0.3, h:0.2, d:0.2, pos:[0,0.5,0] },
    lg_steering:     { shape:'box',      w:0.2, h:0.3, d:0.2, pos:[0,-0.8,3] },
    lg_retract_act:  { shape:'cylinder', r:0.1, h:1,   pos:[-1,1,0], rot:[0,0,0.5] },
    lg_autobrake:    { shape:'box',      w:0.3, h:0.2, d:0.15,pos:[0,0.5,1.5] },
    lg_door_act:     { shape:'cylinder', r:0.08,h:0.8, pos:[1,1,0],  rot:[0,0,-0.5] },
  },
  // FUSELAGE — grid arrangement
  fuselage: {
    fus_pack1:        { shape:'box',      w:0.8, h:0.5, d:0.6, pos:[-2,-1.5,0] },
    fus_pack2:        { shape:'box',      w:0.8, h:0.5, d:0.6, pos:[2,-1.5,0] },
    fus_outflow:      { shape:'cylinder', r:0.4, h:0.2, pos:[0,-1.5,-3],rot:[Math.PI/2,0,0] },
    fus_pressctrl:    { shape:'box',      w:0.3, h:0.25,d:0.2, pos:[0,1,0] },
    fus_pneu_bleed_l: { shape:'cylinder', r:0.15,h:0.6, pos:[-1.5,0,2] },
    fus_pneu_bleed_r: { shape:'cylinder', r:0.15,h:0.6, pos:[1.5,0,2] },
    fus_crossbleed:   { shape:'cylinder', r:0.1, h:3,   pos:[0,0,2],  rot:[0,0,Math.PI/2] },
    fus_door_l1:      { shape:'box',      w:0.1, h:1.2, d:0.6, pos:[-2.5,0,2.5] },
    fus_door_r1:      { shape:'box',      w:0.1, h:1.2, d:0.6, pos:[2.5,0,2.5] },
    fus_door_l4:      { shape:'box',      w:0.1, h:1.2, d:0.6, pos:[-2.5,0,-2.5] },
    fus_cargo_fwd:    { shape:'box',      w:0.1, h:0.8, d:1,   pos:[2.5,-1,1] },
    fus_oxy_sys:      { shape:'cylinder', r:0.2, h:0.6, pos:[0,1.5,1] },
    fus_emer_light:   { shape:'sphere',   r:0.12, pos:[0,1.8,0] },
    fus_recirc_fan:   { shape:'cylinder', r:0.3, h:0.2, pos:[-1,-1.5,1.5],rot:[Math.PI/2,0,0] },
    fus_water_waste:  { shape:'box',      w:0.5, h:0.4, d:0.4, pos:[1,-1.5,-2] },
  },
  // COCKPIT — panel arrangement
  cockpit: {
    ckpt_efis_capt:  { shape:'box', w:0.6, h:0.5, d:0.1, pos:[-1.2,1,2] },
    ckpt_efis_fo:    { shape:'box', w:0.6, h:0.5, d:0.1, pos:[1.2,1,2] },
    ckpt_ecam_upper: { shape:'box', w:0.5, h:0.4, d:0.1, pos:[0,1.3,2] },
    ckpt_ecam_lower: { shape:'box', w:0.5, h:0.4, d:0.1, pos:[0,0.7,2] },
    ckpt_fms1:       { shape:'box', w:0.3, h:0.4, d:0.15,pos:[-0.6,0,2.2] },
    ckpt_fms2:       { shape:'box', w:0.3, h:0.4, d:0.15,pos:[0.6,0,2.2] },
    ckpt_adiru1:     { shape:'box', w:0.25,h:0.3, d:0.4, pos:[-1,-1,0] },
    ckpt_adiru2:     { shape:'box', w:0.25,h:0.3, d:0.4, pos:[0,-1,0] },
    ckpt_adiru3:     { shape:'box', w:0.25,h:0.3, d:0.4, pos:[1,-1,0] },
    ckpt_sidestick_l:{ shape:'cylinder', r:0.05,h:0.6, pos:[-1.5,-0.3,1.5] },
    ckpt_sidestick_r:{ shape:'cylinder', r:0.05,h:0.6, pos:[1.5,-0.3,1.5] },
    ckpt_vhf1:       { shape:'box', w:0.2, h:0.15,d:0.3, pos:[-0.5,1.8,1] },
    ckpt_vhf2:       { shape:'box', w:0.2, h:0.15,d:0.3, pos:[0.5,1.8,1] },
    ckpt_transponder: { shape:'box', w:0.25,h:0.15,d:0.3,pos:[0,1.8,0.5] },
    ckpt_elec_gen1:  { shape:'cylinder', r:0.25,h:0.4, pos:[-1.5,-1,-1] },
    ckpt_elec_gen2:  { shape:'cylinder', r:0.25,h:0.4, pos:[1.5,-1,-1] },
    ckpt_battery:    { shape:'box', w:0.4, h:0.25,d:0.3, pos:[0,-1,-1.5] },
  },
  // APU — circular arrangement
  apu: {
    apu_engine:    { shape:'cylinder', r:0.6, h:1.5, pos:[0,0,0],   rot:[0,0,Math.PI/2] },
    apu_generator: { shape:'cylinder', r:0.35,h:0.5, pos:[-1.5,0,0],rot:[0,0,Math.PI/2] },
    apu_ecb:       { shape:'box',      w:0.3, h:0.25,d:0.2, pos:[0,-1.2,0.8] },
    apu_bleed_valve:{ shape:'torus',   r:0.2, tube:0.06, pos:[1.2,0.5,0], rot:[0,Math.PI/2,0] },
    apu_inlet_door: { shape:'box',     w:0.6, h:0.05,d:0.4, pos:[0,1,0.5] },
    apu_fire_det:   { shape:'cylinder',r:0.05,h:2,   pos:[0,0.8,0], rot:[0,0,Math.PI/2] },
    apu_fire_ext:   { shape:'cylinder',r:0.15,h:0.5, pos:[1,-1,0] },
    apu_oil_sys:    { shape:'sphere',  r:0.2, pos:[-0.5,-1,0] },
    apu_exhaust:    { shape:'cylinder',r:0.3, h:1.5, pos:[2,0,0],   rot:[0,0,Math.PI/2] },
    apu_starter:    { shape:'cylinder',r:0.2, h:0.3, pos:[-1.5,-0.8,0] },
  }
};

// Health status to color mapping
function healthColor(h) {
  if (h >= 90) return 0x22c55e; // green
  if (h >= 75) return 0xeab308; // yellow
  return 0xef4444; // red
}

function healthEmissive(h) {
  if (h >= 90) return 0x0a3d1a;
  if (h >= 75) return 0x3d3a0a;
  return 0x3d0a0a;
}

export class SubsystemViewer {
  constructor(scene, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.group = new THREE.Group();
    this.meshMap = new Map(); // componentId -> mesh
    this.componentDataMap = new Map(); // componentId -> component data
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.highlightedMesh = null;
    this.originalMaterials = new Map();
    this.active = false;
    this.currentSubsystemId = null;

    // Label sprites
    this.labels = [];
  }

  /**
   * Build and show a subsystem's procedural model
   * @param {string} subsystemId - e.g. 'engine', 'wing'
   * @param {Array} components - array of component objects from the data
   * @param {Object} subsystemData - subsystem metadata
   */
  show(subsystemId, components, subsystemData) {
    this.clear();
    this.currentSubsystemId = subsystemId;
    this.active = true;

    const shapes = COMPONENT_SHAPES[subsystemId];
    if (!shapes) return;

    // Create group
    this.group = new THREE.Group();
    this.group.name = 'subsystem_' + subsystemId;

    // Add ambient subsystem lighting
    const pointLight = new THREE.PointLight(0x38bdf8, 0.5, 20);
    pointLight.position.set(0, 3, 0);
    this.group.add(pointLight);

    // Build each component mesh
    components.forEach(comp => {
      const shapeDef = shapes[comp.id];
      if (!shapeDef) return;

      const mesh = this._createMesh(shapeDef, comp);
      mesh.userData.componentId = comp.id;
      mesh.userData.componentData = comp;
      this.meshMap.set(comp.id, mesh);
      this.componentDataMap.set(comp.id, comp);
      this.group.add(mesh);

      // Store original material
      this.originalMaterials.set(comp.id, mesh.material.clone());

      // Add label
      const label = this._createLabel(comp.name, shapeDef.pos, comp.health);
      this.labels.push(label);
      this.group.add(label);
    });

    // Add connecting lines / structure hints
    this._addStructureHints(subsystemId);

    // Scale the group
    const scale = 2.5;
    this.group.scale.setScalar(scale);

    this.scene.add(this.group);

    // Position camera
    this._positionCamera();
  }

  clear() {
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    this.meshMap.clear();
    this.componentDataMap.clear();
    this.originalMaterials.clear();
    this.labels = [];
    this.highlightedMesh = null;
    this.active = false;
    this.currentSubsystemId = null;
  }

  _createMesh(shapeDef, comp) {
    let geometry;
    const pos = shapeDef.pos || [0, 0, 0];
    const rot = shapeDef.rot || [0, 0, 0];

    switch (shapeDef.shape) {
      case 'box':
        geometry = new THREE.BoxGeometry(shapeDef.w, shapeDef.h, shapeDef.d);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(shapeDef.r, shapeDef.r, shapeDef.h, 24);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(shapeDef.r, 16, 16);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(shapeDef.r, shapeDef.tube, 12, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    const color = healthColor(comp.health);
    const emissive = healthEmissive(comp.health);

    let material;
    if (shapeDef.wireOnly) {
      material = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });
    } else {
      material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: 0.4,
        shininess: 80,
        transparent: true,
        opacity: 0.85,
        flatShading: false
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add pulse animation data for warnings/faults
    if (comp.warning_status === 'fault') {
      mesh.userData.pulse = true;
      mesh.userData.pulseSpeed = 3;
    } else if (comp.warning_status === 'caution') {
      mesh.userData.pulse = true;
      mesh.userData.pulseSpeed = 1.5;
    }

    return mesh;
  }

  _createLabel(text, pos, health) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10,14,26,0.75)';
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();
    ctx.strokeStyle = health >= 90 ? '#22c55e' : health >= 75 ? '#eab308' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    // Truncate text
    let displayText = text.length > 22 ? text.substring(0, 20) + '…' : text;
    ctx.fillText(displayText, 128, 28);
    ctx.fillStyle = health >= 90 ? '#22c55e' : health >= 75 ? '#eab308' : '#ef4444';
    ctx.font = 'bold 14px Roboto Mono, monospace';
    ctx.fillText(`${health}%`, 128, 50);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(pos[0], pos[1] + 1.2, pos[2]);
    sprite.scale.set(2, 0.5, 1);
    sprite.userData.isLabel = true;
    return sprite;
  }

  _addStructureHints(subsystemId) {
    // Add a wireframe outline based on subsystem type
    const outlineGeo = {
      engine: () => new THREE.CylinderGeometry(1.5, 1.2, 7, 16, 1, true),
      wing: () => {
        const shape = new THREE.Shape();
        shape.moveTo(-4, -1);
        shape.lineTo(4, -0.5);
        shape.lineTo(4, 0.5);
        shape.lineTo(-4, 1);
        shape.closePath();
        return new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
      },
      landing_gear: () => new THREE.BoxGeometry(6, 4, 7),
      fuselage: () => new THREE.CylinderGeometry(2.5, 2.5, 8, 16, 1, true),
      cockpit: () => {
        const geo = new THREE.SphereGeometry(2.5, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        return geo;
      },
      apu: () => new THREE.ConeGeometry(1.2, 4, 12)
    };

    const createOutline = outlineGeo[subsystemId];
    if (createOutline) {
      const geo = createOutline();
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1a2744,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      const outline = new THREE.Mesh(geo, mat);
      if (subsystemId === 'engine') {
        outline.rotation.set(0, 0, Math.PI / 2);
      } else if (subsystemId === 'fuselage') {
        outline.rotation.set(Math.PI / 2, 0, 0);
      }
      outline.userData.isStructure = true;
      this.group.add(outline);
    }
  }

  _positionCamera() {
    this.camera.position.set(8, 6, 10);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * Handle click — returns component data if a component was clicked, null otherwise
   */
  onClick(event, container) {
    if (!this.active) return null;

    const rect = container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = [];
    this.meshMap.forEach(m => meshes.push(m));
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const compId = mesh.userData.componentId;
      if (compId) {
        this._highlight(compId);
        return this.componentDataMap.get(compId);
      }
    }
    return null;
  }

  onMouseMove(event, container) {
    if (!this.active) return;
    const rect = container.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const my = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);
    const meshes = [];
    this.meshMap.forEach(m => meshes.push(m));
    const intersects = this.raycaster.intersectObjects(meshes, false);
    container.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
  }

  _highlight(componentId) {
    // Reset previous
    if (this.highlightedMesh && this.originalMaterials.has(this.highlightedMesh.userData.componentId)) {
      this.highlightedMesh.material = this.originalMaterials.get(this.highlightedMesh.userData.componentId).clone();
    }

    const mesh = this.meshMap.get(componentId);
    if (!mesh) return;

    this.highlightedMesh = mesh;
    const hlMat = mesh.material.clone();
    hlMat.emissive = new THREE.Color(0x38bdf8);
    hlMat.emissiveIntensity = 0.6;
    hlMat.opacity = 1;
    hlMat.wireframe = false;
    mesh.material = hlMat;
  }

  /**
   * Animate pulse for warning/fault components — call in render loop
   */
  animate(time) {
    if (!this.active) return;
    this.meshMap.forEach(mesh => {
      if (mesh.userData.pulse) {
        const t = Math.sin(time * mesh.userData.pulseSpeed) * 0.3 + 0.7;
        mesh.material.opacity = t;
        mesh.material.emissiveIntensity = 0.3 + Math.sin(time * mesh.userData.pulseSpeed) * 0.3;
      }
    });
  }
}
