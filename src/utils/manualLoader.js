// Load manual content from /manuals/ directory
export async function loadManual(ataChapter, manualType) {
  try {
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}manuals/ATA_${ataChapter}/${manualType}.md`);
    
    if (!response.ok) {
      throw new Error(`Manual not found for ATA ${ataChapter} ${manualType}`);
    }
    
    const text = await response.text();
    return text;
  } catch (error) {
    console.warn(`Failed to fetch manual, generating sample. Error: ${error.message}`);
    return generateSampleManual(ataChapter, manualType);
  }
}

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
