const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Profile routes
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);

module.exports = router; 