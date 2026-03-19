# ATA 71/72 — Powerplant (CFM56-5B)

> ⚠️ This system uses simulated data for educational purposes only. Not official Airbus documentation.

## Engine Overview

The Airbus A320-200 (ceo) is powered by two **CFM56-5B** high-bypass turbofan engines, manufactured by CFM International (GE/Safran joint venture).

| Parameter | CFM56-5B4/3 |
|-----------|------------|
| Thrust Rating | 27,000 lbf (120 kN) |
| Bypass Ratio | 5.5:1 |
| Overall Pressure Ratio | 32.6:1 |
| Dry Weight | 5,250 lb (2,381 kg) |
| Length | 99.6 in (2.53 m) |
| Fan Diameter | 68.3 in (1.73 m) |
| Stages | 1 Fan + 4 LP + 9 HP / 1 HP + 4 LP |

## Engine Sections

### Fan Section
- Single-stage fan with **36 fan blades** (titanium)
- Fan case with containment ring for blade-out protection
- Fan outlet guide vanes (OGVs) — structural and aerodynamic

### Low-Pressure Compressor (Booster)
- **4 stages**, driven by LP shaft
- Variable bleed valves (VBVs) — prevent surge at low power
- Anti-icing from HP bleed

### High-Pressure Compressor (Core)
- **9 stages**, driven by HP shaft
- Variable stator vanes (VSVs) on stages 1–4
- Compressor discharge pressure: ~430 PSI at max thrust
- Bleed ports: Stage 5 (IP) and Stage 9 (HP)

### Combustion Chamber
- **Annular combustor** — single, continuous burn tube
- 20 fuel nozzles arranged circumferentially
- Dual igniter plugs (one each side)
- Design temperature: up to 1,400°C

### High-Pressure Turbine
- **Single-stage** HPT
- Air-cooled blades and nozzle guide vanes
- Drives HP compressor at ~15,000 RPM (N2)

### Low-Pressure Turbine
- **4-stage** LPT
- Drives fan and booster at ~5,000 RPM (N1)
- Turbine exit temperature (EGT) monitoring

## FADEC — Full Authority Digital Engine Control
Each engine has a **dual-channel FADEC** (EEC — Electronic Engine Control):
- Controls fuel flow, variable geometry, bleed valves, and ignition
- Provides thrust management (N1 command computation)
- Engine limit protection: N1, N2, EGT
- Automatic engine start sequence
- **Each channel is independent** with its own power supply

### FADEC Modes
| Mode | Description |
|------|------------|
| Normal | Full authority — automatic thrust rating |
| Alternate | Reduced protection, manual thrust management |
| Manual | Direct fuel control (very rare) |

## Engine Parameters

### Normal Operating Limits
| Parameter | Max Takeoff | Max Continuous | Idle |
|-----------|------------|----------------|------|
| N1 | ~104% | ~100% | ~20% |
| N2 | ~105% | ~100% | ~60% |
| EGT | 950°C (5 min) | 915°C | ~400°C |
| Oil Pressure | 25–65 PSI | 25–65 PSI | > 13 PSI |
| Oil Temperature | < 155°C | < 140°C | > -10°C |
| Fuel Flow | ~6,500 kg/h | ~5,000 kg/h | ~350 kg/h |

## Engine Oil System
- **Oil Tank**: 15.2 quarts capacity, mounted on accessory gearbox
- **Oil Pump**: Gear-type pressure pump + 3 scavenge pumps
- **Oil Filter**: Full-flow with bypass valve
- **Oil Cooler**: Fuel-cooled heat exchanger (FCOC)
- **Chip Detector**: Magnetic plug — detects metal particles
- **Minimum Oil Quantity**: 9.5 quarts for dispatch

## Maintenance Procedures

### Engine Borescope Inspection
Borescope ports available at:
- Combustion chamber
- HPT nozzle guide vanes
- HPT blades
- LPT stages 1 and 2

### Engine Wash
- Compressor wash every 1,000 hours (or as needed)
- Use approved detergent solution
- Perform at idle (motoring wash or running wash)

### Engine Vibration Monitoring
- N1 and N2 vibration sensors
- Broadband vibration monitoring
- Alert threshold: **4.0 IPS** (caution), **5.0 IPS** (warning)

### Oil Servicing
1. Check oil quantity with engine shut down > 15 minutes
2. Add only approved oil (MIL-PRF-23699 Type II)
3. Maximum oil consumption: **0.5 qt/hr**
4. **Trend monitor**: High oil consumption may indicate seal wear
