/**
 * logbook.js — Digital Logbook Viewer (Session-Based Architecture)
 * Renders Parent Maintenance Sessions and Child Entries
 */

export class LogbookViewer {
  constructor() {
    this.sessions = [];
    this.currentTab = 'sessions'; // 'sessions' or 'entries'
  }

  setData(sessions) {
    this.sessions = sessions || [];
    this.render();
  }

  init() {
    const tabs = document.getElementById('logbookTabs');
    if (!tabs) return;

    tabs.querySelectorAll('.logbook-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.logbook-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.dataset.log;
        this.render();
      });
    });

    this.render();
  }

  render() {
    if (this.currentTab === 'sessions') {
      this._renderSessions();
    } else if (this.currentTab === 'entries') {
      this._renderEntries();
    }
  }

  _renderSessions() {
    const head = document.getElementById('logTableHead');
    const body = document.getElementById('logTableBody');
    if (!head || !body) return;

    head.innerHTML = `
      <tr>
        <th>Session ID</th>
        <th>Type</th>
        <th>Start Time</th>
        <th>End Time</th>
        <th>Total Entries</th>
        <th>Engineer</th>
        <th>Status</th>
      </tr>
    `;

    // Sort by start_time descending
    const sorted = [...this.sessions].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    body.innerHTML = sorted.map(s => {
      const start = new Date(s.start_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
      const end = s.end_time ? new Date(s.end_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—';
      const count = s.entries ? s.entries.length : 0;
      const typeDisplay = s.check_type === 'N/A' || !s.check_type ? s.maintenance_type : s.check_type;
      
      return `
        <tr>
          <td style="font-family:'Roboto Mono',monospace;color:var(--accent-cyan);font-weight:600;">${s.session_id}</td>
          <td><strong>${typeDisplay}</strong></td>
          <td style="font-family:'Roboto Mono',monospace;white-space:nowrap;">${start}</td>
          <td style="font-family:'Roboto Mono',monospace;white-space:nowrap;">${end}</td>
          <td style="text-align:center;">${count}</td>
          <td style="white-space:nowrap;">${s.engineer}</td>
          <td>${this._statusChip(s.status)}</td>
        </tr>
      `;
    }).join('');
    
    if (sorted.length === 0) {
       body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">No maintenance sessions found for this aircraft.</td></tr>`;
    }
  }

  _renderEntries() {
    const head = document.getElementById('logTableHead');
    const body = document.getElementById('logTableBody');
    if (!head || !body) return;

    head.innerHTML = `
      <tr>
        <th>Session</th>
        <th>Date</th>
        <th>ATA</th>
        <th>Component</th>
        <th>Action Performed</th>
        <th>Result</th>
        <th>Severity</th>
      </tr>
    `;

    // Flatten entries
    let allEntries = [];
    this.sessions.forEach(s => {
      if (s.entries) {
        s.entries.forEach(e => {
          allEntries.push({ ...e, session_id: s.session_id });
        });
      }
    });

    // Sort entries descending
    allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    body.innerHTML = allEntries.map(e => {
      const time = new Date(e.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
      const sevColor = e.severity === 'Warning' || e.severity === 'High' ? 'var(--accent-red)' :
                       e.severity === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-green)';
                       
      return `
        <tr>
          <td style="font-family:'Roboto Mono',monospace;font-size:0.75rem;">${e.session_id}</td>
          <td style="font-family:'Roboto Mono',monospace;white-space:nowrap;">${time}</td>
          <td style="font-family:'Roboto Mono',monospace;color:var(--accent-cyan);">${e.ata}</td>
          <td style="font-weight:600;">${e.component}</td>
          <td>${e.action}</td>
          <td>${e.result}</td>
          <td><span style="color:${sevColor};font-weight:600;">${e.severity}</span></td>
        </tr>
      `;
    }).join('');
    
    if (allEntries.length === 0) {
       body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">No individual log entries found for this aircraft.</td></tr>`;
    }
  }

  _statusChip(status) {
    if (!status) return `<span class="status-chip status-open">Open</span>`;
    const lower = status.toLowerCase();
    let cls = 'status-closed';
    if (lower === 'open' || lower === 'in_progress') cls = 'status-open';
    if (lower === 'observation') cls = 'status-observation';
    return `<span class="status-chip ${cls}">${status}</span>`;
  }
}
