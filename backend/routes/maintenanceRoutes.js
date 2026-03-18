const express = require('express');
const router = express.Router();
const supabase = require('../database/client');
const auditService = require('../services/auditService');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// POST /maintenance/create (Admin or AME could create)
router.post('/create', roleMiddleware(['ame']), async (req, res) => {
    try {
        const { aircraft_id, component, ata_chapter, description, assigned_to } = req.body;
        
        const { data, error } = await supabase.from('maintenance_tasks').insert([{
            aircraft_id,
            component,
            ata_chapter,
            description,
            assigned_to,
            status: 'open'
        }]).select();

        if (error) return res.status(400).json({ error: error.message });

        await auditService.logAction(req.user.id, 'CREATE_MAINTENANCE_TASK', 'maintenance_tasks', data[0].id);

        res.json({ message: 'Maintenance task created', task: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /maintenance/update
router.post('/update', roleMiddleware(['ame']), async (req, res) => {
    try {
        const { task_id, status, description_update } = req.body;
        
        const { data, error } = await supabase.from('maintenance_tasks')
            .update({ status: status })
            .eq('id', task_id)
            .select();

        if (error) return res.status(400).json({ error: error.message });

        await auditService.logAction(req.user.id, 'UPDATE_MAINTENANCE_TASK', 'maintenance_tasks', data[0].id);

        res.json({ message: 'Maintenance task updated', task: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /maintenance/complete
router.post('/complete', roleMiddleware(['ame']), async (req, res) => {
    try {
        const { task_id, action_taken } = req.body;
        
        const { data: taskData, error: taskError } = await supabase.from('maintenance_tasks')
            .update({ status: 'completed', completed_at: new Date() })
            .eq('id', task_id)
            .select();

        if (taskError) return res.status(400).json({ error: taskError.message });

        const { data: logData, error: logError } = await supabase.from('maintenance_logs').insert([{
            task_id,
            engineer_id: req.user.id,
            action_taken
        }]).select();

        if (logError) return res.status(400).json({ error: logError.message });

        await auditService.logAction(req.user.id, 'COMPLETE_MAINTENANCE_TASK', 'maintenance_tasks', task_id);

        res.json({ message: 'Task completed', task: taskData[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
