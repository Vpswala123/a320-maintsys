const express = require('express');
const router = express.Router();
const supabase = require('../database/client');
const auditService = require('../services/auditService');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// POST /approval/approve
router.post('/approve', roleMiddleware(['inspector']), async (req, res) => {
    try {
        const { task_id, approval_status } = req.body; // 'approved' or 'rejected'
        
        const { data, error } = await supabase.from('approvals').insert([{
            task_id,
            approved_by: req.user.id,
            approval_status
        }]).select();

        if (error) return res.status(400).json({ error: error.message });

        // Update task status based on approval
        const finalStatus = approval_status === 'approved' ? 'closed' : 'rework_required';
        const { error: taskError } = await supabase.from('maintenance_tasks')
            .update({ status: finalStatus })
            .eq('id', task_id);

        if (taskError) return res.status(400).json({ error: taskError.message });

        await auditService.logAction(req.user.id, 'APPROVE_TASK', 'approvals', data[0].id);
        await auditService.logAction(req.user.id, `TASK_STATUS_CHANGED_${finalStatus.toUpperCase()}`, 'maintenance_tasks', task_id);

        res.json({ message: 'Task approval submitted', approval: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
