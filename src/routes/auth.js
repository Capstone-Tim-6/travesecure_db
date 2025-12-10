const express = require('express');
const router = express.Router();
const { signUp, logIn, forgotPassword, verifyOtp, resetPassword } = require('../controllers/auth');

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
