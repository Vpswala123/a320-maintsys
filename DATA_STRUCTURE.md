# Data Structure — A320 Virtual Maintenance System

## Component Data Schema (`data/components.json`)

```json
{
  "aircraft": "A320-200",
  "registration": "VT-DEM",
  "operator": "Sample Airways India",
  "total_flight_hours": 24680,
  "total_cycles": 15230,
  "components": [
    {
      "id": "string — unique identifier",
      "name": "string — component display name",
      "ata": "string — ATA chapter number",
      "ata_title": "string — ATA chapter title",
      "zone": "string — 3D interaction zone (ENGINE_ZONE, WING_ZONE, etc.)",
      "description": "string — component description",
      "health": "number — percentage 0-100",
      "temperature": "number — degrees Celsius",
      "cycle_hours": "number — total operating hours/cycles",
      "maintenance_due": "string — remaining time to next maintenance",
      "maintenance_interval": "string — standard interval",
      "last_inspection": "string — ISO date",
      "next_inspection": "string — ISO date",
      "warning_status": "string — normal | caution | fault",
      "errors": ["string — active error messages"]
    }
  ]
}
```

### 3D Interaction Zones

| Zone               | Aircraft Area                  |
|--------------------|---------------------------------|
| ENGINE_ZONE        | Engine nacelles under wings     |
| WING_ZONE          | Wings, hydraulic systems        |
| LANDING_GEAR_ZONE  | Main and nose landing gear      |
| APU_ZONE           | Tail cone                       |
| COCKPIT_ZONE       | Flight deck, avionics           |
| FUSELAGE_ZONE      | Cabin, doors, pneumatic systems |

## Technical Log Schema (`data/technical_log.json`)

```json
{
  "id": "string — entry ID (TL-001)",
  "date": "string — ISO date",
  "aircraft_reg": "string — aircraft registration",
  "ata": "string — ATA chapter",
  "defect": "string — defect description",
  "action": "string — corrective action taken",
  "engineer": "string — engineer name and AME license",
  "status": "string — Open | Closed | Open — Monitoring"
}
```

## Maintenance Log Schema (`data/maintenance_log.json`)

```json
{
  "id": "string — entry ID (ML-001)",
  "date": "string — ISO date",
  "component": "string — component name",
  "ata": "string — ATA chapter",
  "maintenance_type": "string — Scheduled Inspection | A-Check | etc.",
  "interval": "string — maintenance interval",
  "work_description": "string — work performed",
  "engineer": "string — engineer name and AME license",
  "status": "string — Completed"
}
```

## Defect Log Schema (`data/defect_log.json`)

```json
{
  "id": "string — entry ID (DL-001)",
  "date": "string — ISO date",
  "component": "string — component name",
  "ata": "string — ATA chapter",
  "fault": "string — fault description",
  "severity": "string — Low | Medium | High",
  "action": "string — corrective action",
  "engineer": "string — engineer name and AME license",
  "status": "string — Open | Closed | Under Observation"
}
```

## Manuals Schema (`data/manuals.json`)

Each manual contains ATA-structured sections with fields varying by manual type:

- **AMM** — inspection_procedure, maintenance_interval, component_list
- **FIM** — fault_codes with probable_cause and isolation_steps
- **IPC** — parts with part_number, quantity, serial tracking
- **SRM** — damage_limits with repair procedures
- **WDM** — wiring diagrams with wire lists
- **CMM** — overhaul procedures (disassembly, inspection, reassembly, testing)
- **ALS** — structural_inspections, life_limited_parts
- **MPD** — check_packages (A/C/D checks), scheduled_tasks

## Health Color Coding

| Range    | Color  | Status           |
|----------|--------|------------------|
| 90–100%  | Green  | Healthy          |
| 75–89%   | Yellow | Maintenance Due  |
| 0–74%    | Red    | Fault            |
