/**
 * Data Generator — Creates expanded components.json, zones.json, maintenance_schedule.json
 * Run: node generate_data.js
 */
const fs = require('fs');

// ============ ATA CHAPTER DEFINITIONS ============
const ATA = {
  '21': { title: 'Air Conditioning', system: 'Air Conditioning', subsystem: 'fuselage' },
  '22': { title: 'Auto Flight', system: 'Auto Flight', subsystem: 'cockpit' },
  '23': { title: 'Communications', system: 'Communications', subsystem: 'cockpit' },
  '24': { title: 'Electrical Power', system: 'Electrical', subsystem: 'fuselage' },
  '26': { title: 'Fire Protection', system: 'Fire Protection', subsystem: 'fuselage' },
  '27': { title: 'Flight Controls', system: 'Flight Controls', subsystem: 'wing' },
  '28': { title: 'Fuel', system: 'Fuel', subsystem: 'wing' },
  '29': { title: 'Hydraulic Power', system: 'Hydraulic', subsystem: 'fuselage' },
  '30': { title: 'Ice & Rain Protection', system: 'Ice Rain Protection', subsystem: 'wing' },
  '31': { title: 'Instruments', system: 'Instruments', subsystem: 'cockpit' },
  '32': { title: 'Landing Gear', system: 'Landing Gear', subsystem: 'landing_gear' },
  '33': { title: 'Lights', system: 'Lights', subsystem: 'fuselage' },
  '34': { title: 'Navigation', system: 'Navigation', subsystem: 'cockpit' },
  '35': { title: 'Oxygen', system: 'Oxygen', subsystem: 'fuselage' },
  '36': { title: 'Pneumatic', system: 'Pneumatic', subsystem: 'fuselage' },
  '38': { title: 'Water Waste', system: 'Water Waste', subsystem: 'fuselage' },
  '46': { title: 'Information Systems', system: 'Information Systems', subsystem: 'cockpit' },
  '49': { title: 'Auxiliary Power Unit', system: 'APU', subsystem: 'apu' },
  '52': { title: 'Doors', system: 'Doors', subsystem: 'fuselage' },
  '56': { title: 'Windows', system: 'Windows', subsystem: 'fuselage' },
  '57': { title: 'Wings', system: 'Wings', subsystem: 'wing' },
  '71': { title: 'Powerplant', system: 'Engine', subsystem: 'engine' },
  '72': { title: 'Engine Turbine', system: 'Engine', subsystem: 'engine' },
  '73': { title: 'Engine Fuel & Control', system: 'Engine', subsystem: 'engine' },
  '74': { title: 'Ignition', system: 'Engine', subsystem: 'engine' },
  '75': { title: 'Engine Bleed Air', system: 'Engine', subsystem: 'engine' },
  '76': { title: 'Engine Controls', system: 'Engine', subsystem: 'engine' },
  '77': { title: 'Engine Indicating', system: 'Engine', subsystem: 'engine' },
  '78': { title: 'Engine Exhaust', system: 'Engine', subsystem: 'engine' },
  '79': { title: 'Engine Oil', system: 'Engine', subsystem: 'engine' },
  '80': { title: 'Engine Starting', system: 'Engine', subsystem: 'engine' },
};

