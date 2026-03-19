# ATA 32 — Landing Gear

> ⚠️ This system uses simulated data for educational purposes only. Not official Airbus documentation.

## System Overview

The A320 uses a **tricycle landing gear** configuration with a nose gear and two main gear assemblies. All gear are retractable with hydraulic actuation from the **Green hydraulic system**.

## Nose Landing Gear (NLG)
- **Type**: Twin-wheel, forward-retracting
- **Tire Size**: 30 × 8.8 R15
- **Tire Pressure**: 170 PSI (11.7 bar)
- **Steering Range**: ±75° (tiller), ±6° (rudder pedals)
- **Shock Absorber**: Oleo-pneumatic, nitrogen/oil
- **Retraction**: Forward into nose bay
- **Centering Cam**: Automatically centers wheels during retraction

## Main Landing Gear (MLG)
- **Type**: Twin-wheel, inward-retracting
- **Tire Size**: 46 × 17 R20
- **Tire Pressure**: 205 PSI (14.1 bar)
- **Brakes**: Carbon multi-disc, hydraulically actuated
- **Anti-Skid**: Digital anti-skid system with individual wheel control
- **Autobrake Settings**: LO, MED, MAX, and BTV (Brake-To-Vacate on neo)

## Landing Gear Control & Indication

### Normal Operation
- **Gear Lever**: UP / DOWN positions on center pedestal
- **Green Indicator**: Three green lights = all gear down and locked
- **Red Warning**: Gear not down with flaps full selected

### Emergency Extension
1. Crew selects gear lever DOWN
2. If no response → **Gravity Extension**:
   - Release gear doors via emergency handle
   - Gear falls by gravity and locks mechanically
   - Verify 3 green lights

## LGCIU — Landing Gear Control Interface Unit
Two LGCIUs (LGCIU 1 and LGCIU 2) alternate between flights:
- Controls gear sequence (doors → gear → doors)
- Provides ground/air logic to multiple systems
- Each LGCIU has 12 proximity sensors

## Brake System

### Normal Braking (Green System)
- **Brake Pedal Application**: Progressive, proportional to pedal input
- **Anti-skid**: Active above 10 knots, releases pressure to prevent skid
- **Autobrake**: Armed in LO/MED before landing, MAX for RTO

### Alternate Braking (Yellow System)
- Automatic if Green system fails
- Anti-skid available with alternate braking
- No autobrake capability

### Parking Brake
- Yellow system pressure
- Held by accumulator if hydraulic pressure lost
- **Do NOT** set parking brake with hot brakes (> 300°C)

## Tire & Wheel Inspection

### Daily Check
- Visual tire condition check
- Check for cuts, bulges, flat spots
- Verify tread depth ≥ 1mm
- Check tire pressure (cold)

### Wheel Check
- Inspect for cracks at bolt holes
- Check wheel paint for overheating indicators
- Heat indicator fuse plugs: melt at **177°C** to deflate tire safely

## Key Maintenance Parameters
| Component | Limit | Action Required |
|-----------|-------|----------------|
| Tire Tread Depth | ≥ 1mm | Replace tire |
| Brake Disc Wear | Min thickness | Replace disc pack |
| Shock Absorber Extension | Per AMM spec | Service/overhaul |
| Anti-skid Test | Before RTS | Functional check |
| Wheel Bearing | Temp check | Replace if overheating |
