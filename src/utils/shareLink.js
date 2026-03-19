export function generateShareLink(aircraftTail, zoneId, componentId) {
  const base = window.location.origin + (import.meta.env.BASE_URL || '/')
  const params = new URLSearchParams({
    aircraft: aircraftTail,
    zone: zoneId,
    component: componentId || '',
    snap: new Date().toISOString().split('T')[0]
  })
  return `${base}#/ar-share?${params.toString()}`
}

export async function copyShareLink(aircraftTail, zoneId, componentId) {
  const link = generateShareLink(aircraftTail, zoneId, componentId)
  await navigator.clipboard.writeText(link)
  return link
}

// On app load — check if opened via share link
export function parseShareLink() {
  const hash = window.location.hash
  if (!hash.includes('ar-share')) return null
  const params = new URLSearchParams(hash.split('?')[1])
  return {
    aircraft: params.get('aircraft'),
    zone: params.get('zone'),
    component: params.get('component'),
    snap: params.get('snap')
  }
}