// ============ COMPONENT DEFINITIONS ============
const componentDefs = [
  // ATA 21 — Air Conditioning
  { id: 'ATA21_01', name: 'Air Conditioning Pack 1', ata: '21', temp: 24, cyc: 4200, intv: 5000 },
  { id: 'ATA21_02', name: 'Air Conditioning Pack 2', ata: '21', temp: 25, cyc: 4500, intv: 5000 },
  { id: 'ATA21_03', name: 'Cabin Temperature Controller', ata: '21', temp: 22, cyc: 1200, intv: 10000 },
  { id: 'ATA21_04', name: 'Mixing Unit', ata: '21', temp: 28, cyc: 8000, intv: 10000 },
  { id: 'ATA21_05', name: 'Trim Air Valve Left', ata: '21', temp: 26, cyc: 3500, intv: 6000 },
  { id: 'ATA21_06', name: 'Trim Air Valve Right', ata: '21', temp: 27, cyc: 3600, intv: 6000 },
  { id: 'ATA21_07', name: 'Cabin Pressure Controller', ata: '21', temp: 23, cyc: 2800, intv: 8000 },
  { id: 'ATA21_08', name: 'Outflow Valve', ata: '21', temp: 30, cyc: 5100, intv: 7000 },
  { id: 'ATA21_09', name: 'Recirculation Fan 1', ata: '21', temp: 35, cyc: 6000, intv: 8000 },
  { id: 'ATA21_10', name: 'Recirculation Fan 2', ata: '21', temp: 34, cyc: 5800, intv: 8000 },
  // ATA 22 — Auto Flight
  { id: 'ATA22_01', name: 'Flight Management Computer 1', ata: '22', temp: 40, cyc: 3000, intv: 12000 },
  { id: 'ATA22_02', name: 'Flight Management Computer 2', ata: '22', temp: 41, cyc: 2800, intv: 12000 },
  { id: 'ATA22_03', name: 'Autopilot Computer 1', ata: '22', temp: 38, cyc: 4500, intv: 10000 },
  { id: 'ATA22_04', name: 'Autopilot Computer 2', ata: '22', temp: 39, cyc: 4200, intv: 10000 },
  { id: 'ATA22_05', name: 'Flight Director', ata: '22', temp: 36, cyc: 5200, intv: 15000 },
  { id: 'ATA22_06', name: 'Auto Throttle System', ata: '22', temp: 42, cyc: 3800, intv: 10000 },
  // ATA 23 — Communications
  { id: 'ATA23_01', name: 'VHF Radio 1', ata: '23', temp: 35, cyc: 2500, intv: 8000 },
  { id: 'ATA23_02', name: 'VHF Radio 2', ata: '23', temp: 34, cyc: 2600, intv: 8000 },
  { id: 'ATA23_03', name: 'HF Radio', ata: '23', temp: 38, cyc: 1800, intv: 10000 },
  { id: 'ATA23_04', name: 'SATCOM Unit', ata: '23', temp: 40, cyc: 1500, intv: 12000 },
  { id: 'ATA23_05', name: 'Interphone System', ata: '23', temp: 28, cyc: 3200, intv: 10000 },
  { id: 'ATA23_06', name: 'PA System Amplifier', ata: '23', temp: 30, cyc: 4000, intv: 8000 },
  { id: 'ATA23_07', name: 'CVR (Cockpit Voice Recorder)', ata: '23', temp: 32, cyc: 5500, intv: 6000 },
  { id: 'ATA23_08', name: 'ELT (Emergency Locator)', ata: '23', temp: 25, cyc: 500, intv: 12000 },
  // ATA 24 — Electrical
  { id: 'ATA24_01', name: 'Generator 1 (IDG)', ata: '24', temp: 65, cyc: 6000, intv: 8000 },
  { id: 'ATA24_02', name: 'Generator 2 (IDG)', ata: '24', temp: 68, cyc: 6500, intv: 8000 },
  { id: 'ATA24_03', name: 'Main Battery', ata: '24', temp: 35, cyc: 2500, intv: 3000 },
  { id: 'ATA24_04', name: 'APU Battery', ata: '24', temp: 33, cyc: 2200, intv: 3000 },
  { id: 'ATA24_05', name: 'Transformer Rectifier Unit 1', ata: '24', temp: 45, cyc: 4000, intv: 12000 },
  { id: 'ATA24_06', name: 'Transformer Rectifier Unit 2', ata: '24', temp: 46, cyc: 3800, intv: 12000 },
  { id: 'ATA24_07', name: 'Static Inverter', ata: '24', temp: 42, cyc: 3500, intv: 10000 },
  { id: 'ATA24_08', name: 'External Power Connector', ata: '24', temp: 30, cyc: 1500, intv: 5000 },
  { id: 'ATA24_09', name: 'Bus Tie Contactor', ata: '24', temp: 38, cyc: 5000, intv: 8000 },
  // ATA 26 — Fire Protection
  { id: 'ATA26_01', name: 'Engine Fire Detector Loop 1', ata: '26', temp: 50, cyc: 4500, intv: 6000 },
  { id: 'ATA26_02', name: 'Engine Fire Detector Loop 2', ata: '26', temp: 52, cyc: 4200, intv: 6000 },
  { id: 'ATA26_03', name: 'APU Fire Detector', ata: '26', temp: 48, cyc: 3000, intv: 8000 },
  { id: 'ATA26_04', name: 'Fire Extinguisher Bottle 1', ata: '26', temp: 22, cyc: 100, intv: 12000 },
  { id: 'ATA26_05', name: 'Fire Extinguisher Bottle 2', ata: '26', temp: 22, cyc: 100, intv: 12000 },
  { id: 'ATA26_06', name: 'Cargo Smoke Detector', ata: '26', temp: 28, cyc: 3500, intv: 5000 },
  { id: 'ATA26_07', name: 'Lavatory Smoke Detector', ata: '26', temp: 25, cyc: 4000, intv: 5000 },
  // ATA 27 — Flight Controls
  { id: 'ATA27_01', name: 'Aileron Left', ata: '27', temp: 15, cyc: 7500, intv: 10000 },
  { id: 'ATA27_02', name: 'Aileron Right', ata: '27', temp: 15, cyc: 7600, intv: 10000 },
  { id: 'ATA27_03', name: 'Flap Actuator Left Inner', ata: '27', temp: 40, cyc: 5500, intv: 6000 },
  { id: 'ATA27_04', name: 'Flap Actuator Left Outer', ata: '27', temp: 38, cyc: 5300, intv: 6000 },
  { id: 'ATA27_05', name: 'Flap Actuator Right Inner', ata: '27', temp: 39, cyc: 5400, intv: 6000 },
  { id: 'ATA27_06', name: 'Flap Actuator Right Outer', ata: '27', temp: 41, cyc: 5200, intv: 6000 },
  { id: 'ATA27_07', name: 'Slat Actuator Left', ata: '27', temp: 38, cyc: 5100, intv: 6000 },
  { id: 'ATA27_08', name: 'Slat Actuator Right', ata: '27', temp: 37, cyc: 5000, intv: 6000 },
  { id: 'ATA27_09', name: 'Spoiler Panel 1 Left', ata: '27', temp: 18, cyc: 3000, intv: 8000 },
  { id: 'ATA27_10', name: 'Spoiler Panel 2 Left', ata: '27', temp: 19, cyc: 3100, intv: 8000 },
  { id: 'ATA27_11', name: 'Spoiler Panel 1 Right', ata: '27', temp: 18, cyc: 3050, intv: 8000 },
  { id: 'ATA27_12', name: 'Spoiler Panel 2 Right', ata: '27', temp: 19, cyc: 3150, intv: 8000 },
  { id: 'ATA27_13', name: 'Elevator Left', ata: '27', temp: 16, cyc: 6800, intv: 12000 },
  { id: 'ATA27_14', name: 'Elevator Right', ata: '27', temp: 16, cyc: 6900, intv: 12000 },
  { id: 'ATA27_15', name: 'Rudder', ata: '27', temp: 14, cyc: 6200, intv: 12000 },
  { id: 'ATA27_16', name: 'Trimmable Horizontal Stabilizer', ata: '27', temp: 20, cyc: 5800, intv: 10000 },
  { id: 'ATA27_17', name: 'ELAC 1 (Elevator Aileron Computer)', ata: '27', temp: 42, cyc: 4200, intv: 15000 },
  { id: 'ATA27_18', name: 'ELAC 2', ata: '27', temp: 43, cyc: 4000, intv: 15000 },
  { id: 'ATA27_19', name: 'SEC 1 (Spoiler Elevator Computer)', ata: '27', temp: 41, cyc: 4100, intv: 15000 },
  { id: 'ATA27_20', name: 'FAC 1 (Flight Augmentation Computer)', ata: '27', temp: 40, cyc: 3800, intv: 15000 },
  // ATA 28 — Fuel
  { id: 'ATA28_01', name: 'Left Wing Tank', ata: '28', temp: 18, cyc: 8000, intv: 12000 },
  { id: 'ATA28_02', name: 'Right Wing Tank', ata: '28', temp: 18, cyc: 8100, intv: 12000 },
  { id: 'ATA28_03', name: 'Center Tank', ata: '28', temp: 20, cyc: 5000, intv: 12000 },
  { id: 'ATA28_04', name: 'Fuel Pump Left Inner', ata: '28', temp: 40, cyc: 6500, intv: 8000 },
  { id: 'ATA28_05', name: 'Fuel Pump Right Inner', ata: '28', temp: 41, cyc: 6400, intv: 8000 },
  { id: 'ATA28_06', name: 'Center Tank Pump 1', ata: '28', temp: 38, cyc: 3000, intv: 8000 },
  { id: 'ATA28_07', name: 'Fuel Quantity Indicator', ata: '28', temp: 30, cyc: 4000, intv: 10000 },
  { id: 'ATA28_08', name: 'Crossfeed Valve', ata: '28', temp: 25, cyc: 2500, intv: 6000 },
  // ATA 29 — Hydraulic
  { id: 'ATA29_01', name: 'Hydraulic Pump Green (EDP)', ata: '29', temp: 75, cyc: 4800, intv: 5000 },
  { id: 'ATA29_02', name: 'Hydraulic Pump Yellow (EDP)', ata: '29', temp: 72, cyc: 4200, intv: 5000 },
  { id: 'ATA29_03', name: 'Hydraulic Pump Blue (Electric)', ata: '29', temp: 65, cyc: 4500, intv: 6000 },
  { id: 'ATA29_04', name: 'Yellow Electric Pump', ata: '29', temp: 60, cyc: 3800, intv: 6000 },
  { id: 'ATA29_05', name: 'Green Reservoir', ata: '29', temp: 45, cyc: 2000, intv: 10000 },
  { id: 'ATA29_06', name: 'Yellow Reservoir', ata: '29', temp: 44, cyc: 2100, intv: 10000 },
  { id: 'ATA29_07', name: 'Blue Reservoir', ata: '29', temp: 43, cyc: 1900, intv: 10000 },
  { id: 'ATA29_08', name: 'Hydraulic Filter Green', ata: '29', temp: 50, cyc: 2800, intv: 3000 },
  { id: 'ATA29_09', name: 'Hydraulic Accumulator', ata: '29', temp: 48, cyc: 3500, intv: 8000 },
  { id: 'ATA29_10', name: 'PTU (Power Transfer Unit)', ata: '29', temp: 55, cyc: 4000, intv: 7000 },
  // ATA 30 — Ice & Rain
  { id: 'ATA30_01', name: 'Wing Anti-Ice Valve Left', ata: '30', temp: 200, cyc: 3000, intv: 6000 },
  { id: 'ATA30_02', name: 'Wing Anti-Ice Valve Right', ata: '30', temp: 200, cyc: 3100, intv: 6000 },
  { id: 'ATA30_03', name: 'Engine Inlet Anti-Ice 1', ata: '30', temp: 180, cyc: 4000, intv: 5000 },
  { id: 'ATA30_04', name: 'Engine Inlet Anti-Ice 2', ata: '30', temp: 185, cyc: 3900, intv: 5000 },
  { id: 'ATA30_05', name: 'Windshield Wiper Left', ata: '30', temp: 25, cyc: 1500, intv: 4000 },
  { id: 'ATA30_06', name: 'Windshield Wiper Right', ata: '30', temp: 25, cyc: 1400, intv: 4000 },
  { id: 'ATA30_07', name: 'Rain Repellent System', ata: '30', temp: 22, cyc: 800, intv: 6000 },
  // ATA 31 — Instruments
  { id: 'ATA31_01', name: 'PFD 1 (Primary Flight Display)', ata: '31', temp: 38, cyc: 5000, intv: 15000 },
  { id: 'ATA31_02', name: 'PFD 2', ata: '31', temp: 39, cyc: 4800, intv: 15000 },
  { id: 'ATA31_03', name: 'ND 1 (Navigation Display)', ata: '31', temp: 37, cyc: 5200, intv: 15000 },
  { id: 'ATA31_04', name: 'ND 2', ata: '31', temp: 38, cyc: 5100, intv: 15000 },
  { id: 'ATA31_05', name: 'ECAM Upper Display', ata: '31', temp: 40, cyc: 4500, intv: 12000 },
  { id: 'ATA31_06', name: 'ECAM Lower Display', ata: '31', temp: 40, cyc: 4600, intv: 12000 },
  { id: 'ATA31_07', name: 'Standby Altimeter', ata: '31', temp: 25, cyc: 6000, intv: 10000 },
  { id: 'ATA31_08', name: 'Clock', ata: '31', temp: 28, cyc: 8000, intv: 20000 },
  // ATA 32 — Landing Gear
  { id: 'ATA32_01', name: 'Nose Landing Gear Assembly', ata: '32', temp: 30, cyc: 5000, intv: 8000 },
  { id: 'ATA32_02', name: 'Left Main Gear Assembly', ata: '32', temp: 35, cyc: 5500, intv: 8000 },
  { id: 'ATA32_03', name: 'Right Main Gear Assembly', ata: '32', temp: 36, cyc: 5600, intv: 8000 },
  { id: 'ATA32_04', name: 'Nose Gear Steering Actuator', ata: '32', temp: 42, cyc: 6200, intv: 7000 },
  { id: 'ATA32_05', name: 'Left Main Gear Retraction Actuator', ata: '32', temp: 44, cyc: 5800, intv: 7000 },
  { id: 'ATA32_06', name: 'Right Main Gear Retraction Actuator', ata: '32', temp: 43, cyc: 5900, intv: 7000 },
  { id: 'ATA32_07', name: 'Brake System Left', ata: '32', temp: 120, cyc: 2500, intv: 3000 },
  { id: 'ATA32_08', name: 'Brake System Right', ata: '32', temp: 118, cyc: 2600, intv: 3000 },
  { id: 'ATA32_09', name: 'Anti-Skid System', ata: '32', temp: 35, cyc: 4000, intv: 8000 },
  { id: 'ATA32_10', name: 'Nose Wheel Tire Assembly', ata: '32', temp: 40, cyc: 1500, intv: 2000 },
  { id: 'ATA32_11', name: 'Left Main Tire Assembly', ata: '32', temp: 45, cyc: 1200, intv: 2000 },
  { id: 'ATA32_12', name: 'Right Main Tire Assembly', ata: '32', temp: 44, cyc: 1300, intv: 2000 },
  // ATA 33 — Lights
  { id: 'ATA33_01', name: 'Landing Light Left', ata: '33', temp: 80, cyc: 3000, intv: 4000 },
  { id: 'ATA33_02', name: 'Landing Light Right', ata: '33', temp: 78, cyc: 3100, intv: 4000 },
  { id: 'ATA33_03', name: 'Navigation Light Red (Left)', ata: '33', temp: 30, cyc: 6000, intv: 8000 },
  { id: 'ATA33_04', name: 'Navigation Light Green (Right)', ata: '33', temp: 30, cyc: 5800, intv: 8000 },
  { id: 'ATA33_05', name: 'Anti-Collision Beacon', ata: '33', temp: 35, cyc: 5000, intv: 6000 },
  { id: 'ATA33_06', name: 'Strobe Light Left', ata: '33', temp: 40, cyc: 4500, intv: 6000 },
  { id: 'ATA33_07', name: 'Strobe Light Right', ata: '33', temp: 40, cyc: 4600, intv: 6000 },
  // ATA 34 — Navigation
  { id: 'ATA34_01', name: 'IRS 1 (Inertial Reference)', ata: '34', temp: 42, cyc: 4500, intv: 15000 },
  { id: 'ATA34_02', name: 'IRS 2', ata: '34', temp: 43, cyc: 4400, intv: 15000 },
  { id: 'ATA34_03', name: 'GPS Receiver 1', ata: '34', temp: 35, cyc: 3000, intv: 12000 },
  { id: 'ATA34_04', name: 'GPS Receiver 2', ata: '34', temp: 36, cyc: 2800, intv: 12000 },
  { id: 'ATA34_05', name: 'Radio Altimeter 1', ata: '34', temp: 38, cyc: 5000, intv: 10000 },
  { id: 'ATA34_06', name: 'Radio Altimeter 2', ata: '34', temp: 39, cyc: 4900, intv: 10000 },
  { id: 'ATA34_07', name: 'Weather Radar', ata: '34', temp: 45, cyc: 3500, intv: 8000 },
  { id: 'ATA34_08', name: 'TCAS (Traffic Collision Avoidance)', ata: '34', temp: 40, cyc: 4000, intv: 10000 },
  { id: 'ATA34_09', name: 'ATC Transponder 1', ata: '34', temp: 36, cyc: 5500, intv: 8000 },
  { id: 'ATA34_10', name: 'FDR (Flight Data Recorder)', ata: '34', temp: 32, cyc: 5500, intv: 6000 },
  // ATA 35 — Oxygen
  { id: 'ATA35_01', name: 'Crew Oxygen Bottle', ata: '35', temp: 22, cyc: 200, intv: 12000 },
  { id: 'ATA35_02', name: 'Passenger Oxygen Generator Fwd', ata: '35', temp: 22, cyc: 50, intv: 15000 },
  { id: 'ATA35_03', name: 'Passenger Oxygen Generator Aft', ata: '35', temp: 22, cyc: 50, intv: 15000 },
  // ATA 36 — Pneumatic
  { id: 'ATA36_01', name: 'Bleed Air Valve Engine 1', ata: '36', temp: 200, cyc: 4500, intv: 6000 },
  { id: 'ATA36_02', name: 'Bleed Air Valve Engine 2', ata: '36', temp: 205, cyc: 4300, intv: 6000 },
  { id: 'ATA36_03', name: 'Cross Bleed Valve', ata: '36', temp: 190, cyc: 3800, intv: 6000 },
  { id: 'ATA36_04', name: 'HP Pressure Regulator 1', ata: '36', temp: 80, cyc: 5200, intv: 7000 },
  { id: 'ATA36_05', name: 'HP Pressure Regulator 2', ata: '36', temp: 82, cyc: 5000, intv: 7000 },
  { id: 'ATA36_06', name: 'Precooler 1', ata: '36', temp: 150, cyc: 4800, intv: 8000 },
  { id: 'ATA36_07', name: 'Precooler 2', ata: '36', temp: 148, cyc: 4700, intv: 8000 },
  // ATA 38 — Water/Waste
  { id: 'ATA38_01', name: 'Potable Water Tank', ata: '38', temp: 18, cyc: 8000, intv: 5000 },
  { id: 'ATA38_02', name: 'Waste Water Tank', ata: '38', temp: 20, cyc: 8000, intv: 5000 },
  // ATA 46 — Information Systems
  { id: 'ATA46_01', name: 'CFDIU (Centralized Fault Display)', ata: '46', temp: 38, cyc: 3500, intv: 15000 },
  { id: 'ATA46_02', name: 'ACARS Datalink Unit', ata: '46', temp: 36, cyc: 4000, intv: 10000 },
  // ATA 49 — APU
  { id: 'ATA49_01', name: 'APU Generator', ata: '49', temp: 70, cyc: 3000, intv: 8000 },
  { id: 'ATA49_02', name: 'APU Fuel Pump', ata: '49', temp: 45, cyc: 4200, intv: 6000 },
  { id: 'ATA49_03', name: 'APU Starter Motor', ata: '49', temp: 55, cyc: 2500, intv: 5000 },
  { id: 'ATA49_04', name: 'APU Exhaust Duct', ata: '49', temp: 350, cyc: 5000, intv: 8000 },
  { id: 'ATA49_05', name: 'APU Oil System', ata: '49', temp: 80, cyc: 3500, intv: 5000 },
  // ATA 52 — Doors
  { id: 'ATA52_01', name: 'Forward Passenger Door L1', ata: '52', temp: 22, cyc: 1500, intv: 10000 },
  { id: 'ATA52_02', name: 'Forward Passenger Door R1', ata: '52', temp: 22, cyc: 1400, intv: 10000 },
  { id: 'ATA52_03', name: 'Rear Passenger Door L4', ata: '52', temp: 22, cyc: 1600, intv: 10000 },
  { id: 'ATA52_04', name: 'Rear Passenger Door R4', ata: '52', temp: 22, cyc: 1500, intv: 10000 },
  { id: 'ATA52_05', name: 'Forward Cargo Door', ata: '52', temp: 18, cyc: 2200, intv: 8000 },
  { id: 'ATA52_06', name: 'Aft Cargo Door', ata: '52', temp: 18, cyc: 2100, intv: 8000 },
  { id: 'ATA52_07', name: 'Emergency Exit L2', ata: '52', temp: 22, cyc: 200, intv: 12000 },
  { id: 'ATA52_08', name: 'Emergency Exit R2', ata: '52', temp: 22, cyc: 200, intv: 12000 },
  // ATA 56 — Windows
  { id: 'ATA56_01', name: 'Windshield Left', ata: '56', temp: 28, cyc: 6000, intv: 15000 },
  { id: 'ATA56_02', name: 'Windshield Right', ata: '56', temp: 28, cyc: 5800, intv: 15000 },
  { id: 'ATA56_03', name: 'Sliding Window Left', ata: '56', temp: 25, cyc: 4000, intv: 10000 },
  // ATA 57 — Wings
  { id: 'ATA57_01', name: 'Left Wing Structure', ata: '57', temp: 15, cyc: 8000, intv: 24000 },
  { id: 'ATA57_02', name: 'Right Wing Structure', ata: '57', temp: 15, cyc: 8100, intv: 24000 },
  { id: 'ATA57_03', name: 'Wing Root Fairing Left', ata: '57', temp: 18, cyc: 7500, intv: 12000 },
  { id: 'ATA57_04', name: 'Wing Root Fairing Right', ata: '57', temp: 18, cyc: 7600, intv: 12000 },
  { id: 'ATA57_05', name: 'Winglet Left', ata: '57', temp: 12, cyc: 6000, intv: 20000 },
  { id: 'ATA57_06', name: 'Winglet Right', ata: '57', temp: 12, cyc: 6100, intv: 20000 },
  // ATA 71-80 — Engine
  { id: 'ENG01', name: 'Engine 1 Fan Section', ata: '71', temp: 420, cyc: 12040, intv: 15000 },
  { id: 'ENG02', name: 'Engine 2 Fan Section', ata: '71', temp: 418, cyc: 11800, intv: 15000 },
  { id: 'ENG03', name: 'LP Compressor Engine 1', ata: '72', temp: 550, cyc: 8500, intv: 12000 },
  { id: 'ENG04', name: 'LP Compressor Engine 2', ata: '72', temp: 545, cyc: 8300, intv: 12000 },
  { id: 'ENG05', name: 'HP Compressor Engine 1', ata: '72', temp: 800, cyc: 9200, intv: 10000 },
  { id: 'ENG06', name: 'HP Compressor Engine 2', ata: '72', temp: 795, cyc: 9000, intv: 10000 },
  { id: 'ENG07', name: 'Combustion Chamber 1', ata: '73', temp: 1100, cyc: 7800, intv: 8000 },
  { id: 'ENG08', name: 'Combustion Chamber 2', ata: '73', temp: 1095, cyc: 7600, intv: 8000 },
  { id: 'ENG09', name: 'HP Turbine Engine 1', ata: '74', temp: 1300, cyc: 6500, intv: 7000 },
  { id: 'ENG10', name: 'HP Turbine Engine 2', ata: '74', temp: 1290, cyc: 6400, intv: 7000 },
  { id: 'ENG11', name: 'LP Turbine Engine 1', ata: '74', temp: 950, cyc: 7200, intv: 9000 },
  { id: 'ENG12', name: 'LP Turbine Engine 2', ata: '74', temp: 945, cyc: 7100, intv: 9000 },
  { id: 'ENG13', name: 'Engine 1 Fuel Pump', ata: '73', temp: 65, cyc: 4500, intv: 6000 },
  { id: 'ENG14', name: 'Engine 2 Fuel Pump', ata: '73', temp: 66, cyc: 4400, intv: 6000 },
  { id: 'ENG15', name: 'Engine 1 Oil Pump', ata: '79', temp: 85, cyc: 3800, intv: 5000 },
  { id: 'ENG16', name: 'Engine 2 Oil Pump', ata: '79', temp: 86, cyc: 3700, intv: 5000 },
  { id: 'ENG17', name: 'Engine 1 Starter', ata: '80', temp: 90, cyc: 2000, intv: 6000 },
  { id: 'ENG18', name: 'Engine 2 Starter', ata: '80', temp: 88, cyc: 1900, intv: 6000 },
  { id: 'ENG19', name: 'Engine 1 Bleed Valve', ata: '75', temp: 250, cyc: 5000, intv: 6000 },
  { id: 'ENG20', name: 'Engine 2 Bleed Valve', ata: '75', temp: 248, cyc: 4900, intv: 6000 },
  { id: 'ENG21', name: 'FADEC 1', ata: '76', temp: 55, cyc: 6000, intv: 20000 },
  { id: 'ENG22', name: 'FADEC 2', ata: '76', temp: 56, cyc: 5800, intv: 20000 },
  { id: 'ENG23', name: 'EGT Probe Engine 1', ata: '77', temp: 60, cyc: 5500, intv: 8000 },
  { id: 'ENG24', name: 'EGT Probe Engine 2', ata: '77', temp: 61, cyc: 5400, intv: 8000 },
  { id: 'ENG25', name: 'N1 Speed Sensor Engine 1', ata: '77', temp: 50, cyc: 5200, intv: 10000 },
  { id: 'ENG26', name: 'N1 Speed Sensor Engine 2', ata: '77', temp: 51, cyc: 5100, intv: 10000 },
  { id: 'ENG27', name: 'Thrust Reverser Actuator 1', ata: '78', temp: 70, cyc: 4000, intv: 8000 },
  { id: 'ENG28', name: 'Thrust Reverser Actuator 2', ata: '78', temp: 72, cyc: 3900, intv: 8000 },
];

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndDate(baseYear, monthRange) {
  const m = rnd(1, monthRange);
  return `${baseYear}-${String(m).padStart(2,'0')}-${String(rnd(1,28)).padStart(2,'0')}`;
}

