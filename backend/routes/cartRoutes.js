const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import cart controller (we'll create this next)
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Cart routes
router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update', protect, updateCartItem);
router.delete('/remove', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router; 