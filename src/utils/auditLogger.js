import { supabase } from '@/lib/supabase';

/**
 * Logs an action to the audit_logs table for compliance and tracking.
 * @param {string} action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} table_name - The table affected
 * @param {string|number} record_id - The ID of the affected record
 * @param {object} details - Additional JSON details about the action
 */
export async function logAudit(action, table_name, record_id, details = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.warn('Audit log skipped: No active session');
      return;
    }
    
    const { error } = await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action,
      table_name,
      record_id,
      details
    });

    if (error) throw error;
  } catch (err) {
    console.error(`Audit log failed: [${action}] on [${table_name}]`, err);
  }
}
