/**
 * A320 Maintenance System - Role-Based Access Control Middleware
 * Verifies user roles and permissions for API endpoints
 */

const supabase = require('../database/client');

/**
 * Permission matrix for roles
 */
const PERMISSIONS = {
  admin: {
    '*': true  // Admin can do everything
  },
  
  pilot: {
    'create_flight_log': true,
    'view_flight_logs': true,
    'edit_flight_log': true,
    'create_defect': true,
    'view_defects': true,
    'view_aircraft': true
  },
  
  ame: {
    'create_flight_log': true,
    'view_flight_logs': true,
    'edit_flight_log': true,
    'create_defect': true,
    'view_defects': true,
    'edit_defect': true,
    'create_maintenance_task': true,
    'update_maintenance_task': true,
    'complete_maintenance_task': true,
    'view_maintenance_tasks': true,
    'create_maintenance_log': true,
    'update_component_status': true,
    'view_aircraft': true
  },
  
  inspector: {
    'view_flight_logs': true,
    'view_defects': true,
    'view_maintenance_tasks': true,
    'view_maintenance_logs': true,
    'approve_maintenance': true,
    'view_aircraft': true,
    'view_audit_logs': true
  },
  
  viewer: {
    'view_flight_logs': true,
    'view_defects': true,
    'view_maintenance_tasks': true,
    'view_maintenance_logs': true,
    'view_aircraft': true
  }
};

/**
 * Role-based access control middleware
 * @param {string|string[]} allowedRoles - Role or array of roles required
 */
const roleMiddleware = (allowedRoles) => {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          error: 'Access denied: User context missing',
          code: 'NO_USER_CONTEXT'
        });
      }

      // Admin bypasses all role checks
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user's role is in allowed list
      if (!rolesArray.includes(req.user.role)) {
        console.warn(`Access denied: User ${req.user.id} (${req.user.role}) attempted access requiring ${rolesArray.join(', ')}`);
        
        // Log failed access attempt
        await logAccessAttempt(req, false, `Requires role: ${rolesArray.join(', ')}`);
        
        return res.status(403).json({ 
          error: `Access denied: Requires one of [${rolesArray.join(', ')}]`,
          code: 'INSUFFICIENT_ROLE',
          required_roles: rolesArray,
          user_role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ 
        error: 'Role verification error',
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
};

/**
 * Permission-based access control middleware
 * @param {string|string[]} requiredPermissions - Permission or array of permissions
 * @param {string} mode - 'any' or 'all' (user needs any or all permissions)
 */
const permissionMiddleware = (requiredPermissions, mode = 'any') => {
  const permArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          error: 'Access denied: User context missing',
          code: 'NO_USER_CONTEXT'
        });
      }

      const userPermissions = PERMISSIONS[req.user.role] || {};

      // Admin has all permissions
      if (userPermissions['*']) {
        return next();
      }

      const hasPermission = mode === 'all'
        ? permArray.every(perm => userPermissions[perm])
        : permArray.some(perm => userPermissions[perm]);

      if (!hasPermission) {
        console.warn(`Permission denied: User ${req.user.id} (${req.user.role}) missing ${permArray.join(', ')}`);
        
        await logAccessAttempt(req, false, `Missing permission: ${permArray.join(', ')}`);
        
        return res.status(403).json({ 
          error: `Permission denied: ${permArray.join(', ')} required`,
          code: 'INSUFFICIENT_PERMISSIONS',
          required_permissions: permArray,
          user_permissions: Object.keys(userPermissions)
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        error: 'Permission verification error',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Ownership check - ensure user can only access their own data
 * @param {string} ownerField - Field name containing owner ID (default: 'owner_id')
 */
const ownershipMiddleware = (ownerField = 'owner_id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(403).json({ error: 'User context missing' });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if resource has owner field matching user ID
      const resourceOwnerId = req.body[ownerField] || req.params[ownerField] || req.query[ownerField];
      
      if (resourceOwnerId && resourceOwnerId !== req.user.id) {
        return res.status(403).json({ 
          error: 'Access denied: You can only access your own resources',
          code: 'NOT_OWNER'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Ownership verification error' });
    }
  };
};

/**
 * Airline-based access control
 * Ensures users only access data from their airline
 */
const airlineMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: 'User context missing' });
    }

    // Admin can access all airlines
    if (req.user.role === 'admin') {
      return next();
    }

    // Get airline ID from request
    const airlineIdFromRequest = req.body.airline_id || 
                                  req.params.airline_id || 
                                  req.query.airline_id;

    // If airline ID specified, verify it matches user's airline
    if (airlineIdFromRequest && airlineIdFromRequest !== req.user.airline_id) {
      console.warn(`Cross-airline access attempt: User ${req.user.id} tried to access airline ${airlineIdFromRequest}`);
      
      return res.status(403).json({ 
        error: 'Access denied: You can only access your airline data',
        code: 'WRONG_AIRLINE'
      });
    }

    // Set airline for queries if not specified
    if (!airlineIdFromRequest && req.user.airline_id) {
      req.user.currentAirline = req.user.airline_id;
    }

    next();
  } catch (error) {
    console.error('Airline middleware error:', error);
    res.status(500).json({ error: 'Airline verification error' });
  }
};

/**
 * Log failed access attempts to audit trail
 */
const logAccessAttempt = async (req, success = true, reason = '') => {
  try {
    await supabase
      .from('audit_trail')
      .insert({
        user_id: req.user?.id,
        action: success ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
        module: req.path,
        table_name: 'auth_access',
        details: {
          method: req.method,
          path: req.path,
          reason: reason,
          role: req.user?.role
        },
        ip_address: req.userIP,
        user_agent: req.userAgent
      });
  } catch (error) {
    console.warn('Failed to log access attempt:', error.message);
  }
};

/**
 * Get user role summary for debugging
 */
const getRoleInfo = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user_id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    airline_id: req.user.airline_id,
    permissions: PERMISSIONS[req.user.role] || [],
    is_admin: req.user.role === 'admin'
  });
};

module.exports = {
  roleMiddleware,
  permissionMiddleware,
  ownershipMiddleware,
  airlineMiddleware,
  logAccessAttempt,
  getRoleInfo,
  PERMISSIONS
};