function buildComponent(def) {
  const ata = ATA[def.ata] || { title: 'Unknown', system: 'Unknown', subsystem: 'fuselage' };
  const health = Math.max(60, Math.min(100, rnd(70, 100)));
  const status = health < 70 ? 'fault' : health < 85 ? 'maintenance_due' : 'normal';
  const warnStatus = health < 70 ? 'fault' : health < 85 ? 'caution' : 'normal';
  const errors = [];
  if (health < 70) errors.push(`Critical: ${def.name} health below 70%`);
  if (health < 85 && health >= 70) errors.push(`Warning: ${def.name} approaching maintenance threshold`);
  if (def.cyc > def.intv * 0.9) errors.push(`Cycle hours nearing maintenance interval`);

  const lastInsp = rndDate(2025, 12);
  const nextInsp = rndDate(2026, 12);
  const maintDue = def.cyc >= def.intv ? 'OVERDUE' : `${def.intv - def.cyc} hrs remaining`;

  return {
    id: def.id,
    component_id: def.id,
    name: def.name,
    ata: def.ata,
    ata_title: ata.title,
    system: ata.system,
    subsystem: ata.subsystem,
    zone: ata.subsystem,
    health: health,
    temperature: def.temp,
    cycle_hours: def.cyc,
    maintenance_interval_hours: def.intv,
    last_inspection: lastInsp,
    next_inspection: nextInsp,
    maintenance_due: maintDue,
    status: status,
    warning_status: warnStatus,
    errors: errors,
    description: `${def.name} — ATA Chapter ${def.ata} (${ata.title}). Part of the ${ata.system} system.`
  };
}

