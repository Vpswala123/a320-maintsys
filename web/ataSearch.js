/**
 * ataSearch.js — ATA Chapter Search System
 */

export class ATASearch {
  constructor(components, manualsData) {
    this.components = components;
    this.manualsData = manualsData;
    this.searchInput = document.getElementById('ataSearch');
    this.resultsContainer = document.getElementById('searchResults');
    this.onResultClick = null;

    this._buildIndex();
    this._bindEvents();
  }

  _buildIndex() {
    this.index = [];

    // Index components
    this.components.forEach(comp => {
      this.index.push({
        type: 'component',
        ata: comp.ata,
        title: `ATA ${comp.ata} — ${comp.ata_title}`,
        subtitle: comp.name,
        data: comp
      });
    });

    // Index manual sections
    if (this.manualsData) {
      for (const [manualKey, manual] of Object.entries(this.manualsData)) {
        if (manual.sections) {
          const sectionKeys = Object.keys(manual.sections);
          for (const sKey of sectionKeys) {
            const section = manual.sections[sKey];
            if (section.chapter) {
              const ata = section.chapter.replace('ATA ', '');
              this.index.push({
                type: 'manual',
                ata: ata,
                title: `${section.chapter} — ${section.system || section.component || ''}`,
                subtitle: `${manualKey}: ${manual.title}`,
                manualKey: manualKey
              });
            }
          }
        }
      }
    }

    // Deduplicate by title
    const seen = new Set();
    this.index = this.index.filter(item => {
      const key = item.title + item.subtitle;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  _bindEvents() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', () => {
      const query = this.searchInput.value.trim().toLowerCase();
      if (query.length === 0) {
        this._hideResults();
        return;
      }
      this._search(query);
    });

    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim().length > 0) {
        this._search(this.searchInput.value.trim().toLowerCase());
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
        this._hideResults();
      }
    });
  }

  _search(query) {
    // Search by ATA number or system name
    const results = this.index.filter(item => {
      return item.ata.includes(query) ||
             item.title.toLowerCase().includes(query) ||
             item.subtitle.toLowerCase().includes(query);
    });

    this._showResults(results.slice(0, 10));
  }

  _showResults(results) {
    if (!this.resultsContainer) return;

    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="padding:12px;text-align:center;color:var(--text-muted);font-size:0.78rem;">
          No results found
        </div>
      `;
    } else {
      this.resultsContainer.innerHTML = results.map((r, i) => `
        <div class="search-result-item" data-index="${i}">
          <div class="search-result-ata">${r.type === 'component' ? '📦' : '📖'} ATA ${r.ata}</div>
          <div class="search-result-name">${r.subtitle}</div>
        </div>
      `).join('');

      this.resultsContainer.querySelectorAll('.search-result-item').forEach((item, i) => {
        item.addEventListener('click', () => {
          if (this.onResultClick) {
            this.onResultClick(results[i]);
          }
          this._hideResults();
          this.searchInput.value = '';
        });
      });
    }

    this.resultsContainer.classList.add('visible');
  }

  _hideResults() {
    if (this.resultsContainer) {
      this.resultsContainer.classList.remove('visible');
    }
  }
}
