const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { handleMpesaError } = require('./mpesaUtils');

/**
 * Process credit card payment
 * @param {Object} paymentDetails - Payment details including card info
 * @param {number} amount - Amount to charge
 * @returns {Promise<Object>} Payment result
 */
exports.processCardPayment = async (paymentDetails, amount) => {
  try {
    const { token, currency = 'USD' } = paymentDetails;

    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      source: token,
      description: `Order payment - ${new Date().toISOString()}`,
    });

    return {
      success: true,
      transactionId: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      status: charge.status,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error(error.message);
  }
};

/**
 * Process PayPal payment
 * @param {Object} paymentDetails - PayPal payment details
 * @param {number} amount - Amount to charge
 * @returns {Promise<Object>} Payment result
 */
exports.processPayPalPayment = async (paymentDetails, amount) => {
  try {
    // In production, this would integrate with PayPal's API
    const mockPayPalResponse = {
      success: true,
      transactionId: `PP${Date.now()}`,
      amount,
      currency: 'USD',
      status: 'completed',
    };

    return mockPayPalResponse;
  } catch (error) {
    console.error('PayPal payment error:', error);
    throw new Error('PayPal payment failed');
  }
};

/**
 * Process M-Pesa payment
 * @param {Object} paymentDetails - M-Pesa payment details
 * @param {number} amount - Amount to charge
 * @returns {Promise<Object>} Payment result
 */
exports.processMpesaPayment = async (paymentDetails, amount) => {
  try {
    const { phoneNumber } = paymentDetails;

    // Basic phone number validation
    if (!phoneNumber.match(/^\+?254\d{9}$/)) {
      throw new Error('Invalid phone number format');
    }

    // In production, this would integrate with M-Pesa's API
    const mockMpesaResponse = {
      success: true,
      transactionId: `MP${Date.now()}`,
      amount,
      currency: 'KES',
      status: 'pending',
      checkoutRequestId: `CRQ${Date.now()}`,
    };

    return mockMpesaResponse;
  } catch (error) {
    return handleMpesaError(error);
  }
};

/**
 * Verify payment status
 * @param {string} transactionId - Payment transaction ID
 * @param {string} method - Payment method
 * @returns {Promise<Object>} Payment status
 */
exports.verifyPayment = async (transactionId, method) => {
  try {
    switch (method) {
      case 'card':
        const charge = await stripe.charges.retrieve(transactionId);
        return {
          success: true,
          status: charge.status,
          amount: charge.amount / 100,
          currency: charge.currency,
        };

      case 'paypal':
        // In production, this would verify with PayPal's API
        return {
          success: true,
          status: 'completed',
        };

      case 'mpesa':
        // In production, this would verify with M-Pesa's API
        return {
          success: true,
          status: 'completed',
        };

      default:
        throw new Error('Unsupported payment method');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    throw new Error('Unable to verify payment status');
  }
};

/**
 * Process refund
 * @param {string} transactionId - Original transaction ID
 * @param {number} amount - Amount to refund
 * @param {string} method - Payment method
 * @returns {Promise<Object>} Refund result
 */
exports.processRefund = async (transactionId, amount, method) => {
  try {
    switch (method) {
      case 'card':
        const refund = await stripe.refunds.create({
          charge: transactionId,
          amount: Math.round(amount * 100),
        });
        return {
          success: true,
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        };

      case 'paypal':
        // In production, this would process refund through PayPal's API
        return {
          success: true,
          refundId: `PPR${Date.now()}`,
          amount,
          status: 'completed',
        };

      case 'mpesa':
        // In production, this would process refund through M-Pesa's API
        return {
          success: true,
          refundId: `MPR${Date.now()}`,
          amount,
          status: 'completed',
        };

      default:
        throw new Error('Unsupported payment method');
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    throw new Error('Unable to process refund');
  }
}; 