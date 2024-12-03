const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  updateOrderStatus,
  getOrderTracking
} = require('../controllers/orderTrackingController');

// Protected routes
router.get('/:orderId', protect, getOrderTracking);
router.patch('/:orderId/status', protect, restrictTo('admin'), updateOrderStatus);

module.exports = router; 