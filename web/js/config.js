/**
 * config.js — Application Configuration
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your Supabase project values
 */
export const CONFIG = {
  SUPABASE_URL: localStorage.getItem('supabase_url') || 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: localStorage.getItem('supabase_key') || 'YOUR_ANON_KEY',
  APP_NAME: 'A320 Virtual Maintenance System',
  VERSION: '1.0.0',
  DEMO_MODE: true, // Set false when Supabase is configured
};
