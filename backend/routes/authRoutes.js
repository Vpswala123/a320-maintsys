const express = require('express');
const router = express.Router();
const supabase = require('../database/client');
const auditService = require('../services/auditService');

// POST /auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        
        // Use Supabase Admin to create user or just standard signup depending on configuration.
        // Assuming public signup is allowed:
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) return res.status(400).json({ error: error.message });

        // Insert into profiles
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            role
        });

        if (profileError) return res.status(400).json({ error: profileError.message });

        await auditService.logAction(data.user.id, 'SIGNUP', 'profiles', data.user.id);

        res.json({ message: 'Signup successful', user: data.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return res.status(401).json({ error: error.message });

        await auditService.logAction(data.user.id, 'LOGIN', 'auth', data.user.id);
        
        res.json({ session: data.session });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
