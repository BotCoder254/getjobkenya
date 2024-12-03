/**
 * Tax rates by country and region
 * In a production environment, these would typically come from a database or tax service API
 */
const TAX_RATES = {
  US: {
    default: 0.0,
    states: {
      CA: 0.0725, // California
      NY: 0.0885, // New York
      TX: 0.0625, // Texas
      FL: 0.06,   // Florida
      // Add more states as needed
    },
  },
  CA: {
    default: 0.05, // GST
    provinces: {
      ON: 0.13, // Ontario (HST)
      BC: 0.12, // British Columbia (GST + PST)
      QC: 0.14975, // Quebec (GST + QST)
      // Add more provinces as needed
    },
  },
  GB: {
    default: 0.20, // VAT
  },
  // Add more countries as needed
};

/**
 * Product category tax rates
 * Some products may have different tax rates based on their category
 */
const CATEGORY_TAX_RATES = {
  food: {
    default: 0.0,
    prepared: 0.0725,
  },
  electronics: {
    default: 0.0725,
  },
  clothing: {
    default: 0.0725,
    luxury: 0.0885,
  },
  // Add more categories as needed
};

/**
 * Calculate tax for an order
 * @param {Object} order - Order details
 * @param {Object} address - Shipping address
 * @returns {Object} Tax calculation result
 */
exports.calculateOrderTax = (order, address) => {
  const { country, state, city } = address;
  let totalTax = 0;
  const taxDetails = [];

  // Get base tax rate for the location
  const baseTaxRate = getTaxRateForLocation(country, state);

  // Calculate tax for each item
  order.items.forEach(item => {
    const itemTax = calculateItemTax(item, baseTaxRate, country);
    totalTax += itemTax.tax;
    taxDetails.push(itemTax);
  });

  return {
    totalTax: roundToTwo(totalTax),
    effectiveRate: roundToTwo(totalTax / order.subtotal),
    breakdown: taxDetails,
    taxJurisdiction: {
      country,
      state,
      city,
      baseTaxRate,
    },
  };
};

/**
 * Calculate tax for a single item
 * @param {Object} item - Product item
 * @param {number} baseTaxRate - Base tax rate for location
 * @param {string} country - Country code
 * @returns {Object} Item tax details
 */
function calculateItemTax(item, baseTaxRate, country) {
  const { price, quantity, category } = item;
  const subtotal = price * quantity;

  // Get category-specific tax rate if applicable
  const categoryRate = getCategoryTaxRate(category, country);
  const effectiveRate = Math.max(baseTaxRate, categoryRate);
  const tax = subtotal * effectiveRate;

  return {
    itemId: item._id,
    subtotal,
    taxRate: effectiveRate,
    tax: roundToTwo(tax),
    category,
  };
}

/**
 * Get tax rate for a specific location
 * @param {string} country - Country code
 * @param {string} state - State/Province code
 * @returns {number} Tax rate
 */
function getTaxRateForLocation(country, state) {
  const countryRates = TAX_RATES[country];
  if (!countryRates) {
    return 0;
  }

  if (state) {
    // Check for state/province specific rates
    if (country === 'US' && countryRates.states[state]) {
      return countryRates.states[state];
    }
    if (country === 'CA' && countryRates.provinces[state]) {
      return countryRates.provinces[state];
    }
  }

  return countryRates.default;
}

/**
 * Get tax rate for a specific product category
 * @param {string} category - Product category
 * @param {string} country - Country code
 * @returns {number} Category tax rate
 */
function getCategoryTaxRate(category, country) {
  const categoryRates = CATEGORY_TAX_RATES[category];
  if (!categoryRates) {
    return 0;
  }

  // Could add country-specific category rates here
  return categoryRates.default;
}

/**
 * Calculate tax exemption
 * @param {Object} order - Order details
 * @param {Object} exemptionDetails - Tax exemption details
 * @returns {Object} Exemption calculation result
 */
exports.calculateTaxExemption = (order, exemptionDetails) => {
  const { type, certificateNumber, percentage } = exemptionDetails;
  const originalTax = exports.calculateOrderTax(order, order.shippingAddress);

  let exemptionAmount = 0;
  switch (type) {
    case 'full':
      exemptionAmount = originalTax.totalTax;
      break;
    case 'partial':
      exemptionAmount = originalTax.totalTax * (percentage / 100);
      break;
    default:
      exemptionAmount = 0;
  }

  return {
    originalTax: originalTax.totalTax,
    exemptionAmount: roundToTwo(exemptionAmount),
    finalTax: roundToTwo(originalTax.totalTax - exemptionAmount),
    certificateNumber,
    type,
    percentage,
  };
};

/**
 * Validate tax exemption certificate
 * @param {Object} certificate - Tax exemption certificate details
 * @returns {Object} Validation result
 */
exports.validateExemptionCertificate = (certificate) => {
  // In production, this would validate against a tax service API
  const { number, type, expiryDate } = certificate;

  const isValid = Boolean(
    number &&
    type &&
    expiryDate &&
    new Date(expiryDate) > new Date()
  );

  return {
    isValid,
    errors: isValid ? [] : ['Invalid or expired tax exemption certificate'],
  };
};

/**
 * Round to 2 decimal places
 * @param {number} value - Value to round
 * @returns {number} Rounded value
 */
function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Get available tax exemption types
 * @param {string} country - Country code
 * @returns {Array} Available exemption types
 */
exports.getExemptionTypes = (country) => {
  // In production, this would come from a configuration or database
  const exemptionTypes = {
    US: [
      { code: 'resale', name: 'Resale Certificate' },
      { code: 'nonprofit', name: 'Nonprofit Organization' },
      { code: 'government', name: 'Government Entity' },
    ],
    CA: [
      { code: 'status_indian', name: 'Status Indian' },
      { code: 'diplomatic', name: 'Diplomatic Exemption' },
    ],
    // Add more countries as needed
  };

  return exemptionTypes[country] || [];
};

/**
 * Calculate tax for digital products
 * @param {Object} product - Digital product details
 * @param {Object} customer - Customer details
 * @returns {Object} Tax calculation for digital product
 */
exports.calculateDigitalTax = (product, customer) => {
  // Special handling for digital goods (e.g., VAT MOSS for EU)
  const { country } = customer;
  let taxRate = 0;

  // In production, this would use proper VAT MOSS rates
  if (country.startsWith('EU')) {
    taxRate = 0.20; // Example VAT rate
  }

  const tax = product.price * taxRate;

  return {
    taxRate,
    tax: roundToTwo(tax),
    isDigital: true,
    jurisdiction: country,
  };
}; 