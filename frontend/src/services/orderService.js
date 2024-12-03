import API_ENDPOINTS from '../config/api';
import { apiRequest } from '../config/api';

export const orderService = {
  async createOrder(orderData) {
    return apiRequest(API_ENDPOINTS.orders.create, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders() {
    return apiRequest(API_ENDPOINTS.orders.list);
  },

  async getOrderById(id) {
    return apiRequest(API_ENDPOINTS.orders.detail(id));
  },

  async updateOrder(id, updateData) {
    return apiRequest(API_ENDPOINTS.orders.update(id), {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  async cancelOrder(id) {
    return apiRequest(API_ENDPOINTS.orders.cancel(id), {
      method: 'POST',
    });
  },

  async processCheckout(checkoutData) {
    return apiRequest(API_ENDPOINTS.checkout.process, {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },

  async validateShipping(shippingData) {
    return apiRequest(API_ENDPOINTS.checkout.shipping, {
      method: 'POST',
      body: JSON.stringify(shippingData),
    });
  },

  async processPayment(paymentData) {
    return apiRequest(API_ENDPOINTS.checkout.payment, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
}; 