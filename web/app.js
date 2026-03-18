/**
 * app.js — Main Application Controller
 * A320 Virtual Maintenance Manual & Digital Logbook System
 * Integrates: Auth, RBAC, 3D Viewer, Dashboard, Logbooks, Maintenance, Audit Trail, Digital Signatures
 */

window.onerror = function(msg, url, lineNo) {
  displayGlobalError(`Error: ${msg}\nLine: ${lineNo}\nURL: ${url}`);
  return false;
};
window.onunhandledrejection = function(event) {
  displayGlobalError(`Unhandled: ${event.reason}`);
};
function displayGlobalError(errTxt) {
  console.error(errTxt);
  let div = document.getElementById('global-error-display');
  if (!div) {
    div = document.createElement('div');
    div.id = 'global-error-display';
    div.style = 'position:fixed;top:0;left:0;width:100%;padding:16px;background:rgba(255,0,0,0.9);color:white;z-index:999999;font-family:monospace;white-space:pre-wrap;font-size:12px;max-height:200px;overflow:auto;';
    document.body.appendChild(div);
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  }
  div.innerText += '\n' + errTxt;
}

import { AircraftViewer } from './threeViewer.js';
import { Dashboard } from './dashboard.js';
import { LogbookViewer } from './logbook.js';
import { ManualViewer } from './manualViewer.js';
import { ATASearch } from './ataSearch.js';

// ============ DIGITAL SIGNATURE UTILITY ============
async function generateSignature(data) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifySignature(data, signature) {
  const newHash = await generateSignature(data);
  return newHash === signature;
}

// ============ AUDIT TRAIL (LOCAL DEMO) ============
class AuditTrail {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('audit_trail') || '[]');
  }
  log(action, module, details = {}) {
    const entry = {
      id: 'AUD-' + Date.now(),
      user: localStorage.getItem('user_name') || 'Unknown',
      role: localStorage.getItem('user_role') || 'viewer',
      action, module, details,
      timestamp: new Date().toISOString()
    };
    this.entries.unshift(entry);
    if (this.entries.length > 200) this.entries = this.entries.slice(0, 200);
    localStorage.setItem('audit_trail', JSON.stringify(this.entries));
    return entry;
  }
  getRecent(count = 20) { return this.entries.slice(0, count); }
}

// ============ MAINTENANCE TASK MANAGER ============
class MaintenanceManager {
  constructor(auditTrail) {
    this.tasks = JSON.parse(localStorage.getItem('maint_tasks') || '[]');
    this.audit = auditTrail;
    this.scheduleData = null;
  }
  async loadSchedule() {
    try {
      const res = await fetch('../data/maintenance_schedule.json');
      this.scheduleData = await res.json();
    } catch(e) { console.warn('Could not load maintenance schedule:', e); }
  }
  createTask(task) {
    task.id = 'TSK-' + Date.now();
    task.status = 'open';
    task.created_at = new Date().toISOString();
    task.signature = null;
    this.tasks.unshift(task);
    this._save();
    this.audit.log('CREATE', 'maintenance_task', { task_id: task.id, component: task.component });
    return task;
  }
  updateStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    const oldStatus = task.status;
    task.status = newStatus;
    if (newStatus === 'completed') task.completed_at = new Date().toISOString();
    this._save();
    this.audit.log('UPDATE_STATUS', 'maintenance_task', { task_id: taskId, from: oldStatus, to: newStatus });
  }
  async signTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;
    const sig = await generateSignature({
      task_id: task.id, component: task.component,
      engineer: localStorage.getItem('user_name'),
      completed_at: task.completed_at || new Date().toISOString()
    });
    task.signature = sig;
    task.signed_by = localStorage.getItem('user_name');
    task.signed_at = new Date().toISOString();
    this._save();
    this.audit.log('DIGITAL_SIGN', 'maintenance_task', { task_id: taskId, signature: sig.substring(0, 16) + '...' });
    return sig;
  }
  approveTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.status = 'closed';
    task.approved_by = localStorage.getItem('user_name');
    task.approved_at = new Date().toISOString();
    this._save();
    this.audit.log('APPROVE', 'maintenance_task', { task_id: taskId });
  }
  getTasks() { return this.tasks; }
  _save() { localStorage.setItem('maint_tasks', JSON.stringify(this.tasks)); }
}