// ============ BUILD COMPONENTS ============
const components = componentDefs.map(buildComponent);
fs.writeFileSync('components.json', JSON.stringify({ components }, null, 2));
console.log(`✅ Generated ${components.length} components`);

// ============ BUILD ZONES (200+) ============
const zoneTemplates = [
  // Engines
  { base: 'Engine 1', ata: '71', type: 'engine', x: -8, y: -3, z: 3 },
  { base: 'Engine 2', ata: '71', type: 'engine', x: 8, y: -3, z: 3 },
  { base: 'Engine 1 Fan', ata: '71', type: 'engine', x: -8, y: -3, z: 5 },
  { base: 'Engine 2 Fan', ata: '71', type: 'engine', x: 8, y: -3, z: 5 },
  { base: 'Engine 1 Nacelle', ata: '71', type: 'engine', x: -8, y: -2, z: 4 },
  { base: 'Engine 2 Nacelle', ata: '71', type: 'engine', x: 8, y: -2, z: 4 },
  { base: 'Engine 1 Exhaust', ata: '78', type: 'engine', x: -8, y: -3, z: 1 },
  { base: 'Engine 2 Exhaust', ata: '78', type: 'engine', x: 8, y: -3, z: 1 },
  { base: 'Engine 1 Pylon', ata: '71', type: 'engine', x: -6, y: -1, z: 3 },
  { base: 'Engine 2 Pylon', ata: '71', type: 'engine', x: 6, y: -1, z: 3 },
  { base: 'Engine 1 Thrust Reverser', ata: '78', type: 'engine', x: -8, y: -3, z: 2 },
  { base: 'Engine 2 Thrust Reverser', ata: '78', type: 'engine', x: 8, y: -3, z: 2 },
  // Wings
  { base: 'Left Wing Root', ata: '57', type: 'wing', x: -4, y: 0, z: 2 },
  { base: 'Right Wing Root', ata: '57', type: 'wing', x: 4, y: 0, z: 2 },
  { base: 'Left Wing Mid Section', ata: '57', type: 'wing', x: -10, y: 0, z: 2 },
  { base: 'Right Wing Mid Section', ata: '57', type: 'wing', x: 10, y: 0, z: 2 },
  { base: 'Left Wing Tip', ata: '57', type: 'wing', x: -18, y: 1, z: 2 },
  { base: 'Right Wing Tip', ata: '57', type: 'wing', x: 18, y: 1, z: 2 },
  { base: 'Left Winglet', ata: '57', type: 'wing', x: -19, y: 2, z: 2 },
  { base: 'Right Winglet', ata: '57', type: 'wing', x: 19, y: 2, z: 2 },
  { base: 'Left Wing Leading Edge Inner', ata: '57', type: 'wing', x: -6, y: 0, z: 4 },
  { base: 'Left Wing Leading Edge Outer', ata: '57', type: 'wing', x: -14, y: 0, z: 4 },
  { base: 'Right Wing Leading Edge Inner', ata: '57', type: 'wing', x: 6, y: 0, z: 4 },
  { base: 'Right Wing Leading Edge Outer', ata: '57', type: 'wing', x: 14, y: 0, z: 4 },
  { base: 'Left Wing Trailing Edge Inner', ata: '57', type: 'wing', x: -6, y: 0, z: 0 },
  { base: 'Left Wing Trailing Edge Outer', ata: '57', type: 'wing', x: -14, y: 0, z: 0 },
  { base: 'Right Wing Trailing Edge Inner', ata: '57', type: 'wing', x: 6, y: 0, z: 0 },
  { base: 'Right Wing Trailing Edge Outer', ata: '57', type: 'wing', x: 14, y: 0, z: 0 },
];

