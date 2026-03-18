/**
 * A320 Maintenance System - Session Management
 * Handles user sessions, JWT tokens, and Supabase authentication state
 */

class SessionManager {
  constructor() {
    this.tokenRefreshInterval = null;
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    this.lastActivityTime = Date.now();
    this.supabase = null;
  }

  /**
   * Initialize session manager with Supabase client
   * @param {Object} supabaseClient - Supabase client instance
   */
  initialize(supabaseClient) {
    this.supabase = supabaseClient;
    this.setupActivityListeners();
    this.startSessionTimeout();
  }

  /**
   * Setup listeners for user activity
   */
  setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.updateActivityTime(), true);
    });
  }

  /**
   * Update last activity time
   */
  updateActivityTime() {
    this.lastActivityTime = Date.now();
  }

  /**
   * Start session timeout check
   */
  startSessionTimeout() {
    this.tokenRefreshInterval = setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivityTime;
      if (inactiveTime > this.SESSION_TIMEOUT) {
        this.sessionTimeout();
      }
    }, 60000); // Check every minute
  }

  /**
   * Handle session timeout
   */
  sessionTimeout() {
    console.warn('Session timeout - user inactive for 30 minutes');
    this.clearSession();
    window.location.href = '/web/auth/login.html?timeout=true';
  }

  /**
   * Store authentication token
   * @param {string} token - JWT token
   * @param {Object} user - User object
   * @param {string} role - User role
   */
  setToken(token, user = null, role = null) {
    if (token) {
      sessionStorage.setItem('auth_token', token);
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
    
    if (user) {
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_email', user.email);
    }
    
    if (role) {
      localStorage.setItem('user_role', role);
    }
  }

  /**
   * Get stored authentication token
   * @returns {string|null} JWT token or null
   */
  getToken() {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }

  /**
   * Get user information from session
   * @returns {Object|null} User object or null
   */
  getUser() {
    const userId = localStorage.getItem('user_id');
    const email = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role');

    if (!userId || !role) {
      return null;
    }

    return {
      id: userId,
      email: email,
      role: role,
      lastActivity: this.lastActivityTime
    };
  }

  /**
   * Get remaining session time in milliseconds
   * @returns {number} milliseconds remaining
   */
  getRemainingSessionTime() {
    const inactiveTime = Date.now() - this.lastActivityTime;
    return Math.max(0, this.SESSION_TIMEOUT - inactiveTime);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} true if user session exists
   */
  isAuthenticated() {
    return this.getUser() !== null;
  }

  /**
   * Store Supabase credentials for the session
   * @param {string} url - Supabase URL
   * @param {string} key - Supabase anon key
   */
  setSupabaseCredentials(url, key) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
  }

  /**
   * Get stored Supabase credentials
   * @returns {Object} Object with url and key
   */
  getSupabaseCredentials() {
    return {
      url: localStorage.getItem('supabase_url'),
      key: localStorage.getItem('supabase_key')
    };
  }

  /**
   * Store user preferences
   * @param {Object} preferences - User preferences object
   */
  setPreferences(preferences) {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }

  /**
   * Get user preferences
   * @returns {Object} User preferences
   */
  getPreferences() {
    const prefs = localStorage.getItem('user_preferences');
    return prefs ? JSON.parse(prefs) : {};
  }

  /**
   * Store recent activity/history
   * @param {string} activity - Activity description
   * @param {Object} data - Activity data
   */
  addToHistory(activity, data) {
    let history = this.getHistory();
    
    history.unshift({
      activity: activity,
      data: data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 items
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    localStorage.setItem('activity_history', JSON.stringify(history));
  }

  /**
   * Get activity history
   * @returns {Array} Activity history
   */
  getHistory() {
    const history = localStorage.getItem('activity_history');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Check if token is about to expire
   * @param {number} thresholdMinutes - Minutes before expiry to trigger warning (default: 5)
   * @returns {boolean} true if token expires soon
   */
  isTokenExpiringSoon(thresholdMinutes = 5) {
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    if (!tokenTimestamp) return false;

    const tokenAge = (Date.now() - parseInt(tokenTimestamp)) / 1000 / 60; // in minutes
    const tokenExpiry = 60; // Typically 1 hour
    
    return (tokenExpiry - tokenAge) < thresholdMinutes;
  }

  /**
   * Refresh user session
   */
  async refreshSession() {
    try {
      if (!this.supabase) {
        console.warn('Supabase not initialized');
        return false;
      }

      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }

      if (data?.session?.access_token) {
        this.setToken(data.session.access_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  /**
   * Clear all session data
   */
  clearSession() {
    // Clear session data
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('otp_email');
    
    // Preserve settings but clear user-specific data
    // you might want to keep supabase credentials for login screen
    
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
  }

  /**
   * Logout user and clear session
   */
  async logout() {
    try {
      if (this.supabase) {
        await this.supabase.auth.signOut();
      }
    } catch (error) {
      console.warn('Supabase logout error (this is OK):', error.message);
    } finally {
      this.clearSession();
      window.location.href = '/web/auth/login.html';
    }
  }

  /**
   * Get session summary for debugging
   * @returns {Object} Session information
   */
  getSummary() {
    const user = this.getUser();
    return {
      authenticated: this.isAuthenticated(),
      user: user,
      tokenExpiringSoon: this.isTokenExpiringSoon(),
      remainingTime: this.getRemainingSessionTime(),
      lastActivity: new Date(this.lastActivityTime).toLocaleTimeString(),
      preferences: this.getPreferences()
    };
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Auto-initialize security warnings
window.addEventListener('load', () => {
  if (sessionManager.isAuthenticated()) {
    // Check for token expiry and refresh if needed
    setInterval(async () => {
      if (sessionManager.isTokenExpiringSoon()) {
        const refreshed = await sessionManager.refreshSession();
        if (!refreshed && sessionManager.isAuthenticated()) {
          console.warn('Token refresh failed - user should re-authenticate');
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = sessionManager;
}

