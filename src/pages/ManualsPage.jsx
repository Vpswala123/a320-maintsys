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
  return `# ATA ${ata} — ${chapter?.title || 'Unknown'}
## ${manualType.code} — ${manualType.name}

> **Document Reference:** ${manualType.code}-${ata}-001 Rev.12  
> **Effectivity:** A320-214 (MSN 1000+)  
> **Date:** 2026-03-01

---

## 1. General Description

The ${chapter?.title} system provides essential functionality for safe aircraft operation. This ${manualType.name} covers all maintenance procedures, inspection criteria, and troubleshooting guidance for ATA Chapter ${ata}.

### 1.1 System Overview

The A320 ${chapter?.title.toLowerCase()} system is designed for reliability and ease of maintenance. Key components include:

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

1. Access the ${chapter?.title.toLowerCase()} compartment via panel ${ata}A
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
  const [expandedChapters, setExpandedChapters] = useState(new Set(['29']));
  const [selectedAta, setSelectedAta] = useState(null);
  const [selectedManual, setSelectedManual] = useState(null);

  const filteredChapters = useMemo(() => {
    if (!search) return ATA_CHAPTERS;
    const q = search.toLowerCase();
    return ATA_CHAPTERS.filter(c =>
      c.ch.includes(q) || c.title.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleChapter = (ch) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
    setSelectedAta(ch);
  };

  const selectManual = (ata, manual) => {
    setSelectedAta(ata);
    setSelectedManual(manual);
  };

  const manualContent = selectedAta && selectedManual
    ? generateManualContent(selectedAta, selectedManual)
    : null;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar: ATA Tree */}
      <aside className="w-[300px] shrink-0 border-r flex flex-col overflow-hidden"
        style={{ background: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}>
        <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
            style={{ color: 'var(--color-text-muted)' }}>
            <FiBook className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} /> Documentation
          </h3>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search ATA chapter..."
              className="w-full pl-8 pr-3 py-1.5 rounded text-xs border outline-none transition-colors focus:border-[var(--color-accent)]"
              style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredChapters.map(chapter => {
            const isExpanded = expandedChapters.has(chapter.ch);
            const isActive = selectedAta === chapter.ch;
            return (
              <div key={chapter.ch} className="mb-0.5">
                <button onClick={() => toggleChapter(chapter.ch)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs ${isActive ? 'border-[var(--color-accent)]' : 'border-transparent hover:border-[var(--color-border)]'}`}
                  style={{ background: isActive ? 'rgba(47,128,237,0.08)' : 'transparent', border: '1px solid', borderColor: isActive ? 'var(--color-accent)' : 'transparent' }}>
                  {isExpanded ? <FiChevronDown className="w-3 h-3 shrink-0" style={{ color: 'var(--color-accent)' }} /> :
                    <FiChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
                  <FiFolder className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                  <div className="min-w-0">
                    <span className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>ATA {chapter.ch}</span>
                    <span className="ml-1.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>{chapter.title}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 animate-fade-in">
                    {MANUAL_TYPES.map(manual => (
                      <button key={manual.code}
                        onClick={() => selectManual(chapter.ch, manual)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-left text-[11px] transition-all ${selectedManual?.code === manual.code && selectedAta === chapter.ch ? '' : 'hover:bg-[var(--color-bg-card)]'}`}
                        style={{
                          background: selectedManual?.code === manual.code && selectedAta === chapter.ch ? 'rgba(47,128,237,0.1)' : undefined,
                          color: selectedManual?.code === manual.code && selectedAta === chapter.ch ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        }}>
                        <FiFileText className="w-3 h-3 shrink-0" />
                        <span className="font-semibold">{manual.code}</span>
                        <span className="truncate opacity-70">— {manual.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main: Manual Content */}
      <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--color-bg-primary)' }}>
        {manualContent ? (
          <div className="max-w-4xl mx-auto">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  ATA {selectedAta} — {ATA_CHAPTERS.find(c => c.ch === selectedAta)?.title}
                </h2>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-accent)' }}>
                  {selectedManual.code} — {selectedManual.name}
                </p>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                <input type="text" placeholder="Search within manual..."
                  className="pl-8 pr-3 py-1.5 rounded text-xs border outline-none w-48 focus:w-64 transition-all"
                  style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>

            {/* Rendered Markdown */}
            <article className="prose prose-invert prose-sm max-w-none
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[var(--color-text-primary)] [&_h1]:mb-4
              [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[var(--color-text-primary)] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[var(--color-border)]
              [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[var(--color-text-primary)] [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:text-xs [&_p]:text-[var(--color-text-secondary)] [&_p]:leading-relaxed [&_p]:mb-3
              [&_ol]:text-xs [&_ol]:text-[var(--color-text-secondary)] [&_ol]:ml-4 [&_ol]:space-y-1
              [&_ul]:text-xs [&_ul]:text-[var(--color-text-secondary)] [&_ul]:ml-4 [&_ul]:space-y-1
              [&_li]:text-xs
              [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse
              [&_th]:text-left [&_th]:p-2 [&_th]:bg-[var(--color-bg-card)] [&_th]:border [&_th]:border-[var(--color-border)] [&_th]:text-[var(--color-text-muted)] [&_th]:font-semibold [&_th]:uppercase [&_th]:text-[10px] [&_th]:tracking-wider
              [&_td]:p-2 [&_td]:border [&_td]:border-[var(--color-border)] [&_td]:text-[var(--color-text-secondary)]
              [&_code]:text-[var(--color-accent)] [&_code]:bg-[var(--color-bg-card)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono
              [&_pre]:bg-[var(--color-bg-card)] [&_pre]:border [&_pre]:border-[var(--color-border)] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[11px]
              [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-accent)] [&_blockquote]:pl-3 [&_blockquote]:text-xs [&_blockquote]:italic [&_blockquote]:text-[var(--color-text-muted)]
              [&_hr]:border-[var(--color-border)] [&_hr]:my-6
              [&_strong]:text-[var(--color-text-primary)]">
              <ReactMarkdown>{manualContent}</ReactMarkdown>
            </article>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Select a manual from the sidebar</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Choose an ATA chapter, then select the manual type</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
