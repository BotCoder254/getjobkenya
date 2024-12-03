const { notifyUser, broadcastToAdmin } = require('./websocket');
const { sendOrderConfirmation } = require('./emailService');

/**
 * Send order status notification
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @param {string} status - New order status
 */
exports.sendOrderStatusNotification = async (order, user, status) => {
  try {
    // Send real-time notification
    notifyUser(user._id, {
      type: 'ORDER_STATUS',
      orderId: order._id,
      status,
      message: `Your order #${order._id} status has been updated to ${status}`,
    });

    // Send email notification based on status
    switch (status) {
      case 'confirmed':
        await sendOrderConfirmation(order, user);
        break;
      // Add other status cases as needed
    }
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
};

/**
 * Send stock alert notification
 * @param {Object} product - Product details
 * @param {number} quantity - Current stock quantity
 */
exports.sendStockAlert = async (product, quantity) => {
  try {
    // Send alert to admin
    broadcastToAdmin({
      type: 'STOCK_ALERT',
      productId: product._id,
      productName: product.name,
      quantity,
      message: `Low stock alert: ${product.name} (${quantity} remaining)`,
    });
  } catch (error) {
    console.error('Error sending stock alert:', error);
  }
};

/**
 * Send price change notification
 * @param {Object} product - Product details
 * @param {number} oldPrice - Previous price
 * @param {number} newPrice - Updated price
 */
exports.sendPriceChangeNotification = async (product, oldPrice, newPrice) => {
  try {
    // Notify admin about price change
    broadcastToAdmin({
      type: 'PRICE_CHANGE',
      productId: product._id,
      productName: product.name,
      oldPrice,
      newPrice,
      message: `Price updated for ${product.name}: $${oldPrice} → $${newPrice}`,
    });
  } catch (error) {
    console.error('Error sending price change notification:', error);
  }
};

/**
 * Send payment notification
 * @param {Object} order - Order details
 * @param {Object} payment - Payment details
 */
exports.sendPaymentNotification = async (order, payment) => {
  try {
    // Notify user about payment status
    notifyUser(order.user, {
      type: 'PAYMENT_STATUS',
      orderId: order._id,
      status: payment.status,
      message: `Payment ${payment.status} for order #${order._id}`,
    });

    // Notify admin about payment
    broadcastToAdmin({
      type: 'PAYMENT_RECEIVED',
      orderId: order._id,
      amount: payment.amount,
      status: payment.status,
      message: `Payment received for order #${order._id}: $${payment.amount}`,
    });
  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
};

/**
 * Send delivery notification
 * @param {Object} order - Order details
 * @param {Object} tracking - Tracking details
 */
exports.sendDeliveryNotification = async (order, tracking) => {
  try {
    // Notify user about delivery update
    notifyUser(order.user, {
      type: 'DELIVERY_UPDATE',
      orderId: order._id,
      status: tracking.status,
      location: tracking.currentLocation,
      message: `Your order #${order._id} is ${tracking.status} at ${tracking.currentLocation}`,
    });
  } catch (error) {
    console.error('Error sending delivery notification:', error);
  }
};

/**
 * Send system notification
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {Object} data - Additional data
 */
exports.sendSystemNotification = async (type, message, data = {}) => {
  try {
    // Broadcast system notification to admin
    broadcastToAdmin({
      type: 'SYSTEM_NOTIFICATION',
      notificationType: type,
      message,
      data,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error sending system notification:', error);
  }
}; 