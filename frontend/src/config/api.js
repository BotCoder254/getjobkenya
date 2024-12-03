const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    profile: `${API_BASE_URL}/auth/profile`,
    updateProfile: `${API_BASE_URL}/auth/profile/update`,
  },
  
  // Product endpoints
  products: {
    list: `${API_BASE_URL}/products`,
    detail: (id) => `${API_BASE_URL}/products/${id}`,
    create: `${API_BASE_URL}/products`,
    update: (id) => `${API_BASE_URL}/products/${id}`,
    delete: (id) => `${API_BASE_URL}/products/${id}`,
    search: `${API_BASE_URL}/products/search`,
    categories: `${API_BASE_URL}/products/categories`,
  },
  
  // Cart endpoints
  cart: {
    get: `${API_BASE_URL}/cart`,
    add: `${API_BASE_URL}/cart/add`,
    update: `${API_BASE_URL}/cart/update`,
    remove: `${API_BASE_URL}/cart/remove`,
    clear: `${API_BASE_URL}/cart/clear`,
  },
  
  // Order endpoints
  orders: {
    create: `${API_BASE_URL}/orders`,
    list: `${API_BASE_URL}/orders`,
    detail: (id) => `${API_BASE_URL}/orders/${id}`,
    update: (id) => `${API_BASE_URL}/orders/${id}`,
    cancel: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
  },
  
  // Checkout endpoints
  checkout: {
    process: `${API_BASE_URL}/checkout/process`,
    validate: `${API_BASE_URL}/checkout/validate`,
    shipping: `${API_BASE_URL}/checkout/shipping`,
    payment: `${API_BASE_URL}/checkout/payment`,
  },
  
  // User management endpoints
  users: {
    list: `${API_BASE_URL}/users`,
    detail: (id) => `${API_BASE_URL}/users/${id}`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
  },
  
  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    settings: `${API_BASE_URL}/admin/settings`,
    analytics: `${API_BASE_URL}/admin/analytics`,
    bulk: {
      import: `${API_BASE_URL}/admin/bulk/import`,
      export: `${API_BASE_URL}/admin/bulk/export`,
    },
  },
  
  // Wishlist endpoints
  wishlist: {
    get: `${API_BASE_URL}/wishlist`,
    add: `${API_BASE_URL}/wishlist/add`,
    remove: `${API_BASE_URL}/wishlist/remove`,
    clear: `${API_BASE_URL}/wishlist/clear`,
  },
};

// API request helper with default options
export const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // For handling cookies
  };

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

export default API_ENDPOINTS; 