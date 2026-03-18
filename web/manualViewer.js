/**
 * manualViewer.js — Manual Documentation Viewer
 * Renders simulated manuals from manuals.json
 */

export class ManualViewer {
  constructor() {
    this.manualsData = null;
    this.currentManual = null;
  }

  setData(data) {
    this.manualsData = data;
  }

  init() {
    this._renderSidebar();
  }

  _renderSidebar() {
    const container = document.getElementById('manualList');
    if (!container || !this.manualsData) return;

    const manualKeys = Object.keys(this.manualsData);
    container.innerHTML = manualKeys.map(key => {
      const manual = this.manualsData[key];
      return `
        <div class="manual-list-item" data-manual="${key}">
          <div class="manual-list-name">${key}</div>
          <div class="manual-list-desc">${manual.title}</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.manual-list-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.manual-list-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentManual = item.dataset.manual;
        this._renderManual(item.dataset.manual);
      });
    });
  }

  _renderManual(key) {
    const content = document.getElementById('manualContent');
    if (!content || !this.manualsData[key]) return;

    const manual = this.manualsData[key];
    let html = `<h1>${manual.title}</h1>`;
    html += `<p>${manual.description}</p>`;

    if (manual.sections) {
      html += this._renderSections(key, manual.sections);
    }

    content.innerHTML = html;
  }

  _renderSections(manualKey, sections) {
    let html = '';

    // AMM-style sections with ATA chapters
    if (manualKey === 'AMM' || manualKey === 'FIM' || manualKey === 'WDM' || manualKey === 'CMM') {
      const keys = Object.keys(sections);
      for (const sKey of keys) {
        const section = sections[sKey];
        html += this._renderATASection(manualKey, section);
      }
    }

    // IPC — parts catalogue
    if (manualKey === 'IPC') {
      const keys = Object.keys(sections);
      for (const sKey of keys) {
        const section = sections[sKey];
        html += this._renderIPCSection(section);
      }
    }

    // SRM — structural repair
    if (manualKey === 'SRM') {
      const keys = Object.keys(sections);
      for (const sKey of keys) {
        const section = sections[sKey];
        html += this._renderSRMSection(section);
      }
    }

    // ALS — airworthiness limitations
    if (manualKey === 'ALS') {
      html += this._renderALSSection(sections);
    }

    // MPD — maintenance planning
    if (manualKey === 'MPD') {
      html += this._renderMPDSection(sections);
    }

    return html;
  }

  _renderATASection(manualKey, section) {
    let html = `<div class="ata-section">`;
    html += `<span class="ata-badge">${section.chapter}</span>`;
    html += `<h2>${section.system || section.component || ''}</h2>`;

    if (section.description) {
      html += `<p>${section.description}</p>`;
    }

    // AMM-specific fields
    if (section.inspection_procedure) {
      html += `<h3>Inspection Procedure</h3><ol>`;
      section.inspection_procedure.forEach(step => {
        html += `<li>${step.replace(/^\d+\.\s*/, '')}</li>`;
      });
      html += `</ol>`;
    }

    if (section.maintenance_interval) {
      html += `<h3>Maintenance Interval</h3>`;
      html += `<p style="font-family:'Roboto Mono',monospace;color:var(--accent-cyan);">${section.maintenance_interval}</p>`;
    }

    if (section.component_list) {
      html += `<h3>Component List</h3><ul>`;
      section.component_list.forEach(c => {
        html += `<li>${c}</li>`;
      });
      html += `</ul>`;
    }

    // FIM-specific
    if (section.fault_codes) {
      section.fault_codes.forEach(fc => {
        html += `<h3>Fault Code: ${fc.code}</h3>`;
        html += `<p><strong>${fc.description}</strong></p>`;
        if (fc.probable_cause) {
          html += `<p><em>Probable Causes:</em></p><ul>`;
          fc.probable_cause.forEach(c => { html += `<li>${c}</li>`; });
          html += `</ul>`;
        }
        if (fc.isolation_steps) {
          html += `<p><em>Isolation Steps:</em></p><ol>`;
          fc.isolation_steps.forEach(s => {
            html += `<li>${s.replace(/^\d+\.\s*/, '')}</li>`;
          });
          html += `</ol>`;
        }
      });
    }

    // WDM-specific
    if (section.diagrams) {
      section.diagrams.forEach(d => {
        html += `<h3>${d.title}</h3>`;
        html += `<p>${d.description}</p>`;
        if (d.wire_list) {
          html += `<table class="part-table"><tr><th>Wire ID</th><th>From</th><th>To</th><th>Gauge</th><th>Type</th></tr>`;
          d.wire_list.forEach(w => {
            html += `<tr><td>${w.wire_id}</td><td>${w.from}</td><td>${w.to}</td><td>${w.gauge}</td><td>${w.type}</td></tr>`;
          });
          html += `</table>`;
        }
      });
    }

    // CMM-specific
    if (section.part_number) {
      html += `<p><strong>Part Number:</strong> ${section.part_number}</p>`;
    }
    if (section.overhaul_interval) {
      html += `<p><strong>Overhaul Interval:</strong> ${section.overhaul_interval}</p>`;
    }
    if (section.procedures) {
      const procNames = { disassembly: 'Disassembly', inspection: 'Inspection', reassembly: 'Reassembly', testing: 'Testing' };
      for (const [key, label] of Object.entries(procNames)) {
        if (section.procedures[key]) {
          html += `<h3>${label}</h3><ol>`;
          section.procedures[key].forEach(s => {
            html += `<li>${s.replace(/^\d+\.\s*/, '')}</li>`;
          });
          html += `</ol>`;
        }
      }
    }

    html += `</div>`;
    return html;
  }

  _renderIPCSection(section) {
    let html = `<div class="ata-section">`;
    html += `<span class="ata-badge">${section.chapter}</span>`;
    html += `<h2>${section.system}</h2>`;

    if (section.parts) {
      html += `<table class="part-table">`;
      html += `<tr><th>Part Number</th><th>Description</th><th>Qty</th><th>Unit</th><th>Serial Tracked</th></tr>`;
      section.parts.forEach(p => {
        html += `<tr>
          <td style="font-family:'Roboto Mono',monospace;color:var(--accent-cyan);">${p.part_number}</td>
          <td>${p.description}</td>
          <td>${p.quantity}</td>
          <td>${p.unit}</td>
          <td>${p.serial_tracked ? '✓ Yes' : '— No'}</td>
        </tr>`;
      });
      html += `</table>`;
    }

    html += `</div>`;
    return html;
  }

  _renderSRMSection(section) {
    let html = `<div class="ata-section">`;
    html += `<span class="ata-badge">${section.chapter}</span>`;
    html += `<h2>${section.system}</h2>`;

    if (section.damage_limits) {
      section.damage_limits.forEach(d => {
        html += `<h3>${d.area}</h3>`;
        const limits = [];
        if (d.max_dent_depth) limits.push(`Max dent depth: ${d.max_dent_depth}`);
        if (d.max_scratch_length) limits.push(`Max scratch length: ${d.max_scratch_length}`);
        if (d.max_scratch_depth) limits.push(`Max scratch depth: ${d.max_scratch_depth}`);
        if (d.max_crack_length) limits.push(`Max crack length: ${d.max_crack_length}`);
        html += `<ul>`;
        limits.forEach(l => { html += `<li>${l}</li>`; });
        html += `</ul>`;
        if (d.repair_procedure) {
          html += `<p><strong>Repair Procedure:</strong> ${d.repair_procedure}</p>`;
        }
      });
    }

    html += `</div>`;
    return html;
  }

  _renderALSSection(sections) {
    let html = '';

    if (sections.structural_inspections) {
      html += `<h2>Structural Inspections</h2>`;
      sections.structural_inspections.forEach(si => {
        html += `<div class="ata-section">`;
        html += `<span class="ata-badge">${si.task_id}</span>`;
        html += `<h3>${si.description}</h3>`;
        html += `<ul>
          <li><strong>Threshold:</strong> ${si.threshold}</li>
          <li><strong>Repeat Interval:</strong> ${si.repeat_interval}</li>
          <li><strong>Inspection Type:</strong> ${si.inspection_type}</li>
          <li><strong>Affected Area:</strong> ${si.affected_area}</li>
        </ul>`;
        html += `</div>`;
      });
    }

    if (sections.life_limited_parts) {
      html += `<h2>Life-Limited Parts</h2>`;
      html += `<table class="part-table"><tr><th>Part</th><th>Life Limit</th><th>Action</th></tr>`;
      sections.life_limited_parts.forEach(p => {
        html += `<tr><td>${p.part}</td><td style="font-family:'Roboto Mono',monospace;">${p.life_limit}</td><td>${p.action}</td></tr>`;
      });
      html += `</table>`;
    }

    return html;
  }

  _renderMPDSection(sections) {
    let html = '';

    if (sections.check_packages) {
      html += `<h2>Check Packages</h2>`;
      for (const [checkName, check] of Object.entries(sections.check_packages)) {
        html += `<div class="ata-section">`;
        html += `<span class="ata-badge">${checkName.replace('_', '-')}</span>`;
        html += `<h3>${checkName.replace('_', ' ')} Check</h3>`;
        html += `<p><strong>Interval:</strong> ${check.interval}</p>`;
        html += `<p><strong>Duration:</strong> ${check.duration}</p>`;
        html += `<h3>Tasks</h3><ul>`;
        check.tasks.forEach(t => { html += `<li>${t}</li>`; });
        html += `</ul></div>`;
      }
    }

    if (sections.scheduled_tasks) {
      html += `<h2>Scheduled Tasks</h2>`;
      html += `<table class="part-table"><tr><th>Task #</th><th>Description</th><th>Interval</th><th>Zone</th><th>Access</th></tr>`;
      sections.scheduled_tasks.forEach(t => {
        html += `<tr>
          <td style="font-family:'Roboto Mono',monospace;color:var(--accent-cyan);">${t.task_number}</td>
          <td>${t.description}</td>
          <td style="font-family:'Roboto Mono',monospace;">${t.interval}</td>
          <td>${t.zone}</td>
          <td>${t.access}</td>
        </tr>`;
      });
      html += `</table>`;
    }

    return html;
  }
}
