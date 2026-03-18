const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../auth/roles');

router.post('/approve/:taskId', authMiddleware, roleMiddleware([ROLES.INSPECTOR, ROLES.ADMIN]), async (req, res) => {
    // Approve task logic
});

module.exports = router;
