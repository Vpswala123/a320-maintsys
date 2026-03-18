/**
 * dashboard.js — Dashboard widgets
 * Health overview cards, alerts, upcoming maintenance, recent logs
 */

export class Dashboard {
  constructor(components, sessions) {
    this.components = components;
    this.sessions = sessions;
  }

  renderHealthOverview() {
    const container = document.getElementById('healthOverviewCards');
    if (!container) return;

    // Group components by subsystem
    const subsystemGroups = {};
    
    this.components.forEach(comp => {
      const sub = comp.subsystem || 'other';
      if (!subsystemGroups[sub]) {
        subsystemGroups[sub] = { name: this._formatSubsystemName(sub), components: [], avgHealth: 0 };
      }
      subsystemGroups[sub].components.push(comp);
    });

    // Calculate averages and render
    let html = '';
    
    Object.keys(subsystemGroups).forEach(subKey => {
      const group = subsystemGroups[subKey];
      const sum = group.components.reduce((acc, c) => acc + c.health, 0);
      group.avgHealth = Math.round(sum / group.components.length);
      
      const color = this._healthColor(group.avgHealth);
      
      html += `
        <div class="health-card" style="cursor:default">
          <div class="health-card-name">${group.name}</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="health-card-ata">${group.components.length} Components</div>
            <div class="health-card-pct" style="color:var(--accent-${color})">${group.avgHealth}%</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
  
  _formatSubsystemName(sub) {
    const names = {
      'engine': 'Engines',
      'wing': 'Wings & Flight Controls',
      'landing_gear': 'Landing Gear',
      'fuselage': 'Fuselage & Systems',
      'cockpit': 'Cockpit & Avionics',
      'apu': 'APU'
    };
    return names[sub] || sub;
  }

  renderAlerts() {
    const container = document.getElementById('alertsList');
    const countEl = document.getElementById('alertCount');
    if (!container) return;

    const alertComponents = this.components.filter(c =>
      c.warning_status !== 'normal' || (c.errors && c.errors.length > 0)
    );

    countEl.textContent = alertComponents.length;

    container.innerHTML = alertComponents.map(comp => {
      const icon = comp.warning_status === 'fault' ? '🔴' :
                   comp.warning_status === 'caution' ? '🟡' : '🟢';
      const errors = comp.errors && comp.errors.length > 0
        ? comp.errors.map(e => `<br>• ${e}`).join('')
        : '';
      return `
        <div class="alert-item">
          <span class="alert-icon">${icon}</span>
          <div class="alert-text">
            <strong>${comp.name}</strong> (ATA ${comp.ata})
            <br>${comp.warning_status.toUpperCase()}${errors}
          </div>
        </div>
      `;
    }).join('');

    if (alertComponents.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.78rem;">
          ✅ No active alerts
        </div>
      `;
    }
  }

  renderUpcomingMaintenance() {
    const container = document.getElementById('upcomingMaint');
    if (!container) return;

    // Sort by next inspection date
    const sorted = [...this.components]
      .filter(c => c.next_inspection)
      .sort((a, b) => new Date(a.next_inspection) - new Date(b.next_inspection));

    container.innerHTML = sorted.slice(0, 8).map(comp => {
      const days = this._daysUntil(comp.next_inspection);
      const color = days < 0 ? 'var(--accent-red)' :
                    days < 30 ? 'var(--accent-yellow)' :
                    'var(--accent-green)';
      const label = days < 0 ? 'OVERDUE' :
                    days === 0 ? 'TODAY' :
                    `${days} days`;
      return `
        <div class="upcoming-item">
          <div class="upcoming-dot" style="background:${color}"></div>
          <div class="upcoming-info">
            <div class="upcoming-name">${comp.name}</div>
            <div class="upcoming-detail">ATA ${comp.ata} • ${comp.maintenance_due} • Next: ${comp.next_inspection}</div>
          </div>
          <span style="font-size:0.72rem;font-weight:600;font-family:'Roboto Mono',monospace;color:${color}">${label}</span>
        </div>
      `;
    }).join('');
  }

  renderRecentLogs() {
    const container = document.getElementById('recentLogs');
    if (!container) return;

    // Flatten entries from all sessions for this aircraft
    let allEntries = [];
    (this.sessions || []).forEach(session => {
      if (session.entries) {
        session.entries.forEach(entry => allEntries.push(entry));
      }
    });

    // Sort descending by timestamp
    allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentEntries = allEntries.slice(0, 5);

    container.innerHTML = recentEntries.map(entry => {
      // Format date nicely
      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + 
                            date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      const sevColor = entry.severity === 'Warning' || entry.severity === 'High' ? 'var(--accent-red)' :
                       entry.severity === 'Medium' ? 'var(--accent-yellow)' : 'var(--text-secondary)';

      return `
        <div class="log-entry-mini" style="border-left: 2px solid ${sevColor}; padding-left: 8px;">
          <div class="log-entry-header">
            <span class="log-entry-date">${formattedDate}</span>
            <span class="log-entry-ata">${entry.ata}</span>
          </div>
          <div class="log-entry-text" style="margin-top:4px;">
            <strong>${entry.component}</strong><br>
            ${entry.action.substring(0, 75)}${entry.action.length > 75 ? '...' : ''}
          </div>
        </div>
      `;
    }).join('');

    if (recentEntries.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.78rem;">No recent logs for this aircraft</div>`;
    }
  }

  _healthColor(h) {
    if (h >= 90) return 'green';
    if (h >= 75) return 'yellow';
    return 'red';
  }

  _healthGradient(h) {
    if (h >= 90) return 'linear-gradient(90deg, #16a34a, #22c55e)';
    if (h >= 75) return 'linear-gradient(90deg, #ca8a04, #eab308)';
    return 'linear-gradient(90deg, #dc2626, #ef4444)';
  }

  _daysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  }
}