// ============ ROLE PERMISSIONS ============
const ROLE_PERMISSIONS = {
  admin: ['*'],
  pilot: ['create_flight_log','create_defect_report','view_all'],
  ame: ['create_flight_log','create_defect_report','create_maintenance_task','update_maintenance','complete_maintenance','sign_maintenance','view_all'],
  inspector: ['approve_maintenance','view_all','view_audit'],
  viewer: ['view_all']
};

function hasPermission(action) {
  const role = localStorage.getItem('user_role') || 'viewer';
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(action);
}

// ============ MAIN APP ============
class App {
  constructor() {
    this.components = [];
    this.subsystems = [];
    this.manualsData = null;
    this.technicalLog = [];
    this.maintenanceLog = [];
    this.defectLog = [];
    this.viewer = null;
    this.dashboard = null;
    this.logbookViewer = null;
    this.manualViewer = null;
    this.ataSearch = null;
    this.currentPage = 'dashboard';
    this.currentLevel = 1;
    this.currentSubsystemId = null;
    this.currentComponentId = null;
    this.auditTrail = new AuditTrail();
    this.maintManager = new MaintenanceManager(this.auditTrail);
  }

  async init() {
    try {
      this._checkAuth();
      await this._loadData();
      this._setupFleetSelector();
      this._setupUserBadge();
      await this.maintManager.loadSchedule();
      this._initNavigation();
      this._initViewer();
      this._initDashboard();
      this._initLogbook();
      this._initManualViewer();
      this._initSearch();
      this._initMaintenancePage();
      this._initModal();
      this._initLogout();
      this.auditTrail.log('LOGIN', 'auth', { page: 'dashboard' });
    } catch (err) {
      console.error('App initialization error:', err);
      displayGlobalError(`Init error: ${err.message}\n${err.stack}`);
    }
  }

  _checkAuth() {
    const role = localStorage.getItem('user_role');
    if (!role) {
      window.location.href = 'auth/login.html';
    }
  }

  _setupFleetSelector() {
    const selector = document.getElementById('aircraftSelector');
    if (!selector || !this.fleet || this.fleet.length === 0) return;
    
    selector.innerHTML = this.fleet.map(ac => 
      `<option value="${ac.tail_number}">${ac.tail_number} (${ac.aircraft_type})</option>`
    ).join('');

    const active = localStorage.getItem('active_aircraft');
    if (active) selector.value = active;

    selector.addEventListener('change', (e) => {
      localStorage.setItem('active_aircraft', e.target.value);
      this.auditTrail.log('SWITCH_AIRCRAFT', 'system', { tail_number: e.target.value });
      
      // Re-initialize active page data to reflect new aircraft context
      if (this.currentPage === 'dashboard') this._initDashboard();
      if (this.currentPage === 'logbooks' && this.logbookViewer) this.logbookViewer.render();
      if (this.currentPage === 'maintenance') this._renderMaintenancePage();
    });
  }

  _setupUserBadge() {
    const name = localStorage.getItem('user_name') || localStorage.getItem('user_email') || 'Guest';
    const role = localStorage.getItem('user_role') || 'viewer';
    const airline = localStorage.getItem('user_airline') || '';
    document.getElementById('userName').textContent = name;
    document.getElementById('userRole').textContent = role.toUpperCase();
    document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
    const airlineBadge = document.getElementById('airlineBadge');
    if (airlineBadge && airline) airlineBadge.textContent = airline;

    // Hide role-restricted UI elements
    const newTaskBtn = document.getElementById('btnNewTask');
    if (newTaskBtn && !hasPermission('create_maintenance_task')) newTaskBtn.style.display = 'none';
    const newLogBtn = document.getElementById('btnNewLogEntry');
    if (newLogBtn && !hasPermission('create_flight_log') && !hasPermission('create_defect_report')) newLogBtn.style.display = 'none';
  }

