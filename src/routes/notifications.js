const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/notifications');
const authMiddleware = require('../middleware/auth');

router.post('/subscribe', authMiddleware, subscribe);

module.exports = router;
