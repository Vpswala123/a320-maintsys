/**
 * supabaseClient.js — Supabase Client Initialization (ES Module)
 * Provides a singleton Supabase client for the entire app
 */
import { CONFIG } from './config.js';

let _supabase = null;

/**
 * Get or create the Supabase client instance
 */
export function getSupabase() {
  if (_supabase) return _supabase;
  
  if (typeof window.supabase === 'undefined') {
    console.warn('Supabase JS library not loaded. Running in demo mode.');
    return null;
  }

  try {
    _supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    return _supabase;
  } catch (e) {
    console.warn('Supabase client init failed:', e.message);
    return null;
  }
}

/**
 * Check if we have a valid Supabase connection
 */
export function isSupabaseConfigured() {
  return CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.includes('YOUR_PROJECT');
}

/**
 * Get current authenticated user from Supabase session
 */
export async function getCurrentSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data?.session || null;
}

/**
 * Get user profile from Supabase profiles table
 */
export async function getUserProfile(userId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) { console.warn('Profile fetch error:', error); return null; }
  return data;
}

/**
 * Log an audit trail entry to Supabase
 */
export async function logAudit(action, module, recordId = null, details = null) {
  const sb = getSupabase();
  if (!sb) {
    console.log('AUDIT (demo):', { action, module, recordId, details, timestamp: new Date().toISOString() });
    return;
  }
  try {
    const userId = localStorage.getItem('user_id');
    await sb.from('audit_trail').insert({
      user_id: userId,
      action,
      module,
      record_id: recordId,
      new_values: details ? JSON.stringify(details) : null,
    });
  } catch (e) {
    console.warn('Audit log error:', e);
  }
}
