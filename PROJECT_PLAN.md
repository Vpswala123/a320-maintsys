# Project Plan — A320 Virtual Maintenance System

## Objective

Create a digital aircraft maintenance system that replicates engineering maintenance workflows using simulated aircraft documentation, interactive 3D visualization, and DGCA-style digital logbooks.

## Modules

### 1. Documentation Module

Simulated manuals stored in `data/manuals.json`:

| Manual | Full Name                          |
|--------|------------------------------------|
| AMM    | Aircraft Maintenance Manual        |
| FIM    | Fault Isolation Manual             |
| IPC    | Illustrated Parts Catalogue        |
| SRM    | Structural Repair Manual           |
| WDM    | Wiring Diagram Manual              |
| CMM    | Component Maintenance Manual       |
| ALS    | Airworthiness Limitations Section  |
| MPD    | Maintenance Planning Document      |

Each manual contains ATA-structured sections covering chapters 21, 24, 27, 29, 32, 36, 49, 52, and 71.

### 2. 3D Aircraft Visualization

Interactive Three.js viewer (`web/threeViewer.js`) with:
- GLB model loaded from `assets/aircraft.glb`
- OrbitControls for rotate, zoom, pan
- Raycasting with zone-based component mapping
- Click to inspect component health, temperature, cycles, and warnings
- Wireframe toggle

6 aircraft zones: ENGINE, WING, LANDING_GEAR, APU, COCKPIT, FUSELAGE

### 3. Maintenance Health Monitoring

12 components across 9 ATA chapters in `data/components.json`:
- Health percentage with color coding (green/yellow/red)
- Temperature and cycle tracking
- Maintenance interval countdown
- Active error/warning display

### 4. Digital Logbook System

Three logbooks in `data/`:
- **Technical Log** — Defect reporting and corrective actions
- **Maintenance Log** — Scheduled maintenance records
- **Defect Log** — Component failure tracking with severity

All follow DGCA CAR 145 format.

### 5. Dashboard

Homepage dashboard (`web/dashboard.js`) showing:
- Aircraft health overview cards
- Active alerts panel
- Upcoming maintenance timeline
- Recent log entries

### 6. ATA Chapter Search

Search across components and manual sections by ATA number or system name (`web/ataSearch.js`).

## Technology Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | HTML, CSS, JavaScript    |
| 3D       | Three.js v0.160          |
| Data     | JSON files               |
| Hosting  | Replit / GitHub Pages    |

## Regulatory Context

Workflow modeled per DGCA India maintenance practices (CAR 145, MCAR Part 43).

## Status

✅ All modules implemented and functional.
