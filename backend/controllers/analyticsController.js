const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const moment = require('moment');

const getDateRange = (range) => {
  const now = moment();
  switch (range) {
    case 'week':
      return moment().subtract(7, 'days');
    case 'month':
      return moment().subtract(30, 'days');
    case 'year':
      return moment().subtract(1, 'year');
    default:
      return moment().subtract(7, 'days');
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    const startDate = getDateRange(range);
    const now = moment();

    // Get current period data
    const [orders, users, products] = await Promise.all([
      Order.find({
        createdAt: { $gte: startDate.toDate() },
      }),
      User.find({
        createdAt: { $gte: startDate.toDate() },
      }),
      Product.find().populate('category'),
    ]);

    // Get previous period data for comparison
    const prevStartDate = moment(startDate).subtract(
      range === 'week' ? 7 : range === 'month' ? 30 : 365,
      'days'
    );
    const prevOrders = await Order.find({
      createdAt: {
        $gte: prevStartDate.toDate(),
        $lt: startDate.toDate(),
      },
    });

    // Calculate revenue
    const revenue = {
      total: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      growth: calculateGrowth(
        orders.reduce((sum, order) => sum + order.totalAmount, 0),
        prevOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      ),
    };

    // Calculate order stats
    const orderStats = {
      total: orders.length,
      growth: calculateGrowth(orders.length, prevOrders.length),
    };

    // Calculate user stats
    const prevUsers = await User.find({
      createdAt: {
        $gte: prevStartDate.toDate(),
        $lt: startDate.toDate(),
      },
    });
    const userStats = {
      total: users.length,
      growth: calculateGrowth(users.length, prevUsers.length),
    };

    // Calculate product stats
    const productsSold = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const prevProductsSold = prevOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const productStats = {
      total: productsSold,
      growth: calculateGrowth(productsSold, prevProductsSold),
    };

    // Generate chart data
    const revenueChart = generateTimeSeriesData(orders, range);
    const categoryChart = generateCategoryData(orders);
    const orderStatusChart = generateOrderStatusData(orders);
    const productPerformanceChart = generateProductPerformanceData(
      orders,
      prevOrders
    );

    res.status(200).json({
      success: true,
      revenue,
      orders: orderStats,
      users: userStats,
      products: productStats,
      revenueChart,
      categoryChart,
      orderStatusChart,
      productPerformanceChart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const calculateGrowth = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

const generateTimeSeriesData = (orders, range) => {
  const format =
    range === 'week'
      ? 'ddd'
      : range === 'month'
      ? 'MMM D'
      : 'MMM';

  const groupedData = orders.reduce((acc, order) => {
    const date = moment(order.createdAt).format(format);
    acc[date] = (acc[date] || 0) + order.totalAmount;
    return acc;
  }, {});

  return {
    labels: Object.keys(groupedData),
    data: Object.values(groupedData),
  };
};

const generateCategoryData = (orders) => {
  const categoryData = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const categoryName = item.product.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + item.quantity;
    });
    return acc;
  }, {});

  return {
    labels: Object.keys(categoryData),
    data: Object.values(categoryData),
  };
};

const generateOrderStatusData = (orders) => {
  const statusData = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(statusData),
    data: Object.values(statusData),
  };
};

const generateProductPerformanceData = (currentOrders, previousOrders) => {
  const metrics = ['sales', 'revenue', 'avgOrderValue', 'returnRate', 'rating'];
  
  const currentMetrics = calculateProductMetrics(currentOrders);
  const previousMetrics = calculateProductMetrics(previousOrders);

  return {
    labels: metrics,
    current: metrics.map((metric) => currentMetrics[metric]),
    previous: metrics.map((metric) => previousMetrics[metric]),
  };
};

const calculateProductMetrics = (orders) => {
  const totalSales = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    sales: totalSales,
    revenue: totalRevenue,
    avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
    returnRate: calculateReturnRate(orders),
    rating: calculateAverageRating(orders),
  };
};

const calculateReturnRate = (orders) => {
  const returnedOrders = orders.filter((order) => order.status === 'returned');
  return orders.length ? (returnedOrders.length / orders.length) * 100 : 0;
};

const calculateAverageRating = (orders) => {
  const ratings = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (item.rating) acc.push(item.rating);
    });
    return acc;
  }, []);

  return ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;
};

module.exports = exports; 