// Generate wing ribs, spars, fuel tanks, flaps, slats, spoilers
for (let i = 1; i <= 12; i++) {
  const side = i <= 6 ? 'Left' : 'Right';
  const num = i <= 6 ? i : i - 6;
  const xSign = i <= 6 ? -1 : 1;
  zoneTemplates.push({ base: `${side} Wing Rib ${num}`, ata: '57', type: 'wing', x: xSign * (4 + num * 2.5), y: 0, z: 2 });
  zoneTemplates.push({ base: `${side} Wing Spar ${num}`, ata: '57', type: 'wing', x: xSign * (4 + num * 2.5), y: 0, z: 1 });
}

// Flaps
for (let i = 1; i <= 4; i++) {
  const side = i <= 2 ? 'Left' : 'Right';
  const pos = i % 2 === 1 ? 'Inner' : 'Outer';
  const xSign = i <= 2 ? -1 : 1;
  zoneTemplates.push({ base: `${side} Flap ${pos}`, ata: '27', type: 'flight_control', x: xSign * (6 + (i%2)*4), y: -0.5, z: -1 });
  zoneTemplates.push({ base: `${side} Flap Track ${pos}`, ata: '27', type: 'flight_control', x: xSign * (6 + (i%2)*4), y: -0.3, z: -1 });
}

