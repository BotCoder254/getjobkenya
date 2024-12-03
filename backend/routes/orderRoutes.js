const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  getOrderStats,
  updateOrderStatus,
  getOrderTracking,
  generateInvoice,
  sendOrderConfirmation,
  cancelOrder,
  getOrderStock,
} = require('../controllers/orderController');

// Public routes
router.get('/stats', getOrderStats);

// Protected routes
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.get('/:id/tracking', getOrderTracking);
router.get('/:id/invoice', generateInvoice);
router.post('/:id/confirmation', sendOrderConfirmation);
router.post('/:id/cancel', cancelOrder);
router.post('/stock', getOrderStock);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', getOrders);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router; 