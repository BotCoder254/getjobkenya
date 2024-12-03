const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  getProfile,
  updatePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/userController');

// Protected routes
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/password', updatePassword);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router; 