// Slats
for (let i = 1; i <= 6; i++) {
  const side = i <= 3 ? 'Left' : 'Right';
  const num = i <= 3 ? i : i - 3;
  const xSign = i <= 3 ? -1 : 1;
  zoneTemplates.push({ base: `${side} Slat ${num}`, ata: '27', type: 'flight_control', x: xSign * (5 + num * 4), y: 0, z: 5 });
}

// Spoilers
for (let i = 1; i <= 10; i++) {
  const side = i <= 5 ? 'Left' : 'Right';
  const num = i <= 5 ? i : i - 5;
  const xSign = i <= 5 ? -1 : 1;
  zoneTemplates.push({ base: `${side} Spoiler ${num}`, ata: '27', type: 'flight_control', x: xSign * (4 + num * 2.5), y: 0.2, z: 0 });
}

// Fuel tanks
['Left Inner Tank', 'Left Outer Tank', 'Right Inner Tank', 'Right Outer Tank', 'Center Tank', 'Vent Surge Tank Left', 'Vent Surge Tank Right'].forEach((n, i) => {
  const x = [-6, -14, 6, 14, 0, -18, 18][i];
  zoneTemplates.push({ base: n, ata: '28', type: 'fuel', x, y: -0.5, z: 2 });
});

// Landing gear zones
['Nose Gear Bay', 'Nose Gear Door', 'Nose Gear Strut', 'Nose Wheel Assembly',
 'Left Main Gear Bay', 'Left Main Gear Door', 'Left Main Gear Strut', 'Left Main Gear Bogie',
 'Left Brake Assembly', 'Left Tire Inner', 'Left Tire Outer',
 'Right Main Gear Bay', 'Right Main Gear Door', 'Right Main Gear Strut', 'Right Main Gear Bogie',
 'Right Brake Assembly', 'Right Tire Inner', 'Right Tire Outer'
].forEach((n, i) => {
  const x = i < 4 ? 0 : i < 11 ? -3 : 3;
  const z = i < 4 ? 12 : -1;
  zoneTemplates.push({ base: n, ata: '32', type: 'landing_gear', x, y: -5, z });
});

