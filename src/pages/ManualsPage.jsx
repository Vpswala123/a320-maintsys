import { useState, useMemo } from 'react';
import { FiSearch, FiChevronRight, FiChevronDown, FiBook, FiFileText, FiFolder } from 'react-icons/fi';
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

### 2.2 Unscheduled Maintenance

For troubleshooting, refer to:
- **FIM ${ata}** — Fault Isolation Manual
- **TSM ${ata}** — Troubleshooting Manual

---

## 3. Component Data

| Parameter | Specification | Tolerance |
|-----------|--------------|-----------|
| Operating Pressure | 3000 PSI | ±200 PSI |
| Operating Temperature | -40°C to +70°C | — |
| Service Life | 12,000 FH | — |
| Inspection Interval | 500 FH | — |
| Weight (dry) | ${(parseInt(ata) * 2.3).toFixed(1)} kg | — |

---

## 4. Illustrated Parts List

### Figure ${ata}-001 — System Schematic

\`\`\`
┌─────────────────────────────────┐
│        ATA ${ata} SYSTEM         │
│     ${chapter?.title}           │
│                                 │
│  ┌──────┐    ┌──────┐          │
│  │ CTRL │───▶│ VALVE│──┐       │
│  │ UNIT │    │      │  │       │
│  └──────┘    └──────┘  ▼       │
│      │                ┌──────┐ │
│      │                │SENSOR│ │
│      ▼                └──────┘ │
│  ┌──────┐                      │
│  │ECAM  │◀─── Monitoring       │
│  │ DISP │                      │
│  └──────┘                      │
└─────────────────────────────────┘
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
      {/* Top Header */}
      <div className="h-[56px] px-6 shrink-0 border-b flex items-center justify-between bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-sm font-bold tracking-widest text-[var(--text-primary)] uppercase flex items-center gap-2">
          <FiBook className="w-4 h-4 text-[var(--accent-blue)]" /> AIRCRAFT MANUALS — ATA CHAPTER LIBRARY
        </h1>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ATA..."
            className="w-48 focus:w-64 pl-9 pr-3 py-1.5 rounded text-xs font-mono border outline-none transition-all bg-[var(--bg-card)] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border)' }} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: ATA Chapters */}
        <aside className="w-[300px] shrink-0 border-r flex flex-col bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 border-b panel-title" style={{ borderColor: 'var(--border)' }}>
            ATA CHAPTERS
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredChapters.map(chapter => {
              const isActive = selectedAta === chapter.ch;
              return (
                <button key={chapter.ch} onClick={() => setSelectedAta(chapter.ch)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-[#2f80ed15] border border-[var(--accent-blue)]' : 'border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-panel-2)]'}`}>
                  {isActive ? <FiChevronDown className="w-3.5 h-3.5 shrink-0 text-[var(--accent-cyan)]" /> :
                    <FiChevronRight className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />}
                  <div className="min-w-0 flex items-center gap-2">
                    <span className={`font-mono font-bold text-xs ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>ATA {chapter.ch}</span>
                    <span className={`text-xs truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>— {chapter.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main: Manual Content */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[var(--bg-primary)]">
          {/* Main Header / Manual Selection */}
          <div className="shrink-0 p-6 border-b bg-[var(--bg-panel)]" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">ATA {selectedAta} — {currentChapter?.title?.toUpperCase()}</h2>
            <hr className="mb-4" style={{ borderColor: 'var(--border)' }} />
            
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              {MANUAL_TYPES.map(manual => {
                const isActive = selectedManual.code === manual.code;
                return (
                  <button key={manual.code} onClick={() => setSelectedManual(manual)} title={manual.name}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded border font-mono text-xs font-bold transition-all ${isActive ? 'bg-[#00d4ff15] border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'bg-[var(--bg-panel-2)] border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'}`}>
                    📄 {manual.code}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
              <div className="relative px-4 bg-[var(--bg-panel)] text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase">
                {selectedManual.code} — {selectedManual.name}
              </div>
            </div>
          </div>

          {/* Rendered Markdown Area */}
          <div className="flex-1 overflow-y-auto p-6 md:px-12">
            <article className="prose prose-invert prose-sm max-w-none
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--text-primary)] [&_h1]:mb-4
              [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[var(--border)]
              [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:text-[13px] [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_p]:mb-3
              [&_ol]:text-[13px] [&_ol]:text-[var(--text-secondary)] [&_ol]:ml-4 [&_ol]:space-y-1.5
              [&_ul]:text-[13px] [&_ul]:text-[var(--text-secondary)] [&_ul]:ml-4 [&_ul]:space-y-1.5
              [&_li]:text-[13px]
              [&_table]:w-full [&_table]:text-[13px] [&_table]:border-collapse [&_table]:mb-6
              [&_th]:text-left [&_th]:p-2.5 [&_th]:bg-[var(--bg-panel)] [&_th]:border [&_th]:border-[var(--border)] [&_th]:text-[var(--text-muted)] [&_th]:font-semibold [&_th]:uppercase [&_th]:text-[10px] [&_th]:tracking-wider
              [&_td]:p-2.5 [&_td]:border [&_td]:border-[var(--border)] [&_td]:text-[var(--text-secondary)]
              [&_code]:text-[var(--accent-cyan)] [&_code]:bg-[var(--bg-panel-2)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono
              [&_pre]:bg-[var(--bg-panel-2)] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[12px] [&_pre]:shadow-inner
              [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent-blue)] [&_blockquote]:pl-4 [&_blockquote]:bg-[var(--bg-panel-2)] [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg [&_blockquote]:text-[13px] [&_blockquote]:italic [&_blockquote]:text-[var(--text-muted)] [&_blockquote]:mb-6
              [&_hr]:border-[var(--border)] [&_hr]:my-8
              [&_strong]:text-[var(--text-primary)]">
              <ReactMarkdown>{manualContent}</ReactMarkdown>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
