const supabase = require('../database/client');

class AuditService {
    /**
     * Logs an action to the audit_trail table
     * @param {string} userId - UUID of the user performing the action
     * @param {string} action - Description of the action (e.g., 'CREATE_FLIGHT_LOG')
     * @param {string} module - The module or table representing the action scope
     * @param {string} recordId - UUID of the record being created/updated
     * @param {Object} details - Additional event context/payloads
     */
    async logAction(userId, action, module, recordId, details = {}) {
        if (!userId) {
            console.warn('AuditLog explicitly bypassed or missing userId');
            return;
        }

        const { error } = await supabase.from('audit_trail').insert({
            user_id: userId,
            action: action,
            module: module,
            record_id: recordId,
            details: details
        });

        if (error) {
            console.error('Failed to write audit log:', error);
        }
    }
}

module.exports = new AuditService();
