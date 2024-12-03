import API_ENDPOINTS from '../config/api';

export const productService = {
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.products.list}?${queryString}`;
    const response = await fetch(url);
    return response.json();
  },

  async getProductById(id) {
    const response = await fetch(API_ENDPOINTS.products.detail(id));
    return response.json();
  },

  async searchProducts(query) {
    const response = await fetch(`${API_ENDPOINTS.products.search}?q=${query}`);
    return response.json();
  },

  async getCategories() {
    const response = await fetch(API_ENDPOINTS.products.categories);
    return response.json();
  },
}; 