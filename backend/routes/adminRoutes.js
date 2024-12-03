const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
  getRevenueStats,
  getUserStats,
  updateUserRole,
  getAllUsers,
  deleteUser,
  getAdminNotifications
} = require('../controllers/adminController');

// All routes are protected and restricted to admin
router.use(protect, restrictTo('admin'));

// Dashboard statistics
router.get('/stats', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/top-products', getTopProducts);
router.get('/revenue-stats', getRevenueStats);
router.get('/user-stats', getUserStats);
router.get('/notifications', getAdminNotifications);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router; 