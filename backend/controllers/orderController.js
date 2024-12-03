const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { notifyUser } = require('../utils/websocket');
const asyncHandler = require('../utils/asyncHandler');
const { generatePDF } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');
const { getTrackingInfo } = require('../utils/shippingService');

// Create new order
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
    shippingPrice,
    taxPrice,
  } = req.body;

  // Check stock availability
  const stockCheck = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      return {
        productId: item.productId,
        available: product.stock >= item.quantity,
        currentStock: product.stock,
        requested: item.quantity,
      };
    })
  );

  const insufficientStock = stockCheck.filter((item) => !item.available);
  if (insufficientStock.length > 0) {
    res.status(400);
    throw new Error('Some items have insufficient stock');
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
    shippingPrice,
    taxPrice,
    orderNumber: generateOrderNumber(),
  });

  // Update product stock
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  // Notify admin about new order
  notifyUser('admin', {
    type: 'NEW_ORDER',
    message: 'New order received',
    orderId: order._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// Get all orders (admin)
exports.getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments();

  res.json({
    success: true,
    orders,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

// Get single order
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    order,
  });
});

// Update order
exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  // Notify user about order update
  notifyUser(order.user.toString(), {
    type: 'ORDER_UPDATE',
    message: 'Your order has been updated',
    orderId: order._id,
  });

  res.json({
    success: true,
    order: updatedOrder,
  });
});

// Delete order
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: 'Order deleted successfully',
  });
});

// Get logged in user orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

  res.json({
    success: true,
    orders,
  });
});

// Get order statistics
exports.getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        totalOrders: 1,
        totalAmount: 1,
        avgOrderValue: { $round: ['$avgOrderValue', 2] },
      },
    },
  ]);

  const statusStats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    stats: stats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      avgOrderValue: 0,
    },
    statusStats: statusStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
  });
});

// Update order status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Notify user about status update
  notifyUser(order.user.toString(), {
    type: 'ORDER_STATUS_UPDATE',
    message: `Your order status has been updated to ${status}`,
    orderId: order._id,
    status,
  });

  res.json({
    success: true,
    order,
  });
});

// Get order tracking information
exports.getOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  const tracking = await getTrackingInfo(order.trackingNumber);

  res.json({
    success: true,
    tracking: {
      carrier: tracking.carrier,
      number: tracking.trackingNumber,
      status: tracking.status,
      estimatedDelivery: tracking.estimatedDelivery,
      currentLocation: tracking.currentLocation,
      history: tracking.history,
      trackingUrl: tracking.trackingUrl,
    },
  });
});

// Generate invoice
exports.generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }

  const invoice = await generatePDF({
    type: 'invoice',
    data: {
      order,
      company: {
        name: process.env.COMPANY_NAME,
        address: process.env.COMPANY_ADDRESS,
        phone: process.env.COMPANY_PHONE,
        email: process.env.COMPANY_EMAIL,
        website: process.env.COMPANY_WEBSITE,
      },
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
  res.send(invoice);
});

// Send order confirmation email
exports.sendOrderConfirmation = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const emailContent = {
    to: order.user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    template: 'orderConfirmation',
    context: {
      order,
      trackingUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`,
    },
  };

  await sendEmail(emailContent);

  res.json({
    success: true,
    message: 'Order confirmation email sent',
  });
});

// Cancel order
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order can be cancelled
  if (order.status !== 'pending' && order.status !== 'processing') {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Restore product stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      })
    )
  );

  order.status = 'cancelled';
  order.cancelledAt = Date.now();
  await order.save();

  // Notify user about cancellation
  notifyUser(order.user.toString(), {
    type: 'ORDER_CANCELLED',
    message: 'Your order has been cancelled',
    orderId: order._id,
  });

  res.json({
    success: true,
    order,
  });
});

// Check stock availability for order items
exports.getOrderStock = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const stockStatus = await Promise.all(
    productIds.map(async (id) => {
      const product = await Product.findById(id);
      return {
        [id]: product ? product.stock : 0,
      };
    })
  );

  res.json({
    success: true,
    stockStatus: Object.assign({}, ...stockStatus),
  });
});

// Helper function to generate order number
function generateOrderNumber() {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
} 