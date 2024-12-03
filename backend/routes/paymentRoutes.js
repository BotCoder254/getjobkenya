const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  initiateMpesaPayment,
  mpesaCallback,
  checkPaymentStatus,
  queryMpesaPayment,
} = require('../controllers/paymentController');

// Protected routes
router.post('/mpesa/initiate', protect, initiateMpesaPayment);
router.get('/status/:orderId', protect, checkPaymentStatus);
router.get('/mpesa/query/:checkoutRequestId', protect, queryMpesaPayment);

// Public routes (for M-Pesa callbacks)
router.post('/mpesa-callback', mpesaCallback);

module.exports = router; 