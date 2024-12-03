const axios = require('axios');

// M-Pesa credentials
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;

// Generate M-Pesa access token
exports.generateToken = async () => {
  try {
    // Create auth string
    const auth = Buffer.from(
      `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    // Make request to get access token
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error generating M-Pesa token:', error);
    throw new Error('Failed to generate M-Pesa access token');
  }
};

// Format phone number for M-Pesa
exports.formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading +254 if present
  if (cleaned.startsWith('254')) {
    cleaned = cleaned.substring(3);
  }

  // Add country code
  return `254${cleaned}`;
};

// Generate M-Pesa password
exports.generatePassword = (shortcode, passkey, timestamp) => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
};

// Validate M-Pesa callback
exports.validateCallback = (callback) => {
  try {
    const { Body } = callback;
    if (!Body || !Body.stkCallback) {
      return false;
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    } = Body.stkCallback;

    return (
      MerchantRequestID &&
      CheckoutRequestID &&
      ResultCode !== undefined &&
      ResultDesc
    );
  } catch (error) {
    return false;
  }
};

// Extract payment data from callback
exports.extractPaymentData = (callback) => {
  const { CallbackMetadata } = callback.Body.stkCallback;
  if (!CallbackMetadata || !CallbackMetadata.Item) {
    return null;
  }

  const paymentData = {};
  CallbackMetadata.Item.forEach((item) => {
    paymentData[item.Name.toLowerCase()] = item.Value;
  });

  return {
    amount: paymentData.amount,
    mpesaReceiptNumber: paymentData.mpesareceiptnumber,
    transactionDate: paymentData.transactiondate,
    phoneNumber: paymentData.phonenumber,
  };
};

// Format amount for M-Pesa (ensure it's a whole number)
exports.formatAmount = (amount) => {
  return Math.ceil(amount);
};

// Generate unique order reference
exports.generateOrderReference = (orderId) => {
  const timestamp = new Date().getTime().toString().slice(-4);
  return `ORD${orderId.slice(-4)}${timestamp}`;
};

// Handle M-Pesa errors
exports.handleMpesaError = (error) => {
  let message = 'Payment processing failed';

  if (error.response) {
    const { errorCode, errorMessage } = error.response.data;
    switch (errorCode) {
      case '1037':
        message = 'Invalid phone number format';
        break;
      case '1032':
        message = 'Transaction canceled by user';
        break;
      case '1001':
        message = 'Insufficient funds';
        break;
      default:
        message = errorMessage || message;
    }
  }

  return {
    success: false,
    message,
    error: error.response?.data || error.message,
  };
};

// Validate payment amount
exports.validatePaymentAmount = (amount) => {
  const minAmount = 1;
  const maxAmount = 150000; // M-Pesa maximum amount

  amount = Number(amount);
  if (isNaN(amount) || amount < minAmount || amount > maxAmount) {
    throw new Error(
      `Amount must be between ${minAmount} and ${maxAmount} KES`
    );
  }

  return true;
};

// Validate phone number
exports.validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid Kenyan phone number
  const regex = /^(?:254|\+254|0)?([17](0|1|2|4|5|6|7|8|9)\d{7})$/;
  if (!regex.test(cleaned)) {
    throw new Error('Invalid phone number format');
  }

  return true;
}; 