  _initLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.auditTrail.log('LOGOUT', 'auth');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_airline');
      window.location.href = 'auth/login.html';
    });
  }

  async _loadData() {
    const basePath = '../data/';
    const [compRes, subRes, manRes, fleetRes, sessionRes] = await Promise.all([
      fetch(basePath + 'components.json'),
      fetch(basePath + 'subsystems.json'),
      fetch(basePath + 'manuals.json'),
      fetch(basePath + 'aircraft.json').catch(() => ({ json: () => [] })),
      fetch(basePath + 'maintenance_sessions.json').catch(() => ({ json: () => [] }))
    ]);
    this.components = ((await compRes.json()).components || []);
    this.subsystems = ((await subRes.json()).subsystems || []);
    this.manualsData = ((await manRes.json()).manuals || {});
    this.fleet = await fleetRes.json() || [];
    this.maintenanceSessions = await sessionRes.json() || [];
    
    // Set default active aircraft if none explicitly set globally
    if (this.fleet.length > 0 && !localStorage.getItem('active_aircraft')) {
      localStorage.setItem('active_aircraft', this.fleet[0].tail_number);
    }
  }

  _initNavigation() {
    const navTabs = document.querySelectorAll('#mainNav .nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._switchPage(tab.dataset.page);
      });
    });
  }

  _switchPage(page) {
    this.currentPage = page;
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-page'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active-page');
    const leftPanel = document.getElementById('leftPanel');
    const mainContent = document.querySelector('.main-content');
    if (page === 'dashboard') {
      leftPanel.style.display = 'flex';
      mainContent.classList.remove('full-width');
    } else {
      leftPanel.style.display = 'none';
      mainContent.classList.add('full-width');
    }
    if (page === 'logbooks' && this.logbookViewer) this.logbookViewer.render();
    if (page === 'maintenance') this._renderMaintenancePage();
  }

  _initViewer() {
    this.viewer = new AircraftViewer(
      'viewer-container',
      (comp) => this._onComponentSelected(comp),
      (subsystemId, zone) => this._onZoneClicked(zone)
    );
    this.viewer.loadModel('../assets/aircraft.glb')
      .then(() => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.add('hidden');
        setTimeout(() => { const h = document.getElementById('viewerHint'); if (h) h.style.opacity = '0'; }, 5000);
      })
      .catch(err => {
        console.error('Model load failed:', err);
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
          overlay.querySelector('.loading-text').textContent = 'Failed to load model. Run from a local server.';
          overlay.querySelector('.loader-ring').style.display = 'none';
        }
      });
    document.getElementById('btnResetView')?.addEventListener('click', () => this.viewer.resetView());
    document.getElementById('btnToggleWire')?.addEventListener('click', () => this.viewer.toggleWireframe());
    document.getElementById('btnBackLevel')?.addEventListener('click', () => this._navigateBack());
    document.querySelector('.breadcrumb-item[data-level="1"]')?.addEventListener('click', () => this._navigateToAircraft());
    document.querySelector('.breadcrumb-item[data-level="2"]')?.addEventListener('click', () => {
      if (this.currentSubsystemId) this._navigateToSubsystem(this.currentSubsystemId);
    });
  }

  // --- NAVIGATION ---
  _navigateToAircraft() {
    this.currentLevel = 1; this.currentSubsystemId = null; this.currentComponentId = null;
    this.viewer.exitSubsystem();
    this._updateBreadcrumbs(); this._updateLeftPanel();
  }
  _navigateToSubsystem(subsystemId) {
    const subData = this.subsystems.find(s => s.id === subsystemId);
    if (!subData) return;
    this.currentLevel = 2; this.currentSubsystemId = subsystemId; this.currentComponentId = null;
    const childComponents = this.components.filter(c => c.subsystem === subsystemId);
    this.viewer.enterSubsystem(subsystemId, childComponents, subData);
    this._updateBreadcrumbs(subData.name); this._updateLeftPanel(subData, childComponents);
  }
  _onComponentSelected(comp) {
    if (!comp) return;
    this.currentLevel = 3; this.currentComponentId = comp.id;
    this._updateBreadcrumbs(null, comp.name); this._showComponentInfo(comp);
  }
  _navigateBack() {
    this._navigateToAircraft();
  }

  _onZoneClicked(zone) {
    const zoneToComponentMap = {
      'ENGINE_ZONE': 'ATA71_01', // Engine 1
      'WING_ZONE': 'ATA27_01', // Flap Actuator Left Inner
      'LANDING_GEAR_ZONE': 'ATA32_01', // Main gear
      'FUSELAGE_ZONE': 'ATA21_01', // Air Conditioning Pack 1
      'COCKPIT_ZONE': 'ATA31_02', // Flight Data Recorder
      'APU_ZONE': 'ATA49_01' // APU
    };
    
    // Default to a generic fuselage component if zone doesn't match perfectly
    const compId = zoneToComponentMap[zone] || 'ATA21_01';
    const comp = this.components.find(c => c.id === compId);
    
    if (comp) {
      this.currentLevel = 3;
      this.currentComponentId = comp.id;
      this.currentSubsystemId = null; // Skip subsystem level for now
      
      // Update breadcrumbs for direct component view
      document.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.breadcrumb-item[data-level="1"]').classList.remove('active');
      
      document.getElementById('bcSubsystem').style.display = 'none';
      const sep2 = document.getElementById('bcSep2');
      const bcComp = document.getElementById('bcComponent');
      const btnBack = document.getElementById('btnBackLevel');
      
      sep2.style.display = 'block';
      bcComp.style.display = 'block';
      bcComp.classList.add('active');
      bcComp.textContent = comp.name;
      btnBack.style.display = 'block';
      
      this._showComponentInfo(comp);
    }
  }

  _updateBreadcrumbs(subName = null, compName = null) {
    const bcSub = document.getElementById('bcSubsystem');
    const bcComp = document.getElementById('bcComponent');
    const sep2 = document.getElementById('bcSep2');
    const btnBack = document.getElementById('btnBackLevel');
    document.querySelectorAll('.breadcrumb-item').forEach(el => el.classList.remove('active'));
    if (this.currentLevel === 1) {
      document.querySelector('.breadcrumb-item[data-level="1"]').classList.add('active');
      bcSub.style.display = 'none'; bcComp.style.display = 'none'; sep2.style.display = 'none'; btnBack.style.display = 'none';
    } else if (this.currentLevel === 2) {
      bcSub.style.display = 'block'; bcSub.classList.add('active');
      if (subName) bcSub.textContent = subName;
      bcComp.style.display = 'none'; sep2.style.display = 'none'; btnBack.style.display = 'block';
    } else if (this.currentLevel === 3) {
      bcSub.style.display = 'block'; bcComp.style.display = 'block'; bcComp.classList.add('active');
      if (compName) bcComp.textContent = compName;
      sep2.style.display = 'block'; btnBack.style.display = 'block';
    }
  }

  _updateLeftPanel(subData = null, childComponents = []) {
    const infoPanel = document.getElementById('componentInfo');
    const defaultPanel = document.getElementById('defaultInfo');
    const subsysPanel = document.getElementById('subsystemInfo');
    if (this.currentLevel === 1) {
      infoPanel.classList.remove('visible'); subsysPanel.style.display = 'none'; defaultPanel.style.display = 'block';
    } else if (this.currentLevel === 2 && subData) {
      infoPanel.classList.remove('visible'); defaultPanel.style.display = 'none'; subsysPanel.style.display = 'flex';
      document.getElementById('subsysName').textContent = subData.name;
      document.getElementById('subsysAta').textContent = `ATA ${subData.ata_chapter} — ${subData.ata_title}`;
      document.getElementById('subsysDesc').textContent = subData.description;
      const listContainer = document.getElementById('subsysComponentList');
      listContainer.innerHTML = childComponents.map(comp => {
        const color = this._healthColor(comp.health);
        return `<div class="health-card" data-component-id="${comp.id}" style="margin-bottom:8px"><div class="health-card-name">${comp.name}</div><div style="display:flex;justify-content:space-between;align-items:center;"><div class="health-card-ata">ATA ${comp.ata}</div><div class="health-card-pct" style="color:var(--accent-${color});font-size:0.8rem;">${comp.health}%</div></div></div>`;
      }).join('');
      listContainer.querySelectorAll('.health-card').forEach(card => {
        card.addEventListener('click', () => {
          const comp = this.components.find(c => c.id === card.dataset.componentId);
          if (comp) {
            if (this.viewer?.level === 2) this.viewer.subsystemViewer._highlight(comp.id);
            this._onComponentSelected(comp);
          }
        });
      });
    }
  }

  _showComponentInfo(comp) {
    if (!comp) return;
    const infoPanel = document.getElementById('componentInfo');
    const defaultPanel = document.getElementById('defaultInfo');
    const subsysPanel = document.getElementById('subsystemInfo');
    infoPanel.classList.add('visible'); defaultPanel.style.display = 'none'; subsysPanel.style.display = 'none';
    document.getElementById('compName').textContent = comp.name;
    document.getElementById('compAta').textContent = `ATA ${comp.ata} — ${comp.ata_title || ''}`;
    document.getElementById('compDesc').textContent = comp.description || '';
    document.getElementById('compZone').textContent = (comp.zone || '').replace(/_/g, ' ');
    const hc = this._healthColor(comp.health);
    const hEl = document.getElementById('compHealth');
    hEl.textContent = `${comp.health}%`; hEl.className = `info-value ${hc}`;
    document.getElementById('compTemp').textContent = `${comp.temperature}°C`;
    document.getElementById('compCycles').textContent = (comp.cycle_hours || 0).toLocaleString();
    document.getElementById('compMaintDue').textContent = comp.maintenance_due || '—';
    document.getElementById('compLastInsp').textContent = comp.last_inspection || '—';
    document.getElementById('compNextInsp').textContent = comp.next_inspection || '—';
    const bar = document.getElementById('compHealthBar');
    bar.style.width = `${comp.health}%`; bar.className = `health-bar-fill ${hc}`;
    document.getElementById('compHealthPct').textContent = `${comp.health}%`;
    document.getElementById('compHealthPct').style.color = `var(--accent-${hc})`;
    // Errors
    const errEl = document.getElementById('compErrors');
    if (comp.errors?.length > 0) {
      errEl.innerHTML = `<div style="font-size:0.72rem;font-weight:600;color:var(--accent-red);margin-bottom:6px;">⚠ Active Warnings</div>` +
        comp.errors.map(e => `<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:6px;padding:8px;margin-bottom:4px;font-size:0.75rem;color:var(--accent-red);">${e}</div>`).join('');
    } else {
      errEl.innerHTML = `<div style="font-size:0.72rem;color:var(--accent-green);text-align:center;padding:8px;">✅ No active warnings</div>`;
    }
  }

  _initDashboard() {
    const activeTail = localStorage.getItem('active_aircraft') || 'VT-DEM';
    // Filter sessions to only the active aircraft
    const activeSessions = this.maintenanceSessions.filter(s => s.aircraft_id === activeTail);
    
    // Create new Dashboard instance and render
    this.dashboard = new Dashboard(this.components, activeSessions);
    this.dashboard.onComponentClick = (comp) => this._showComponentInfo(comp);
    this.dashboard.renderHealthOverview();
    this.dashboard.renderAlerts();
    this.dashboard.renderUpcomingMaintenance();
    this.dashboard.renderRecentLogs();
  }

  _initLogbook() {
    if (!this.logbookViewer) {
      this.logbookViewer = new LogbookViewer();
      this.logbookViewer.init();
    }
    const activeTail = localStorage.getItem('active_aircraft') || 'VT-DEM';
    const activeSessions = this.maintenanceSessions.filter(s => s.aircraft_id === activeTail);
    this.logbookViewer.setData(activeSessions);
  }

  _initManualViewer() {
    this.manualViewer = new ManualViewer();
    this.manualViewer.setData(this.manualsData);
    this.manualViewer.init();
  }

  _initSearch() {
    this.ataSearch = new ATASearch(this.components, this.manualsData);
    this.ataSearch.onResultClick = (result) => {
      if (result.type === 'component') {
        this._switchPageAndNav('dashboard');
        if (result.data.subsystem && this.currentSubsystemId !== result.data.subsystem) {
          this._navigateToSubsystem(result.data.subsystem);
          setTimeout(() => {
            if (this.viewer?.level === 2) this.viewer.subsystemViewer._highlight(result.data.id);
            this._onComponentSelected(result.data);
          }, 500);
        } else {
          if (this.viewer?.level === 2) this.viewer.subsystemViewer._highlight(result.data.id);
          this._onComponentSelected(result.data);
        }
      } else if (result.type === 'manual') {
        this._switchPageAndNav('manuals');
        if (this.manualViewer && result.manualKey) {
          document.querySelectorAll('.manual-list-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.manual === result.manualKey) { item.classList.add('active'); item.click(); }
          });
        }
      }
    };
  }

  // ---- MAINTENANCE PAGE ----
  _initMaintenancePage() {
    document.getElementById('btnNewTask')?.addEventListener('click', () => {
      if (!hasPermission('create_maintenance_task')) { alert('Access denied.'); return; }
      this._showModal('New Maintenance Task', 'maintenance');
    });
  }

  _renderMaintenancePage() {
    // Schedule
    const scheduleEl = document.getElementById('maintSchedule');
    if (scheduleEl && this.maintManager.scheduleData) {
      scheduleEl.innerHTML = this.maintManager.scheduleData.checks.map(c => `
        <div class="maint-check-card">
          <div class="maint-check-type">${c.check_type}</div>
          <div class="maint-check-detail"><strong>Interval:</strong> ${c.interval_hours ? c.interval_hours + ' FH' : ''}${c.interval_months ? (c.interval_hours ? ' / ' : '') + c.interval_months + ' months' : ''}</div>
          <div class="maint-check-detail"><strong>Duration:</strong> ~${c.estimated_duration_hours} hours</div>
          <div class="maint-check-detail" style="margin-top:6px;color:var(--text-secondary);">${c.description}</div>
        </div>
      `).join('');
    }
    // Tasks
    const taskEl = document.getElementById('maintTaskList');
    if (taskEl) {
      const tasks = this.maintManager.getTasks();
      if (tasks.length === 0) {
        taskEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.78rem;">No maintenance tasks yet. Create one to get started.</div>`;
      } else {
        const role = localStorage.getItem('user_role') || 'viewer';
        taskEl.innerHTML = tasks.map(t => {
          let actions = '';
          if (t.status === 'open' && (role === 'ame' || role === 'admin'))
            actions += `<button onclick="appInstance._taskAction('${t.id}','in_progress')">Start</button>`;
          if (t.status === 'in_progress' && (role === 'ame' || role === 'admin'))
            actions += `<button onclick="appInstance._taskAction('${t.id}','completed')">Complete</button>`;
          if (t.status === 'completed' && (role === 'ame' || role === 'admin') && !t.signature)
            actions += `<button onclick="appInstance._signTask('${t.id}')">🔐 Sign</button>`;
          if (t.status === 'completed' && t.signature && (role === 'inspector' || role === 'admin'))
            actions += `<button class="btn-approve" onclick="appInstance._approveTask('${t.id}')">✓ Approve</button>`;
          const sig = t.signature ? `<span style="font-size:0.6rem;color:var(--accent-green);">🔐 Signed: ${t.signature.substring(0,12)}…</span>` : '';
          return `<div class="maint-task-item status-${t.status}">
            <div class="maint-task-info">
              <div class="maint-task-name">${t.component || 'Unknown'} — ${t.description || ''}</div>
              <div class="maint-task-meta">ATA ${t.ata || '—'} • Status: ${t.status} • ${t.created_at ? new Date(t.created_at).toLocaleDateString() : ''} ${sig}</div>
            </div>
            <div class="maint-task-actions">${actions}</div>
          </div>`;
        }).join('');
      }
    }
    // Audit Trail
    const auditEl = document.getElementById('auditTrailList');
    if (auditEl) {
      const entries = this.auditTrail.getRecent(15);
      auditEl.innerHTML = entries.map(e => `
        <div class="audit-item">
          <span class="audit-time">${new Date(e.timestamp).toLocaleTimeString()}</span>
          <span class="audit-user">${e.user}</span>
          <span class="audit-action">${e.action} → ${e.module}</span>
        </div>
      `).join('') || '<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:0.72rem;">No audit entries yet.</div>';
    }
  }

  _taskAction(taskId, newStatus) {
    this.maintManager.updateStatus(taskId, newStatus);
    this._renderMaintenancePage();
  }
  async _signTask(taskId) {
    await this.maintManager.signTask(taskId);
    this._renderMaintenancePage();
  }
  _approveTask(taskId) {
    this.maintManager.approveTask(taskId);
    this._renderMaintenancePage();
  }

  // ---- MODAL: Maintenance Session Builder ----
  _initModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;

    document.getElementById('modalClose')?.addEventListener('click', () => overlay.style.display = 'none');
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });

    // Open Modal
    document.getElementById('btnNewSession')?.addEventListener('click', () => {
      this._showModal();
    });

    // Toggle Scheduled vs Unscheduled
    const typeSelect = document.getElementById('modalMaintType');
    const groupCheck = document.getElementById('groupCheckType');
    const groupReason = document.getElementById('groupReason');
    
    typeSelect?.addEventListener('change', (e) => {
      if (e.target.value === 'Scheduled Maintenance') {
        groupCheck.style.display = 'block';
        groupReason.style.display = 'none';
      } else {
        groupCheck.style.display = 'none';
        groupReason.style.display = 'block';
      }
    });

    // Add Dynamic Entry
    document.getElementById('btnAddEntry')?.addEventListener('click', () => {
      this._addModalEntryRow();
    });

    // Form Submit
    document.getElementById('modalForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const sigPassword = document.getElementById('modalSignature').value;
      if (!sigPassword) { alert('Digital signature required.'); return; }

      const type = document.getElementById('modalMaintType').value;
      const isScheduled = type === 'Scheduled Maintenance';
      const engineer = localStorage.getItem('user_name') || 'Unknown';
      const tail = localStorage.getItem('active_aircraft') || 'VT-DEM';

      // Gather Dynamic Entries
      const entryRows = document.querySelectorAll('.dynamic-entry-row');
      const entries = [];
      entryRows.forEach((row, index) => {
        entries.push({
          entry_id: `ENT-${Date.now().toString().slice(-4)}${index}`,
          ata: row.querySelector('.entry-ata').value || 'Unknown',
          component: row.querySelector('.entry-comp').value || 'General',
          action: row.querySelector('.entry-action').value || 'Inspected',
          result: row.querySelector('.entry-result').value || 'Satisfactory',
          severity: row.querySelector('.entry-sev').value || 'Low',
          timestamp: new Date().toISOString()
        });
      });

      // Construct Parent Session
      const session = {
        session_id: `MS-${Date.now().toString().slice(-6)}`,
        aircraft_id: tail,
        maintenance_type: type,
        check_type: isScheduled ? document.getElementById('modalCheckType').value : 'N/A',
        reason: isScheduled ? '' : document.getElementById('modalReason').value,
        status: 'Closed',
        start_time: new Date(Date.now() - 3600000).toISOString(),
        end_time: new Date().toISOString(),
        engineer: engineer,
        inspector_approval: null,
        entries: entries
      };

      // Mock Signature Audit
      this.auditTrail.log('MAINTENANCE_LOGGED', 'logbook', { session_id: session.session_id, sig_provided: true });
      
      // Update State
      this.maintenanceSessions.push(session);
      
      document.getElementById('modalOverlay').style.display = 'none';
      document.getElementById('modalForm').reset();
      
      // Re-render
      if (this.currentPage === 'logbooks' && this.logbookViewer) {
        // Need to refilter for active tail in case it changed
        const activeSessions = this.maintenanceSessions.filter(s => s.aircraft_id === tail);
        this.logbookViewer.setData(activeSessions);
      }
      
      alert(`Maintenance Session ${session.session_id} successfully signed and saved!`);
    });
  }

  _showModal() {
    const container = document.getElementById('dynamicEntriesContainer');
    container.innerHTML = ''; // Clear previous
    this._addModalEntryRow(); // Add one default blank row
    
    document.getElementById('modalMaintType').value = 'Scheduled Maintenance';
    document.getElementById('groupCheckType').style.display = 'block';
    document.getElementById('groupReason').style.display = 'none';
    
    document.getElementById('modalOverlay').style.display = 'flex';
  }

  _addModalEntryRow() {
    const container = document.getElementById('dynamicEntriesContainer');
    const rowId = `entry-${Date.now()}`;
    const rowHtml = `
      <div class="dynamic-entry-row" id="${rowId}" style="background:var(--bg-panel); border:1px solid var(--border-color); padding:12px; position:relative;">
        <button type="button" class="btn-remove-entry" onclick="document.getElementById('${rowId}').remove()" style="position:absolute; top:8px; right:8px; background:transparent; border:none; color:var(--text-muted); cursor:pointer;">✕</button>
        
        <div style="display:flex; gap:12px; margin-bottom:8px;">
          <div style="flex:1;">
            <label style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:4px; display:block;">ATA</label>
            <input type="text" class="entry-ata" placeholder="e.g. 27" style="width:100%; padding:6px; background:#0B0F17; border:1px solid var(--border-color); color:#fff; font-family:'Roboto Mono',monospace; font-size:0.8rem;">
          </div>
          <div style="flex:3;">
            <label style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:4px; display:block;">Component</label>
            <input type="text" class="entry-comp" placeholder="e.g. Flap Actuator" style="width:100%; padding:6px; background:#0B0F17; border:1px solid var(--border-color); color:#fff; font-size:0.8rem;">
          </div>
          <div style="flex:1;">
            <label style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:4px; display:block;">Severity</label>
            <select class="entry-sev" style="width:100%; padding:6px; background:#0B0F17; border:1px solid var(--border-color); color:#fff; font-size:0.8rem;">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div style="display:flex; gap:12px;">
          <div style="flex:1;">
            <label style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:4px; display:block;">Action Performed</label>
            <input type="text" class="entry-action" placeholder="Describe work done..." style="width:100%; padding:6px; background:#0B0F17; border:1px solid var(--border-color); color:#fff; font-size:0.8rem;">
          </div>
          <div style="flex:1;">
            <label style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:4px; display:block;">Result / Finding</label>
            <input type="text" class="entry-result" placeholder="e.g. Found leaking, replaced seals" style="width:100%; padding:6px; background:#0B0F17; border:1px solid var(--border-color); color:#fff; font-size:0.8rem;">
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
  }

  _switchPageAndNav(page) {
    document.querySelectorAll('#mainNav .nav-tab').forEach(t => {
      t.classList.remove('active');
      if (t.dataset.page === page) t.classList.add('active');
    });
    this._switchPage(page);
  }

  _healthColor(h) {
    if (h >= 90) return 'green';
    if (h >= 75) return 'yellow';
    return 'red';
  }
}

// Boot
const app = new App();
window.appInstance = app; // For inline onclick handlers
app.init();
