/**
 * A320 Maintenance System - Authentication Middleware
 * Verifies JWT tokens and attaches user information to requests
 */

const supabase = require('../database/client');

/**
 * Authentication middleware - validates JWT tokens
 * Attaches authenticated user to req.user
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Missing or malformed Authorization header',
                code: 'UNAUTHORIZED'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.warn('Token verification failed:', error?.message);
            return res.status(401).json({ 
                error: 'Invalid or expired token',
                code: 'UNAUTHORIZED',
                details: error?.message 
            });
        }

        // Fetch user profile with role information
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.warn('Profile lookup failed for user:', user.id);
            return res.status(401).json({ 
                error: 'User profile not found',
                code: 'PROFILE_NOT_FOUND'
            });
        }

        // Attach user and profile to request
        req.user = {
            id: user.id,
            email: user.email,
            ...profile
        };

        // Extract IP address for audit logging
        req.userIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;

        // Attach user agent for audit logging
        req.userAgent = req.headers['user-agent'];

        next();
    } catch (err) {
        console.error('Authentication middleware error:', err);
        return res.status(500).json({ 
            error: 'Authentication error',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for public endpoints that support authenticated access
 */
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (!error && user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    req.user = {
                        id: user.id,
                        email: user.email,
                        ...profile
                    };
                }
            }
        }
        
        next();
    } catch (err) {
        // Don't fail on error, just continue without user
        next();
    }
};

/**
 * Verify token validity without extracting user
 */
const verifyTokenOnly = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.userId = user.id;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Token verification error' });
    }
};

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
    verifyTokenOnly
};

