const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/orderModel');
const { validateAddress } = require('../utils/addressValidator');
const { validateCard } = require('../utils/paymentValidator');
const { calculateTax } = require('../utils/taxCalculator');
const { tokenize, processCardPayment, processMpesaPayment } = require('../utils/paymentProcessor');

// Validate shipping address
exports.validateShippingAddress = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  if (type === 'address') {
    const validationResult = await validateAddress(data);
    
    if (validationResult.suggestions) {
      res.json({
        valid: false,
        suggestions: validationResult.suggestions,
      });
    } else {
      res.json({
        valid: true,
        data: validationResult.standardizedAddress,
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid validation type',
    });
  }
});

// Validate payment details
exports.validatePaymentDetails = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  if (type === 'card') {
    const validationResult = await validateCard(data);
    res.json({
      valid: validationResult.valid,
      message: validationResult.message,
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid validation type',
    });
  }
});

// Calculate shipping rates and tax
exports.calculateShipping = asyncHandler(async (req, res) => {
  const { items, address, subtotal } = req.body;

  // Calculate total weight and dimensions
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
  
  // Get available shipping rates
  const shippingRates = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      cost: subtotal >= 100 ? 0 : 10,
      description: '5-7 business days',
      estimatedDays: { min: 5, max: 7 },
    },
    {
      id: 'express',
      name: 'Express Shipping',
      cost: 20,
      description: '2-3 business days',
      estimatedDays: { min: 2, max: 3 },
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      cost: 35,
      description: 'Next business day',
      estimatedDays: { min: 1, max: 1 },
    },
  ];

  // Calculate tax rate based on shipping address
  const taxRate = await calculateTax(address);

  res.json({
    success: true,
    shippingRates,
    taxRate,
    estimatedDelivery: {
      minDays: 1,
      maxDays: 7,
    },
  });
});

// Get available payment methods
exports.getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      supported: ['visa', 'mastercard', 'amex', 'discover'],
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay with M-Pesa mobile money',
      supported: ['safaricom'],
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer',
      supported: ['eft', 'rtgs'],
    },
  ];

  res.json({
    success: true,
    methods,
  });
});

// Tokenize payment method
exports.tokenizePaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethod, ...paymentDetails } = req.body;

  const token = await tokenize(paymentMethod, paymentDetails);

  res.json({
    success: true,
    token,
  });
});

// Process payment
exports.processPayment = asyncHandler(async (req, res) => {
  const { paymentMethod, token, amount, currency, orderId } = req.body;

  let paymentResult;

  switch (paymentMethod) {
    case 'card':
      paymentResult = await processCardPayment({
        token,
        amount,
        currency,
        orderId,
      });
      break;

    case 'mpesa':
      paymentResult = await processMpesaPayment({
        phone: req.body.phoneNumber,
        amount,
        orderId,
      });
      break;

    default:
      throw new Error('Unsupported payment method');
  }

  if (paymentResult.success) {
    // Update order with payment information
    await Order.findByIdAndUpdate(orderId, {
      paymentResult: {
        id: paymentResult.transactionId,
        status: 'completed',
        updateTime: Date.now(),
        method: paymentMethod,
      },
      isPaid: true,
      paidAt: Date.now(),
    });
  }

  res.json({
    success: true,
    ...paymentResult,
  });
}); 