const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware); // Disabled for demo purposes

// GET /api/dashboard
router.get('/', async (req, res) => {
    try {
        // This is a mocked representation based on real calculations 
        // that would aggregate from flight_logs, maintenance_tasks, components.json, etc.
        const dashboardData = {
            aircraft_health: 92,
            alerts: 2,
            maintenance_due: ["Hydraulic Pump Green", "Brake System", "Combustion Chamber"],
            next_check: "A-Check (120 FH remaining)",
            systems_status: {
                "Engine": 95,
                "Hydraulic System": 89,
                "Landing Gear": 97
            }
        };

        res.json(dashboardData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
