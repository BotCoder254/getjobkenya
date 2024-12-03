const axios = require('axios');
const Order = require('../models/orderModel');
const { generateToken } = require('../utils/mpesaUtils');

// M-Pesa credentials
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

// Initialize M-Pesa payment
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get M-Pesa access token
    const token = await generateToken();

    // Format phone number (remove leading 0 or +254)
    const formattedPhone = phoneNumber.replace(/^(0|\+254)/, '254');

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Prepare STK Push request
    const stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const stkPushData = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${MPESA_CALLBACK_URL}/api/payments/mpesa-callback`,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: 'Payment for order'
    };

    // Make STK Push request
    const response = await axios.post(stkPushUrl, stkPushData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Update order with payment details
    order.paymentDetails = {
      method: 'mpesa',
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      status: 'pending'
    };
    await order.save();

    res.status(200).json({
      success: true,
      message: 'STK Push sent successfully',
      data: {
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID
      }
    });
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.response?.data || error.message
    });
  }
};

// M-Pesa callback
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Extract relevant data from callback
    const {
      stkCallback: {
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        CallbackMetadata
      }
    } = Body;

    // Find order by checkout request ID
    const order = await Order.findOne({
      'paymentDetails.checkoutRequestId': CheckoutRequestID
    });

    if (!order) {
      console.error('Order not found for checkout request:', CheckoutRequestID);
      return res.status(404).json({ success: false });
    }

    // Update order payment status
    if (ResultCode === 0) {
      // Payment successful
      const paymentData = {};
      CallbackMetadata.Item.forEach(item => {
        paymentData[item.Name] = item.Value;
      });

      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'completed',
        transactionId: paymentData.MpesaReceiptNumber,
        amount: paymentData.Amount,
        phoneNumber: paymentData.PhoneNumber,
        completedAt: new Date()
      };
      order.status = 'processing';
      order.isPaid = true;
      order.paidAt = new Date();

      // Emit socket event for real-time updates
      req.app.get('io').to(`order-${order._id}`).emit('orderUpdated', {
        orderId: order._id,
        status: 'processing',
        paymentStatus: 'completed'
      });
    } else {
      // Payment failed
      order.paymentDetails = {
        ...order.paymentDetails,
        status: 'failed',
        failureReason: ResultDesc
      };

      // Emit socket event for real-time updates
      req.app.get('io').to(`order-${order._id}`).emit('orderUpdated', {
        orderId: order._id,
        status: order.status,
        paymentStatus: 'failed',
        failureReason: ResultDesc
      });
    }

    await order.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ success: false });
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: order.paymentDetails?.status || 'pending',
        failureReason: order.paymentDetails?.failureReason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking payment status'
    });
  }
};

// Query payment status from M-Pesa
exports.queryMpesaPayment = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const token = await generateToken();

    const queryUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(queryUrl, {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error querying payment status',
      error: error.response?.data || error.message
    });
  }
}; 