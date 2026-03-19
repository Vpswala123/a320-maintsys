// Free digital signing using browser's built-in crypto — no API key needed

export async function generateSignature(data) {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(JSON.stringify(data))
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifySignature(data, storedHash) {
  const currentHash = await generateSignature(data)
  return currentHash === storedHash
}

// Sign a maintenance session before submission
export async function signMaintenanceSession(session, entries) {
  const payload = {
    session_id: session.id,
    aircraft_id: session.aircraft_id,
    engineer_id: session.engineer_id,
    session_date: session.session_date,
    check_type: session.check_type,
    entries: entries.map(e => ({
      ata: e.ata_chapter,
      task: e.task_description,
      result: e.result
    })),
    signed_at: new Date().toISOString()
  }
  return await generateSignature(payload)
}
