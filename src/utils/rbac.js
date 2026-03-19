import { useAuth } from '@/hooks/useAuth'

// Role permission definitions
export const PERMISSIONS = {
  admin: ['ALL'],
  pilot: ['pilot_log:create', 'pilot_log:read', 'defect:report', 'manuals:read', 'dashboard:view'],
  ame: ['maintenance:create', 'maintenance:update', 'defect:read', 'defect:update', 'manuals:read', 'dashboard:view'],
  viewer: ['manuals:read', 'dashboard:view']
}

export function hasPermission(role, permission) {
  if (!role) return false
  const perms = PERMISSIONS[role] || []
  return perms.includes('ALL') || perms.includes(permission)
}

export function requireRole(profile, allowedRoles) {
  if (!profile) throw new Error('Not authenticated')
  if (!allowedRoles.includes(profile.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${profile.role}`)
  }
  return true
}

// React hook for permission checks
export function usePermission(permission) {
  const { profile } = useAuth()
  return profile ? hasPermission(profile.role, permission) : false
}
