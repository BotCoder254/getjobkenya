/**
 * Validate credit card details
 * @param {Object} cardDetails - Credit card details
 * @returns {Object} Validation result
 */
exports.validateCreditCard = (cardDetails) => {
  const { number, expMonth, expYear, cvv } = cardDetails;

  // Basic validation results object
  const result = {
    isValid: true,
    errors: [],
  };

  // Card number validation (Luhn algorithm)
  if (!isValidCardNumber(number)) {
    result.isValid = false;
    result.errors.push('Invalid card number');
  }

  // Expiration date validation
  if (!isValidExpirationDate(expMonth, expYear)) {
    result.isValid = false;
    result.errors.push('Card has expired or invalid expiration date');
  }

  // CVV validation
  if (!isValidCVV(cvv)) {
    result.isValid = false;
    result.errors.push('Invalid CVV');
  }

  return result;
};

/**
 * Validate PayPal payment details
 * @param {Object} paypalDetails - PayPal payment details
 * @returns {Object} Validation result
 */
exports.validatePayPal = (paypalDetails) => {
  const { email } = paypalDetails;

  const result = {
    isValid: true,
    errors: [],
  };

  // Email validation
  if (!isValidEmail(email)) {
    result.isValid = false;
    result.errors.push('Invalid PayPal email address');
  }

  return result;
};

/**
 * Validate M-Pesa payment details
 * @param {Object} mpesaDetails - M-Pesa payment details
 * @returns {Object} Validation result
 */
exports.validateMpesa = (mpesaDetails) => {
  const { phoneNumber } = mpesaDetails;

  const result = {
    isValid: true,
    errors: [],
  };

  // Phone number validation
  if (!isValidPhoneNumber(phoneNumber)) {
    result.isValid = false;
    result.errors.push('Invalid M-Pesa phone number');
  }

  return result;
};

/**
 * Validate payment amount
 * @param {number} amount - Payment amount
 * @param {string} currency - Payment currency
 * @returns {Object} Validation result
 */
exports.validateAmount = (amount, currency = 'USD') => {
  const result = {
    isValid: true,
    errors: [],
  };

  // Amount validation
  if (!amount || amount <= 0) {
    result.isValid = false;
    result.errors.push('Invalid payment amount');
  }

  // Currency validation
  if (!isValidCurrency(currency)) {
    result.isValid = false;
    result.errors.push('Invalid or unsupported currency');
  }

  return result;
};

// Helper functions
function isValidCardNumber(number) {
  // Remove spaces and dashes
  number = number.replace(/[\s-]/g, '');
  
  // Check if contains only digits and has valid length
  if (!/^\d{13,19}$/.test(number)) {
    return false;
  }

  // Luhn algorithm implementation
  let sum = 0;
  let isEven = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function isValidExpirationDate(month, year) {
  const now = new Date();
  const expiry = new Date(year, month - 1);
  return expiry > now;
}

function isValidCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber) {
  // Basic validation for M-Pesa phone numbers (Kenyan format)
  return /^\+?254\d{9}$/.test(phoneNumber);
}

function isValidCurrency(currency) {
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'KES', 'JPY', 'AUD', 'CAD'];
  return supportedCurrencies.includes(currency.toUpperCase());
}

/**
 * Validate billing address
 * @param {Object} address - Billing address details
 * @returns {Object} Validation result
 */
exports.validateBillingAddress = (address) => {
  const result = {
    isValid: true,
    errors: [],
  };

  const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
  
  for (const field of requiredFields) {
    if (!address[field]) {
      result.isValid = false;
      result.errors.push(`Missing required field: ${field}`);
    }
  }

  // Postal code validation based on country
  if (address.country === 'US' && !/^\d{5}(-\d{4})?$/.test(address.postalCode)) {
    result.isValid = false;
    result.errors.push('Invalid US postal code');
  }

  return result;
};

/**
 * Validate payment method
 * @param {string} method - Payment method
 * @returns {Object} Validation result
 */
exports.validatePaymentMethod = (method) => {
  const supportedMethods = ['credit_card', 'paypal', 'mpesa'];
  
  return {
    isValid: supportedMethods.includes(method),
    errors: supportedMethods.includes(method) ? [] : ['Unsupported payment method'],
  };
}; 