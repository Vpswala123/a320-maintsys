const express = require('express');
const router = express.Router();
const login = require('../auth/login');
const signup = require('../auth/signup');
const verifyOtp = require('../auth/otp');

router.post('/login', login);
router.post('/signup', signup);
router.post('/otp', verifyOtp);

module.exports = router;
