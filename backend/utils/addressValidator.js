const axios = require('axios');

/**
 * Validate and format a shipping address
 * @param {Object} address - The address to validate
 * @returns {Promise<Object>} Validation result and formatted address
 */
exports.validateAddress = async (address) => {
  try {
    const { street, city, state, postalCode, country } = address;

    // Basic validation
    if (!street || !city || !state || !postalCode || !country) {
      throw new Error('All address fields are required');
    }

    // In production, this would integrate with a real address validation service
    // For now, we'll do basic formatting and validation

    // Format postal code based on country
    let formattedPostalCode = postalCode.replace(/\s+/g, '');
    if (country.toUpperCase() === 'US') {
      // US ZIP code validation (5 digits or ZIP+4)
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formattedPostalCode)) {
        throw new Error('Invalid US ZIP code format');
      }
    }

    // Basic state validation for US addresses
    if (country.toUpperCase() === 'US') {
      const usStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];
      
      if (!usStates.includes(state.toUpperCase())) {
        throw new Error('Invalid US state code');
      }
    }

    // Format street address
    const formattedStreet = street
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s#,.-]/g, ''); // Remove special characters except #,.-

    // Format city name
    const formattedCity = city
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.-]/g, '');

    // Return standardized address
    const standardizedAddress = {
      street: formattedStreet,
      city: formattedCity,
      state: state.toUpperCase().trim(),
      postalCode: formattedPostalCode,
      country: country.toUpperCase().trim(),
    };

    return {
      valid: true,
      standardizedAddress,
      originalAddress: address,
      suggestions: [], // Would contain suggested corrections in production
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      originalAddress: address,
      suggestions: [], // Would contain suggested corrections in production
    };
  }
};

/**
 * Get address suggestions based on partial input
 * @param {string} input - Partial address input
 * @returns {Promise<Array>} Array of address suggestions
 */
exports.getAddressSuggestions = async (input) => {
  try {
    // In production, this would call an address autocomplete service
    // For now, return empty suggestions
    return {
      success: true,
      suggestions: [],
    };
  } catch (error) {
    console.error('Error getting address suggestions:', error);
    throw new Error('Unable to get address suggestions');
  }
};

/**
 * Verify if an address is a valid delivery location
 * @param {Object} address - The address to verify
 * @returns {Promise<Object>} Verification result
 */
exports.verifyDeliveryLocation = async (address) => {
  try {
    // In production, this would verify if the address is serviceable
    // For now, assume all validated addresses are deliverable
    const validation = await exports.validateAddress(address);
    
    if (!validation.valid) {
      return {
        deliverable: false,
        reason: 'Invalid address',
        restrictions: [],
      };
    }

    return {
      deliverable: true,
      restrictions: [], // Would contain delivery restrictions in production
      estimatedDeliveryDays: '3-5',
    };
  } catch (error) {
    console.error('Error verifying delivery location:', error);
    throw new Error('Unable to verify delivery location');
  }
};

/**
 * Format address for display
 * @param {Object} address - The address to format
 * @param {string} format - Desired format (oneLine, multiLine, html)
 * @returns {string} Formatted address string
 */
exports.formatAddress = (address, format = 'oneLine') => {
  const { street, city, state, postalCode, country } = address;

  switch (format) {
    case 'oneLine':
      return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
    
    case 'multiLine':
      return `${street}\n${city}, ${state} ${postalCode}\n${country}`;
    
    case 'html':
      return `
        <div class="address">
          <div>${street}</div>
          <div>${city}, ${state} ${postalCode}</div>
          <div>${country}</div>
        </div>
      `;
    
    default:
      return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  }
}; 