const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  validateShippingAddress,
  validatePaymentDetails,
  calculateShipping,
  processPayment,
  tokenizePaymentMethod,
  getPaymentMethods,
} = require('../controllers/checkoutController');

// Protected routes
router.use(protect);

// Validation endpoints
router.post('/validate', validateShippingAddress);
router.post('/validate/payment', validatePaymentDetails);

// Shipping calculation
router.post('/shipping', calculateShipping);

// Payment processing
router.get('/payment/methods', getPaymentMethods);
router.post('/payment/tokenize', tokenizePaymentMethod);
router.post('/payment/process', processPayment);

module.exports = router; 