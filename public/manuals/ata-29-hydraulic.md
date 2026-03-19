# ATA 29 — Hydraulic Power

> ⚠️ This system uses simulated data for educational purposes only. Not official Airbus documentation.

## System Description

The A320 hydraulic system consists of **three independent systems**: Green, Blue, and Yellow. Each operates at a nominal pressure of **3000 PSI (207 bar)**.

### System Architecture

| System | Color | Primary Power Source | Backup |
|--------|-------|---------------------|--------|
| Green | Green | Engine 1 Driven Pump | — |
| Blue | Blue | Electric Pump | RAT |
| Yellow | Yellow | Engine 2 Driven Pump | Electric Pump, Hand Pump |

## Green System
- Powered by **Engine 1 mechanical pump**
- Supplies: Landing gear, nose wheel steering, brakes (Normal), one aileron, one elevator, one spoiler pair, thrust reversers (Engine 1), flaps, cargo doors
- Reservoir capacity: **14.5 liters**

## Blue System
- Powered by **electric motor pump**
- Emergency backup: **Ram Air Turbine (RAT)** — auto-deploys below 45 knots with dual engine failure
- Supplies: One elevator, one aileron, emergency generator, one spoiler pair, stabilizer
- Reservoir capacity: **3.5 liters**

## Yellow System
- Powered by **Engine 2 mechanical pump**
- Backup: **Electric pump** (ground operations) and **Hand pump** (cargo door)
- Supplies: Brakes (Alternate), nose wheel steering (alternate), one elevator, one aileron, flaps, thrust reversers (Engine 2), cargo doors, passenger doors
- Reservoir capacity: **12.5 liters**

## Power Transfer Unit (PTU)
The PTU transfers hydraulic power between Green and Yellow systems without fluid mixing. It activates automatically when Green/Yellow pressure differential exceeds **500 PSI**.

- Does NOT transfer fluid — only pressure energy
- Typical activation: single-engine taxi with one pump running
- Can be inhibited via PTU pushbutton on overhead panel

## Key Parameters
| Parameter | Normal Range | Caution | Warning |
|-----------|-------------|---------|---------|
| System Pressure | 2900–3050 PSI | < 2500 PSI | < 1450 PSI |
| Reservoir Level | Full | Low | Very Low |
| Fluid Temperature | < 90°C | > 90°C | > 110°C |
| Pump Output | 22 gal/min | — | 0 |

## Maintenance Procedures

### Reservoir Servicing
1. Check fluid level on sight glass (with all systems depressurized)
2. Use only **Skydrol LD-4** or **Eastman Turbo Nycoil**
3. Verify correct fluid type before adding
4. Maximum fill to FULL mark — do not overfill

### Filter Inspection
- Pressure filter: Replace at **C-Check** or if bypass indicator pops
- Return filter: Replace at **C-Check**
- Case drain filter: Replace at **D-Check**

### Leak Check
1. Pressurize system to 3000 PSI
2. Inspect all connections, fittings, and actuators
3. Maximum allowable leak: **None** (zero-leak policy)
4. Document any seepage in maintenance log
