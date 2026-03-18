/**
 * A320 Maintenance System - Audit Service
 * Comprehensive logging of all system actions for compliance and security
 */

const supabase = require('../database/client');

class AuditService {
  /**
   * Log an audit event
   * @param {Object} options - Audit event options
   */
  static async logEvent(options) {
    const {
      user_id,
      action,
      module,
      table_name,
      record_id,
      old_values = null,
      new_values = null,
      ip_address = null,
      user_agent = null,
      status = 'success',
      details = {}
    } = options;

    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .insert({
          user_id,
          action,
          module,
          table_name,
          record_id,
          old_values: old_values ? JSON.stringify(old_values) : null,
          new_values: new_values ? JSON.stringify(new_values) : null,
          ip_address,
          user_agent,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log audit event:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Audit logging error:', error);
      return { success: false, error };
    }
  }

  /**
   * Log create action
   */
  static async logCreate(user_id, module, table_name, record_id, new_values, metadata = {}) {
    return this.logEvent({
      user_id,
      action: 'CREATE',
      module,
      table_name,
      record_id,
      new_values,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    });
  }

  /**
   * Log update action
   */
  static async logUpdate(user_id, module, table_name, record_id, old_values, new_values, metadata = {}) {
    return this.logEvent({
      user_id,
      action: 'UPDATE',
      module,
      table_name,
      record_id,
      old_values,
      new_values,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    });
  }

  /**
   * Log delete action
   */
  static async logDelete(user_id, module, table_name, record_id, old_values, metadata = {}) {
    return this.logEvent({
      user_id,
      action: 'DELETE',
      module,
      table_name,
      record_id,
      old_values,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    });
  }

  /**
   * Log read/view action
   */
  static async logRead(user_id, module, table_name, record_id, metadata = {}) {
    return this.logEvent({
      user_id,
      action: 'READ',
      module,
      table_name,
      record_id,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    });
  }

  /**
   * Log authentication event
   */
  static async logAuth(user_id, action, success = true, metadata = {}) {
    return this.logEvent({
      user_id,
      action: success ? 'AUTH_SUCCESS' : 'AUTH_FAILED',
      module: 'authentication',
      table_name: 'auth_events',
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent,
      new_values: { action, success }
    });
  }

  /**
   * Log approval action
   */
  static async logApproval(user_id, task_id, decision, metadata = {}) {
    return this.logEvent({
      user_id,
      action: decision === 'approved' ? 'APPROVE' : 'REJECT',
      module: 'approvals',
      table_name: 'approvals',
      record_id: task_id,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent,
      new_values: { decision, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Log critical action (requires special attention)
   */
  static async logCriticalAction(user_id, action, details, metadata = {}) {
    return this.logEvent({
      user_id,
      action: `CRITICAL_${action}`,
      module: 'critical',
      table_name: 'critical_actions',
      new_values: details,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    });
  }

  /**
   * Get audit trail for a record
   */
  static async getRecordAudit(table_name, record_id, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('table_name', table_name)
        .eq('record_id', record_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch audit trail:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Audit retrieval error:', error);
      return [];
    }
  }

  /**
   * Get audit trail for a user
   */
  static async getUserAudit(user_id, limit = 100) {
    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch user audit:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Audit retrieval error:', error);
      return [];
    }
  }

  /**
   * Get recent activity (last N hours)
   */
  static async getRecentActivity(hours = 24, module = null) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from('audit_trail')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        console.error('Failed to fetch recent activity:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Activity retrieval error:', error);
      return [];
    }
  }

  /**
   * Generate audit report
   */
  static async generateAuditReport(filters = {}) {
    try {
      const { user_id, module, action, start_date, end_date, limit = 10000 } = filters;

      let query = supabase.from('audit_trail').select('*');

      if (user_id) query = query.eq('user_id', user_id);
      if (module) query = query.eq('module', module);
      if (action) query = query.eq('action', action);
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Generate report summary
      const report = {
        total_events: data.length,
        events_by_action: {},
        events_by_module: {},
        events_by_user: {},
        events_by_table: {},
        entries: data
      };

      data.forEach(entry => {
        report.events_by_action[entry.action] = (report.events_by_action[entry.action] || 0) + 1;
        report.events_by_module[entry.module] = (report.events_by_module[entry.module] || 0) + 1;
        report.events_by_user[entry.user_id] = (report.events_by_user[entry.user_id] || 0) + 1;
        report.events_by_table[entry.table_name] = (report.events_by_table[entry.table_name] || 0) + 1;
      });

      return report;
    } catch (error) {
      console.error('Report generation error:', error);
      return null;
    }
  }

  /**
   * Detect suspicious activity
   */
  static async detectSuspiciousActivity() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Get failed auth attempts
      const { data: failedAuths } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('action', 'AUTH_FAILED')
        .gte('created_at', oneHourAgo);

      // Get unusually high create/update activity
      const { data: createActivity } = await supabase
        .from('audit_trail')
        .select('*')
        .in('action', ['CREATE', 'UPDATE', 'DELETE'])
        .gte('created_at', oneHourAgo);

      const alerts = [];

      // Alert on multiple failed auth attempts from same IP
      if (failedAuths && failedAuths.length > 0) {
        const ipCounts = {};
        failedAuths.forEach(entry => {
          if (entry.ip_address) {
            ipCounts[entry.ip_address] = (ipCounts[entry.ip_address] || 0) + 1;
          }
        });

        Object.entries(ipCounts).forEach(([ip, count]) => {
          if (count >= 5) {
            alerts.push({
              severity: 'high',
              type: 'BRUTE_FORCE_ATTEMPT',
              description: `${count} failed auth attempts from IP ${ip}`,
              ip_address: ip,
              attempt_count: count
            });
          }
        });
      }

      // Alert on unusual update activity
      if (createActivity && createActivity.length > 100) {
        alerts.push({
          severity: 'medium',
          type: 'HIGH_UPDATE_ACTIVITY',
          description: `${createActivity.length} create/update/delete operations in last hour`,
          operation_count: createActivity.length
        });
      }

      return alerts;
    } catch (error) {
      console.error('Suspicious activity detection error:', error);
      return [];
    }
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  static async cleanupOldLogs(daysToKeep = 365) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('audit_trail')
        .delete()
        .lt('created_at', cutoffDate);

      if (error) throw error;

      return { success: true, message: `Audit logs older than ${daysToKeep} days deleted` };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error };
    }
  }
}

module.exports = AuditService;
