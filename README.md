# A320 Virtual Maintenance Manual & Digital Logbook System

> **DISCLAIMER:** This project uses simulated data for educational purposes and is not official Airbus documentation. All manuals, maintenance data, and logbooks contain sample/demo content only.

## Overview

An interactive web-based aircraft maintenance platform built for an aerospace engineering capstone project. Engineers can view simulated aircraft manuals, inspect components through a 3D model, monitor maintenance telemetry, and manage digital logbooks — all following DGCA India maintenance workflow concepts.

## Features

- **Interactive 3D Aircraft Viewer** — Three.js-powered GLB model with orbit controls, raycasting click detection, and zone-based component selection
- **Digital Manuals** — 8 simulated manual types (AMM, FIM, IPC, SRM, WDM, CMM, ALS, MPD) with ATA-structured content
- **Component Telemetry** — Real-time health percentage, temperature, cycle hours, maintenance intervals, and warning status for 12 aircraft components
- **Digital Logbooks** — DGCA-style technical, maintenance, and defect logs with filtering
- **Aerospace Dashboard** — Health overview cards, active alerts, upcoming maintenance, and recent log entries
- **ATA Chapter Search** — Instant search across components and manual sections
- **Health Color Coding** — Green (healthy), Yellow (maintenance due), Red (fault)

## Technology Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | HTML, CSS, JavaScript (ES Modules) |
| 3D Engine| Three.js (v0.160 via CDN)   |
| Data     | JSON files (no database)    |
| Hosting  | Replit / GitHub Pages / Vercel |

## Project Structure

```
a320-virtual-maintenance/
├── README.md
├── PROJECT_PLAN.md
├── DATA_STRUCTURE.md
├── SAMPLE_DATA.json
├── assets/
│   └── aircraft.glb              # 3D aircraft model (GLB)
├── data/
│   ├── components.json           # 12 aircraft components with telemetry
│   ├── manuals.json              # 8 simulated manuals (AMM, FIM, etc.)
│   ├── technical_log.json        # DGCA-style technical log
│   ├── maintenance_log.json      # Scheduled maintenance log
│   └── defect_log.json           # Defect/failure log
└── web/
    ├── index.html                # Dashboard page
    ├── style.css                 # Dark aerospace theme
    ├── app.js                    # Main application controller
    ├── threeViewer.js            # Three.js 3D viewer module
    ├── dashboard.js              # Dashboard widgets
    ├── logbook.js                # Logbook table viewer
    ├── manualViewer.js           # Manual documentation renderer
    └── ataSearch.js              # ATA chapter search
```

## Setup & Running

### Local Development

The app must be served via an HTTP server (required for ES modules and fetch API).

**Option 1: npx serve**
```bash
npx -y serve .
```
Then open `http://localhost:3000/web/`

**Option 2: Python**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000/web/`

**Option 3: VS Code Live Server**
Right-click `web/index.html` → "Open with Live Server"

### Deployment

- **GitHub Pages:** Push to GitHub, enable Pages on main branch. Set the site root to include the `web/` folder.
- **Replit:** Import the repo; Replit will serve static files automatically.
- **Vercel:** Deploy the project root; configure the output directory if needed.

## Regulatory Context

Sample maintenance workflow modeled according to Indian DGCA (Directorate General of Civil Aviation) maintenance practices. Includes:
- Technical log format per CAR 145
- Component tracking per DGCA maintenance program requirements
- ATA 100 chapter classification system

## ATA Chapters Covered

| ATA | System                  |
|-----|------------------------|
| 21  | Air Conditioning       |
| 24  | Electrical Power       |
| 27  | Flight Controls        |
| 29  | Hydraulic Power        |
| 32  | Landing Gear           |
| 36  | Pneumatic              |
| 49  | Airborne Auxiliary Power (APU) |
| 52  | Doors                  |
| 71  | Powerplant             |

## License

Educational project — for academic use only.
