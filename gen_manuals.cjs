const fs = require('fs');
const path = require('path');
const chapters = [21, 24, 27, 29, 32, 49, 71];
const types = ['AMM', 'IPC', 'TSM'];

function generateSampleManual(ata, type) {
  return `# ATA ${ata} — ${type}

## System Description

This is sample maintenance data for educational purposes only.

ATA ${ata} covers the relevant aircraft system. This manual provides guidance
on inspection, maintenance, and fault isolation procedures.

## Inspection Procedure

1. Ensure aircraft is properly grounded
2. Remove access panels as required
3. Perform visual inspection of components
4. Check for leaks, cracks, or corrosion
5. Verify torque values per maintenance data
6. Reinstall panels and check security

## Maintenance Interval

Inspect at every A-check interval (500 FH) or as directed by MPD.

## Component List

| Part Number | Description | Quantity |
|-------------|-------------|----------|
| A320-${ata}-001 | Primary component | 1 |
| A320-${ata}-002 | Secondary component | 2 |

---
*Simulated data — Not official Airbus documentation*
`;
}

chapters.forEach(ata => {
  const dir = path.join(__dirname, 'public', 'manuals', `ATA_${ata}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  types.forEach(type => {
    fs.writeFileSync(path.join(dir, `${type}.md`), generateSampleManual(ata, type));
  });
});
console.log('Manuals generated');
