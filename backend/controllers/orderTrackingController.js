const Order = require('../models/orderModel');
const { notifyUser } = require('../utils/websocket');
const asyncHandler = require('express-async-handler');

// Update order status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Send real-time notification to user
  notifyUser(order.user.toString(), {
    type: 'ORDER_UPDATE',
    orderId: order._id,
    status,
    message: `Your order status has been updated to ${status}`
  });

  res.json({
    success: true,
    order
  });
});

// Get order tracking details
exports.getOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .select('status trackingNumber createdAt isPaid paidAt isDelivered deliveredAt')
    .populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if the user is authorized to view this order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    tracking: {
      orderId: order._id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      timeline: [
        {
          status: 'ordered',
          date: order.createdAt,
          completed: true
        },
        {
          status: 'payment',
          date: order.paidAt,
          completed: order.isPaid
        },
        {
          status: 'processing',
          date: order.status === 'processing' ? Date.now() : null,
          completed: ['processing', 'shipped', 'delivered'].includes(order.status)
        },
        {
          status: 'shipped',
          date: order.status === 'shipped' ? Date.now() : null,
          completed: ['shipped', 'delivered'].includes(order.status)
        },
        {
          status: 'delivered',
          date: order.deliveredAt,
          completed: order.isDelivered
        }
      ]
    }
  });
}); 