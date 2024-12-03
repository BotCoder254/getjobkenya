const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send order confirmation email
 * @param {Object} order - Order details
 * @param {Object} user - User details
 */
exports.sendOrderConfirmation = async (order, user) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Order Confirmation #${order._id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Dear ${user.name},</p>
      <p>Your order has been confirmed and is being processed.</p>
      
      <h2>Order Details:</h2>
      <p>Order ID: ${order._id}</p>
      <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
      
      <h3>Items:</h3>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
        `).join('')}
      </ul>
      
      <p>Subtotal: $${order.totalAmount - order.shippingPrice - order.taxPrice}</p>
      <p>Shipping: $${order.shippingPrice}</p>
      <p>Tax: $${order.taxPrice}</p>
      <p><strong>Total: $${order.totalAmount}</strong></p>
      
      <h3>Shipping Address:</h3>
      <p>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}
      </p>
      
      <p>We'll send you another email when your order ships.</p>
      
      <p>Best regards,<br>${process.env.COMPANY_NAME}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send order shipped email
 * @param {Object} order - Order details
 * @param {Object} user - User details
 */
exports.sendOrderShipped = async (order, user) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Your Order #${order._id} Has Shipped`,
    html: `
      <h1>Your Order Has Shipped!</h1>
      <p>Dear ${user.name},</p>
      <p>Your order is on its way!</p>
      
      <h2>Tracking Information:</h2>
      <p>Tracking Number: ${order.trackingNumber}</p>
      <p>Carrier: ${order.shippingCarrier || 'Standard Shipping'}</p>
      
      <h2>Order Details:</h2>
      <p>Order ID: ${order._id}</p>
      <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
      
      <h3>Shipping Address:</h3>
      <p>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}
      </p>
      
      <p>Thank you for shopping with us!</p>
      
      <p>Best regards,<br>${process.env.COMPANY_NAME}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send order delivered email
 * @param {Object} order - Order details
 * @param {Object} user - User details
 */
exports.sendOrderDelivered = async (order, user) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Your Order #${order._id} Has Been Delivered`,
    html: `
      <h1>Your Order Has Been Delivered!</h1>
      <p>Dear ${user.name},</p>
      <p>Your order has been delivered successfully.</p>
      
      <h2>Order Details:</h2>
      <p>Order ID: ${order._id}</p>
      <p>Delivery Date: ${new Date().toLocaleDateString()}</p>
      
      <p>We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>${process.env.COMPANY_NAME}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send order cancelled email
 * @param {Object} order - Order details
 * @param {Object} user - User details
 */
exports.sendOrderCancelled = async (order, user) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Order #${order._id} Cancelled`,
    html: `
      <h1>Order Cancellation Confirmation</h1>
      <p>Dear ${user.name},</p>
      <p>Your order has been cancelled as requested.</p>
      
      <h2>Order Details:</h2>
      <p>Order ID: ${order._id}</p>
      <p>Cancellation Date: ${new Date().toLocaleDateString()}</p>
      
      <p>If you did not request this cancellation, please contact us immediately.</p>
      
      <p>Best regards,<br>${process.env.COMPANY_NAME}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}; 