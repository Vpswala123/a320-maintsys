import { useState, useMemo } from 'react';
import { FiSearch, FiChevronRight, FiChevronDown, FiBook, FiFileText, FiFolder, FiCpu, FiPrinter, FiShare2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

/* ---------- ATA Chapters ---------- */
const ATA_CHAPTERS = [
  { ch: '05', title: 'Time Limits / Maintenance Checks' },
  { ch: '06', title: 'Dimensions and Areas' },
  { ch: '12', title: 'Servicing' },
  { ch: '21', title: 'Air Conditioning' },
  { ch: '22', title: 'Auto Flight' },
  { ch: '23', title: 'Communications' },
  { ch: '24', title: 'Electrical Power' },
  { ch: '25', title: 'Equipment and Furnishings' },
  { ch: '26', title: 'Fire Protection' },
  { ch: '27', title: 'Flight Controls' },
  { ch: '28', title: 'Fuel' },
  { ch: '29', title: 'Hydraulic Power' },
  { ch: '30', title: 'Ice and Rain Protection' },
  { ch: '31', title: 'Instruments' },
  { ch: '32', title: 'Landing Gear' },
  { ch: '33', title: 'Lights' },
  { ch: '34', title: 'Navigation' },
  { ch: '35', title: 'Oxygen' },
  { ch: '36', title: 'Pneumatic' },
  { ch: '38', title: 'Water / Waste' },
  { ch: '49', title: 'Airborne Auxiliary Power (APU)' },
  { ch: '52', title: 'Doors' },
  { ch: '53', title: 'Fuselage' },
  { ch: '54', title: 'Nacelles / Pylons' },
  { ch: '55', title: 'Stabilizers' },
  { ch: '56', title: 'Windows' },
  { ch: '57', title: 'Wings' },
  { ch: '71', title: 'Powerplant' },
  { ch: '72', title: 'Engine' },
  { ch: '73', title: 'Engine Fuel and Control' },
  { ch: '74', title: 'Ignition' },
  { ch: '75', title: 'Air' },
  { ch: '76', title: 'Engine Controls' },
  { ch: '77', title: 'Engine Indicating' },
  { ch: '78', title: 'Exhaust' },
  { ch: '79', title: 'Oil' },
  { ch: '80', title: 'Starting' },
];

const MANUAL_TYPES = [
  { code: 'AMM', name: 'Aircraft Maintenance Manual' },
  { code: 'FIM', name: 'Fault Isolation Manual' },
  { code: 'IPC', name: 'Illustrated Parts Catalog' },
  { code: 'SRM', name: 'Structural Repair Manual' },
  { code: 'WDM', name: 'Wiring Diagram Manual' },
  { code: 'CMM', name: 'Component Maintenance Manual' },
  { code: 'ALS', name: 'Airworthiness Limitations Section' },
  { code: 'MPD', name: 'Maintenance Planning Document' },
];

/* ---------- Sample Manual Content ---------- */
function generateManualContent(ata, manualType) {
  const chapter = ATA_CHAPTERS.find(c => c.ch === ata);
  return `> **Document Reference:** ${manualType.code}-${ata}-001 Rev.12  
> **Effectivity:** A320-214 (MSN 1000+)  
> **Date:** 2026-03-01

---

## 1. General Description

The ${chapter?.title} system provides essential functionality for safe aircraft operation. This ${manualType.name} covers all maintenance procedures, inspection criteria, and troubleshooting guidance for ATA Chapter ${ata}.

### 1.1 System Overview

The A320 ${chapter?.title?.toLowerCase()} system is designed for reliability and ease of maintenance. Key components include:

- **Primary Unit** — Main system controller (P/N A320-${ata}-100)
- **Secondary Unit** — Backup/redundancy controller (P/N A320-${ata}-200)
- **Sensors** — Monitoring probes and transducers
- **Control Panel** — Overhead panel interface (ATA 31)
- **Wiring Harness** — Dedicated electrical connections (ATA 24)

### 1.2 Component Locations

| Component | Zone | Station | Access Panel |
|-----------|------|---------|-------------|
| Primary Controller | ${ata < 50 ? 'Fwd Equipment Bay' : 'Engine Nacelle'} | STA ${100 + parseInt(ata)} | Panel ${ata}A |
| Sensor Array | ${ata < 50 ? 'Wing Root' : 'Pylon'} | STA ${200 + parseInt(ata)} | Panel ${ata}B |
| Control Valve | Center Fuselage | STA ${300 + parseInt(ata)} | Panel ${ata}C |

---

## 2. Maintenance Procedures

### 2.1 Scheduled Maintenance

**Task ${ata}-100-001 — General Visual Inspection**

1. Access the ${chapter?.title?.toLowerCase()} compartment via panel ${ata}A
2. Perform visual inspection of all accessible components
3. Check for evidence of:
   - Leaks (fluid, air, or hydraulic)
   - Corrosion or surface damage
   - Loose connections or mounting hardware
   - Chafing of wires or tubing
4. Record findings in maintenance logbook
5. If defects found, refer to FIM ${ata}-00 for fault isolation

**Task ${ata}-200-001 — Functional Test**

1. Ensure aircraft is powered (GPU or APU)
2. Select system test on ECAM
3. Verify all parameters are within limits:
   - Pressure: 2800-3000 PSI (hydraulic) / 35-80 PSI (pneumatic)
   - Temperature: within ±5°C of nominal
   - Flow rate: per AMM specification
4. Record test results

---

## 3. Component Data Matrix

| Parameter | Specification | Tolerance |
|-----------|--------------|-----------|
| Operating Pressure | 3000 PSI | ±200 PSI |
| Operating Temperature | -40°C to +70°C | — |
| Service Life | 12,000 FH | — |
| Inspection Interval | 500 FH | — |
| Weight (dry) | ${(parseInt(ata) * 2.3).toFixed(1)} kg | — |

---

## 4. Engineering Schematic

\`\`\`mermaid
graph LR
    A[CTRL UNIT] --> B[CONTROL VALVE]
    B --> C[ACTUATOR]
    C --> D[FEEDBACK SENSOR]
    D --> A
\`\`\`

---

*⚠️ This is simulated educational content — Not official Airbus documentation*
`;
}

export default function ManualsPage() {
  const [search, setSearch] = useState('');
  const [selectedAta, setSelectedAta] = useState('29');
  const [selectedManual, setSelectedManual] = useState(MANUAL_TYPES[0]);

  const filteredChapters = useMemo(() => {
    if (!search) return ATA_CHAPTERS;
    const q = search.toLowerCase();
    return ATA_CHAPTERS.filter(c =>
      c.ch.includes(q) || c.title.toLowerCase().includes(q)
    );
  }, [search]);

  const currentChapter = ATA_CHAPTERS.find(c => c.ch === selectedAta);
  const manualContent = generateManualContent(selectedAta, selectedManual);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Top Header - Technical Library Deck */}
      <div className="h-[64px] px-8 shrink-0 border-b flex items-center justify-between bg-[var(--bg-panel)]/50 backdrop-blur-md" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col">
          <h1 className="text-xs font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase flex items-center gap-3">
            <FiBook className="w-4 h-4 text-[var(--accent-blue)]" /> Technical Document Library
          </h1>
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">Classified // Restricted Access // Airbus A320 Family</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter ATA Chapters..."
              className="w-48 focus:w-64 pl-9 pr-4 h-9 rounded text-[11px] font-mono border outline-none transition-all bg-[var(--bg-panel-2)] text-[var(--text-primary)]"
              style={{ borderColor: 'var(--border)' }} />
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)] transition-all"><FiPrinter className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)] transition-all"><FiShare2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: ATA Chapters - Engineering Tree */}
        <aside className="w-[320px] shrink-0 border-r flex flex-col bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
          <div className="px-6 h-10 border-b flex items-center bg-[var(--bg-panel-2)]/50" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">ATA Chapter Registry</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredChapters.map(chapter => {
              const isActive = selectedAta === chapter.ch;
              return (
                <button key={chapter.ch} onClick={() => setSelectedAta(chapter.ch)}
                  className={`w-full group flex items-start gap-3 px-3 py-2.5 rounded transition-all
                    ${isActive 
                      ? 'bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30' 
                      : 'border border-transparent hover:bg-[var(--bg-panel-2)]'}`}>
                  <span className={`font-mono text-[10px] font-bold mt-0.5 tracking-tighter ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                    [{chapter.ch}]
                  </span>
                  <span className={`text-[11px] font-medium leading-tight ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                    {chapter.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main: Manual Content - Document Viewer */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[var(--bg-primary)]">
          {/* Document Controls */}
          <div className="shrink-0 p-8 border-b bg-[var(--bg-panel)]/30" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-[10px] font-mono text-[var(--accent-blue)] font-bold uppercase tracking-[0.2em] block mb-2">Selected Chapter</span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">ATA {selectedAta} — {currentChapter?.title}</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="text-[9px] font-bold text-[var(--success)] uppercase tracking-widest">Current Revision Certified</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {MANUAL_TYPES.map(manual => {
                const isActive = selectedManual.code === manual.code;
                return (
                  <button key={manual.code} onClick={() => setSelectedManual(manual)}
                    className={`h-8 px-4 rounded border text-[10px] font-bold uppercase tracking-widest transition-all
                      ${isActive 
                        ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/50 text-[var(--accent-cyan)] shadow-[0_0_15px_rgba(0,212,255,0.1)]' 
                        : 'bg-[var(--bg-panel-2)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-light)]'}`}>
                    {manual.code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rendered Markdown Area - Premium Reading Experience */}
          <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
            <div className="max-w-4xl mx-auto py-12 px-8 lg:px-16">
              <article className="prose prose-invert prose-sm max-w-none
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[var(--text-primary)] [&_h1]:mb-8 [&_h1]:tracking-tight
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[var(--border)] [&_h2]:tracking-tight
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[var(--accent-blue)] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:uppercase [&_h3]:tracking-widest
                [&_p]:text-[14px] [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_p]:mb-4
                [&_table]:w-full [&_table]:text-[13px] [&_table]:border-collapse [&_table]:my-8 [&_table]:bg-[var(--bg-panel)]/30
                [&_th]:text-left [&_th]:p-3 [&_th]:bg-[var(--bg-panel-2)] [&_th]:border [&_th]:border-[var(--border)] [&_th]:text-[var(--text-muted)] [&_th]:font-bold [&_th]:uppercase [&_th]:text-[9px] [&_th]:tracking-widest
                [&_td]:p-3 [&_td]:border [&_td]:border-[var(--border)] [&_td]:text-[var(--text-secondary)]
                [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent-blue)] [&_blockquote]:pl-6 [&_blockquote]:bg-[var(--bg-panel-2)] [&_blockquote]:py-4 [&_blockquote]:my-8 [&_blockquote]:rounded [&_blockquote]:text-[13px] [&_blockquote]:text-[var(--text-secondary)]
                [&_hr]:border-[var(--border)] [&_hr]:my-12
                [&_strong]:text-[var(--text-primary)] [&_strong]:font-bold">
                <ReactMarkdown>{manualContent}</ReactMarkdown>
              </article>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
