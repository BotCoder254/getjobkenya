const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const moment = require('moment');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ status: 'completed' });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Get recent activities
    const recentActivities = await Promise.all([
      Order.find().sort('-createdAt').limit(5),
      User.find().sort('-createdAt').limit(5),
      Product.find().sort('-createdAt').limit(5)
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentActivities: {
          orders: recentActivities[0],
          users: recentActivities[1],
          products: recentActivities[2]
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          totalSold: { $size: '$orders' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get revenue statistics
exports.getRevenueStats = async (req, res) => {
  try {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      return { date, revenue: 0 };
    }).reverse();

    const orders = await Order.find({
      createdAt: { $gte: moment().subtract(30, 'days').toDate() },
      status: 'completed'
    });

    orders.forEach(order => {
      const date = moment(order.createdAt).format('YYYY-MM-DD');
      const dayStats = last30Days.find(day => day.date === date);
      if (dayStats) {
        dayStats.revenue += order.totalAmount;
      }
    });

    res.status(200).json({
      success: true,
      revenueData: last30Days
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      success: true,
      userStats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Notify connected clients about role update
    req.app.get('io').emit('userRoleUpdated', { userId: user._id, newRole: role });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    // Notify connected clients about user deletion
    req.app.get('io').emit('userDeleted', { userId: user._id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get admin notifications
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Promise.all([
      // Low stock notifications
      Product.find({ stock: { $lt: 10 } }).select('name stock'),
      // Recent orders
      Order.find({ status: 'pending' })
        .populate('user', 'name')
        .sort('-createdAt')
        .limit(5),
      // New user registrations
      User.find()
        .sort('-createdAt')
        .limit(5)
        .select('name email createdAt')
    ]);

    res.status(200).json({
      success: true,
      notifications: {
        lowStock: notifications[0],
        pendingOrders: notifications[1],
        newUsers: notifications[2]
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 