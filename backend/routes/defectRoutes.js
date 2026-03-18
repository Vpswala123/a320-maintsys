const express = require('express');
const router = express.Router();
const supabase = require('../database/client');
const auditService = require('../services/auditService');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// POST /defect/report
router.post('/report', roleMiddleware(['pilot', 'ame', 'inspector']), async (req, res) => {
    try {
        const { aircraft_id, ata, description, severity } = req.body;

        const { data, error } = await supabase.from('defect_logs').insert([{
            aircraft_id,
            reported_by: req.user.id,
            ata,
            description,
            severity,
            status: 'open'
        }]).select();

        if (error) return res.status(400).json({ error: error.message });

        await auditService.logAction(req.user.id, 'REPORT_DEFECT', 'defect_logs', data[0].id);

        res.json({ message: 'Defect reported', defect: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /defect/list
router.get('/list', async (req, res) => {
    try {
        const { data, error } = await supabase.from('defect_logs').select('*');
        if (error) return res.status(400).json({ error: error.message });
        res.json({ defect_logs: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