// Fuselage sections
['Radome', 'Nose Section', 'Forward Fuselage Upper', 'Forward Fuselage Lower',
 'Center Fuselage Upper', 'Center Fuselage Lower', 'Aft Fuselage Upper', 'Aft Fuselage Lower',
 'Tail Cone', 'Vertical Stabilizer', 'Horizontal Stabilizer Left', 'Horizontal Stabilizer Right',
 'Elevator Left', 'Elevator Right', 'Rudder',
 'Forward Cargo Bay', 'Aft Cargo Bay', 'Bulk Cargo Bay',
 'Forward Galley Area', 'Aft Galley Area',
 'Forward Lavatory Area', 'Aft Lavatory Area',
 'Cabin Zone A (Rows 1-10)', 'Cabin Zone B (Rows 11-20)', 'Cabin Zone C (Rows 21-30)'
].forEach((n, i) => {
  zoneTemplates.push({ base: n, ata: i >= 9 && i <= 14 ? '27' : '53', type: 'fuselage', x: 0, y: i < 5 ? 2 : 0, z: 15 - i * 1.5 });
});

// Cockpit/Avionics
['Cockpit Overhead Panel', 'Cockpit Glareshield', 'Cockpit Center Pedestal', 'Cockpit Side Console Left',
 'Cockpit Side Console Right', 'Main Instrument Panel Left', 'Main Instrument Panel Right',
 'Avionics Bay (E/E Bay)', 'Avionics Rack 1', 'Avionics Rack 2', 'Avionics Rack 3',
 'Circuit Breaker Panel Left', 'Circuit Breaker Panel Right'
].forEach((n, i) => {
  zoneTemplates.push({ base: n, ata: i < 7 ? '31' : '24', type: 'avionics', x: 0, y: 3, z: 18 - i * 0.5 });
});

