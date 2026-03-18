const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/flight-logs', authMiddleware, async (req, res) => {
    // Handle flight log creation
});

router.post('/defect-logs', authMiddleware, async (req, res) => {
    // Handle defect report
});

module.exports = router;
