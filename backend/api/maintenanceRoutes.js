const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../auth/roles');

router.get('/tasks', authMiddleware, async (req, res) => {
    // Return all tasks
});

router.post('/tasks', authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.AME]), async (req, res) => {
    // Create new maintenance task
});

module.exports = router;
