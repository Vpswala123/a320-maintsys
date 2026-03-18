import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

/**
 * Auth system uses Employee ID + Password.
 * Internally, Supabase auth maps employee IDs to synthetic emails:
 *   {employee_id}@a320sys.local
 * Users never see or enter these emails.
 * Only Admin can create new accounts.
 */

const toInternalEmail = (employeeId) => `${employeeId.toLowerCase().trim()}@a320sys.local`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  };

  /**
   * Sign in with Employee ID and Password.
   * The employee ID is mapped to an internal email for Supabase auth.
   */
  const signIn = async (employeeId, password) => {
    const email = toInternalEmail(employeeId);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid Employee ID or Password');
      }
      throw error;
    }
    // Check if user is active
    const { data: prof } = await supabase.from('profiles').select('is_active').eq('id', data.user.id).single();
    if (prof && prof.is_active === false) {
      await supabase.auth.signOut();
      throw new Error('Account is deactivated. Contact your administrator.');
    }
    return data;
  };

  /**
   * Admin creates a new user account.
   * Uses Supabase signUp with a synthetic email.
   * The admin must be logged in and have the 'admin' role.
   */
  const createUser = async (employeeId, password, name, role, licenseNumber) => {
    if (profile?.role !== 'admin') throw new Error('Only admins can create accounts');

    // Use edge function which uses admin API to auto-confirm users
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: { employee_id: employeeId, password, name, role, license_number: licenseNumber },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data;
  };

  /**
   * Admin resets a user's password.
   * This requires the admin to use the edge function.
   */
  const resetUserPassword = async (employeeId, newPassword) => {
    if (profile?.role !== 'admin') throw new Error('Only admins can reset passwords');
    const { data, error } = await supabase.functions.invoke('admin-reset-password', {
      body: { employee_id: employeeId, new_password: newPassword },
    });
    if (error) throw error;
    return data;
  };

  /**
   * List all users (admin only).
   */
  const listUsers = async () => {
    if (profile?.role !== 'admin') throw new Error('Only admins can list users');
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  /**
   * Toggle user active status (admin only).
   */
  const toggleUserActive = async (userId, isActive) => {
    if (profile?.role !== 'admin') throw new Error('Only admins can manage users');
    const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId);
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const hasPermission = (permission) => {
    if (!profile) return false;
    const permissions = {
      admin: ['manage_fleet', 'add_aircraft', 'send_notifications', 'approve_maintenance', 'view_all_logs', 'manage_users', 'create_pilot_logbook_entry', 'view_manuals', 'view_dashboard'],
      pilot: ['create_pilot_logbook_entry', 'view_pilot_logbook', 'report_defect', 'view_manuals', 'view_dashboard'],
      ame: ['create_maintenance_log', 'create_maintenance_session', 'update_checks', 'view_all_logs', 'view_manuals', 'view_dashboard'],
    };
    return permissions[profile.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signIn, signOut,
      createUser, resetUserPassword, listUsers, toggleUserActive,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