// Systems
['Hydraulic Bay Green', 'Hydraulic Bay Yellow', 'Hydraulic Bay Blue',
 'Bleed Air Duct Left', 'Bleed Air Duct Right', 'Bleed Air Manifold',
 'Pneumatic Distribution Left', 'Pneumatic Distribution Right',
 'Air Conditioning Bay Left', 'Air Conditioning Bay Right',
 'Pack Bay 1', 'Pack Bay 2',
 'Electrical Distribution Panel Forward', 'Electrical Distribution Panel Aft',
 'APU Compartment', 'APU Exhaust Area', 'APU Intake',
 'Fire Bottle Bay Engine 1', 'Fire Bottle Bay Engine 2', 'APU Fire Bottle Bay',
 'Cargo Fire Suppression Bay',
 'Oxygen Bottle Compartment', 'Crew Oxygen Station',
 'Potable Water Service Panel', 'Waste Water Service Panel'
].forEach((n, i) => {
  const ataMap = { 0:'29',1:'29',2:'29',3:'36',4:'36',5:'36',6:'36',7:'36',8:'21',9:'21',10:'21',11:'21',12:'24',13:'24',14:'49',15:'49',16:'49',17:'26',18:'26',19:'26',20:'26',21:'35',22:'35',23:'38',24:'38' };
  zoneTemplates.push({ base: n, ata: ataMap[i] || '29', type: 'systems', x: rnd(-2,2), y: rnd(-2,2), z: rnd(-15,15) });
});

// Doors & Emergency exits
['Door L1', 'Door R1', 'Door L2', 'Door R2', 'Door L3', 'Door R3', 'Door L4', 'Door R4',
 'Emergency Exit L1 Overwing', 'Emergency Exit R1 Overwing', 'Emergency Exit L2 Overwing', 'Emergency Exit R2 Overwing',
 'Forward Cargo Door', 'Aft Cargo Door', 'Bulk Cargo Door',
 'Nose Gear Service Door', 'Avionics Access Door'
].forEach((n, i) => {
  const x = n.includes('L') ? -2 : n.includes('R') ? 2 : 0;
  zoneTemplates.push({ base: n, ata: '52', type: 'doors', x, y: 0, z: 15 - i * 2 });
});

// Build zones
const zones = zoneTemplates.map((z, i) => ({
  zone_id: `Z${String(i + 1).padStart(3, '0')}`,
  name: z.base,
  ata: z.ata,
  type: z.type,
  position: { x: z.x + Math.random() * 0.5, y: z.y + Math.random() * 0.5, z: z.z + Math.random() * 0.5 },
  radius: z.type === 'engine' ? 3 : z.type === 'wing' ? 2.5 : 2,
  description: `Aircraft zone: ${z.base} (ATA ${z.ata})`
}));

fs.writeFileSync('zones.json', JSON.stringify({ zones }, null, 2));
console.log(`✅ Generated ${zones.length} zones`);

// ============ MAINTENANCE SCHEDULE ============
const schedule = {
  checks: [
    { check_type: 'A1-Check', interval_hours: 500, interval_months: null, estimated_duration_hours: 50, description: 'Routine inspection of critical systems, fluid levels, and basic operational checks.', tasks: ['Visual inspection of fuselage and wings','Check engine oil levels','Inspect landing gear','Check tire pressure and wear','Test emergency lights','Inspect flight control surfaces','Check hydraulic fluid levels','Review fault logs'] },
    { check_type: 'A2-Check', interval_hours: 1000, interval_months: null, estimated_duration_hours: 80, description: 'Extended line maintenance check including lubrication and filter replacements.', tasks: ['All A1-Check tasks','Replace hydraulic filters','Lubricate flight control hinges','Inspect bleed air ducts','Test fire detection system','Check oxygen system pressure','Inspect APU','Replace cabin air filters'] },
    { check_type: 'B-Check', interval_hours: null, interval_months: 6, estimated_duration_hours: 160, description: 'Intermediate maintenance check performed at regular calendar intervals.', tasks: ['All A-Check tasks','Detailed structural inspection','Engine borescope inspection','Landing gear detailed check','Hydraulic system test','Avionics functional check','Fuel system inspection','Corrosion prevention treatment'] },
    { check_type: 'C-Check', interval_hours: 6000, interval_months: 24, estimated_duration_hours: 2000, description: 'Heavy maintenance check requiring aircraft out of service for 1-2 weeks.', tasks: ['Complete structural inspection','Engine removal and overhaul assessment','Landing gear overhaul','Complete avionics check','Cabin refurbishment','Fuel tank inspection','Flight control system overhaul','Wiring inspection and replacement','Paint inspection','Weight and balance check'] },
    { check_type: 'D-Check', interval_hours: 24000, interval_months: 120, estimated_duration_hours: 50000, description: 'Major overhaul — heaviest check, aircraft completely stripped and rebuilt. Also called a heavy maintenance visit.', tasks: ['Complete airframe disassembly','Full structural inspection and repair','All systems overhaul','Complete rewiring','Engine overhaul','Landing gear complete overhaul','Fuel system overhaul','Cabin complete strip and refit','New paint','Certification flight test'] },
  ],
  aircraft_schedule: [
    { aircraft_reg: 'VT-DEM', check_type: 'A1-Check', last_check: '2026-01-15', next_due: '2026-04-15', status: 'scheduled' },
    { aircraft_reg: 'VT-DEM', check_type: 'C-Check', last_check: '2024-06-01', next_due: '2026-06-01', status: 'upcoming' },
    { aircraft_reg: 'VT-DEM', check_type: 'D-Check', last_check: '2020-01-01', next_due: '2030-01-01', status: 'planned' },
  ]
};

fs.writeFileSync('maintenance_schedule.json', JSON.stringify(schedule, null, 2));
console.log('✅ Generated maintenance_schedule.json');

// ============ AIRLINES ============
const airlines = {
  airlines: [
    { airline_id: 'AL001', name: 'Student Demo Airline', country: 'India', icao: 'SDA', iata: 'SD' },
    { airline_id: 'AL002', name: 'Sky Express (Simulated)', country: 'India', icao: 'SKE', iata: 'SE' },
    { airline_id: 'AL003', name: 'Global Wings (Simulated)', country: 'UAE', icao: 'GWG', iata: 'GW' },
  ]
};
fs.writeFileSync('airlines.json', JSON.stringify(airlines, null, 2));
console.log('✅ Generated airlines.json');

console.log('\n🎉 All data files generated successfully!');
