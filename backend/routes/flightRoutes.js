const express = require('express');
const router = express.Router();
const supabase = require('../database/client');
const auditService = require('../services/auditService');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Valid roles: pilot, admin
router.use(authMiddleware);

// POST /flightlog/create
router.post('/create', roleMiddleware(['pilot']), async (req, res) => {
    try {
        const { aircraft_id, flight_date, departure, arrival, flight_hours, remarks } = req.body;
        
        const { data, error } = await supabase.from('flight_logs').insert([{
            aircraft_id,
            pilot_id: req.user.id,
            flight_date,
            departure,
            arrival,
            flight_hours,
            remarks
        }]).select();

        if (error) return res.status(400).json({ error: error.message });

        await auditService.logAction(req.user.id, 'CREATE_FLIGHT_LOG', 'flight_logs', data[0].id);

        res.json({ message: 'Flight log created', log: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /flightlog/list
router.get('/list', async (req, res) => {
    try {
        const { data, error } = await supabase.from('flight_logs').select('*');
        if (error) return res.status(400).json({ error: error.message });
        res.json({ flight_logs: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
