/**
 * A320 Maintenance System - Role-Based Access Control (RBAC)
 * Frontend Role Guard for client-side authorization checks
 * 
 * This module provides utilities to check user permissions and restrict access
 * based on role-based permissions and action requirements.
 */

/**
 * Role permissions mapping
 * Defines what actions each role can perform
 */
const ROLE_PERMISSIONS = {
  admin: ['*'], // Admin has all permissions
  
  pilot: [
    'create_flight_log',
    'edit_own_flight_log',
    'view_flight_logs',
    'create_defect_report',
    'view_defects',
    'view_aircraft',
    'view_maintenance_status'
  ],
  
  ame: [
    'create_flight_log',
    'edit_own_flight_log',
    'view_flight_logs',
    'create_defect_report',
    'edit_defect_report',
    'view_defects',
    'create_maintenance_task',
    'update_maintenance_task',
    'complete_maintenance_task',
    'view_maintenance_tasks',
    'create_maintenance_log',
    'update_component_status',
    'view_aircraft',
    'view_maintenance_status'
  ],
  
  inspector: [
    'view_flight_logs',
    'view_defects',
    'view_maintenance_tasks',
    'view_maintenance_logs',
    'approve_maintenance_task',
    'reject_maintenance_task',
    'view_aircraft',
    'view_maintenance_status',
    'view_audit_logs'
  ],
  
  viewer: [
    'view_flight_logs',
    'view_defects',
    'view_maintenance_tasks',
    'view_maintenance_logs',
    'view_aircraft',
    'view_maintenance_status'
  ]
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object with id, email, role, or null if not logged in
 */
function getCurrentUser() {
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('user_email');
  const role = localStorage.getItem('user_role');
  
  if (!userId || !role) {
    return null;
  }
  
  return {
    id: userId,
    email: email,
    role: role
  };
}

/**
 * Check if user is authenticated
 * @returns {boolean} true if user is logged in
 */
function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} true if user has the role
 */
function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

/**
 * Check if user has one of multiple roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} true if user has any of the specified roles
 */
function hasAnyRole(roles) {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
}

/**
 * Check if user has all of multiple roles (restrictive)
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} true if user has all specified roles
 */
function hasAllRoles(roles) {
  const user = getCurrentUser();
  return user && roles.every(role => user.role === role);
}

/**
 * Check if user has permission for a specific action
 * @param {string} action - Action to check (e.g., 'create_flight_log')
 * @returns {boolean} true if user has permission
 */
function hasPermission(action) {
  const user = getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions) {
    return false;
  }
  
  // Check wildcard permission (admin)
  if (permissions.includes('*')) {
    return true;
  }
  
  return permissions.includes(action);
}

/**
 * Check if user has one of multiple permissions
 * @param {string[]} actions - Array of actions to check
 * @returns {boolean} true if user has any of the permissions
 */
function hasAnyPermission(actions) {
  return actions.some(action => hasPermission(action));
}

/**
 * Require specific role - throws error if not authorized
 * @param {string|string[]} roles - Role or array of roles required
 * @throws {Error} if user does not have required role
 * @returns {Object} current user object
 */
function requireRole(roles) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  if (!rolesArray.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${rolesArray.join(' or ')}`);
  }
  
  return user;
}

/**
 * Require specific permission - throws error if not authorized
 * @param {string|string[]} actions - Action or array of actions required
 * @throws {Error} if user does not have required permission
 * @returns {Object} current user object
 */
function requirePermission(actions) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const actionsArray = Array.isArray(actions) ? actions : [actions];
  
  if (!actionsArray.some(action => hasPermission(action))) {
    throw new Error(`Access denied. Required permission: ${actionsArray.join(' or ')}`);
  }
  
  return user;
}

/**
 * Guard function - redirects to login if not authenticated
 * @returns {boolean} true if user is authenticated
 */
function requireAuthentication() {
  if (!isAuthenticated()) {
    window.location.href = '/web/auth/login.html';
    return false;
  }
  return true;
}

/**
 * Guard function - redirects to unauthorized page if role not matched
 * @param {string|string[]} roles - Required role(s)
 * @param {string} redirectUrl - URL to redirect to if unauthorized (default: login)
 * @returns {boolean} true if user has required role
 */
function requireRoleGuard(roles, redirectUrl = '/web/auth/login.html') {
  try {
    requireRole(roles);
    return true;
  } catch (error) {
    console.warn('Authorization failed:', error.message);
    window.location.href = redirectUrl;
    return false;
  }
}

/**
 * Get all permissions for current user
 * @returns {string[]} array of permissions
 */
function getCurrentPermissions() {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }
  return ROLE_PERMISSIONS[user.role] || [];
}

/**
 * Check if feature is enabled for user
 * @param {string} featureName - Feature identifier
 * @returns {boolean} true if feature is enabled for user's role
 */
function isFeatureEnabled(featureName) {
  const enabledFeatures = {
    // Admin features
    'admin_panel': hasRole('admin'),
    'user_management': hasRole('admin'),
    'system_settings': hasRole('admin'),
    'audit_logs_view': hasAnyRole(['admin', 'inspector']),
    
    // Pilot features
    'flight_logbook': hasAnyRole(['pilot', 'ame', 'admin']),
    'defect_reporting': hasAnyRole(['pilot', 'ame', 'admin']),
    
    // AME features
    'maintenance_tasks': hasAnyRole(['ame', 'admin']),
    'component_management': hasAnyRole(['ame', 'admin']),
    'parts_tracking': hasAnyRole(['ame', 'admin']),
    
    // Inspector features
    'task_approval': hasAnyRole(['inspector', 'admin']),
    'sign_off': hasAnyRole(['inspector', 'admin']),
    
    // Viewer features
    'read_only_mode': true  // All authenticated users can view data
  };
  
  return enabledFeatures[featureName] || false;
}

/**
 * Log action to audit trail
 * Sends action to backend for audit logging
 * @param {string} action - Action being performed
 * @param {string} module - Module/feature being used
 * @param {Object} details - Additional details
 */
async function logAction(action, module, details = {}) {
  const user = getCurrentUser();
  
  if (!user) {
    return;
  }
  
  try {
    // This would typically call your backend API
    console.log('AUDIT LOG:', {
      user_id: user.id,
      action: action,
      module: module,
      timestamp: new Date().toISOString(),
      details: details
    });
  } catch (error) {
    console.warn('Failed to log action:', error);
  }
}

/**
 * Format role for display
 * @param {string} role - Role code
 * @returns {string} formatted role name
 */
function formatRole(role) {
  const roleNames = {
    'pilot': 'Pilot',
    'ame': 'Aircraft Maintenance Engineer',
    'inspector': 'Inspector / QA',
    'admin': 'Administrator',
    'viewer': 'Viewer'
  };
  return roleNames[role] || role;
}

/**
 * Get role color for UI display
 * @param {string} role - Role code
 * @returns {string} color hex code
 */
function getRoleColor(role) {
  const roleColors = {
    'pilot': '#3498db',
    'ame': '#e74c3c',
    'inspector': '#f39c12',
    'admin': '#9b59b6',
    'viewer': '#95a5a6'
  };
  return roleColors[role] || '#34495e';
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    requireRole,
    requirePermission,
    requireAuthentication,
    requireRoleGuard,
    getCurrentPermissions,
    isFeatureEnabled,
    logAction,
    formatRole,
    getRoleColor,
    ROLE_PERMISSIONS
  };
}

