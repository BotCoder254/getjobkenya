import { useState, useEffect, useCallback } from 'react';
import API_ENDPOINTS from '../config/api';
import { apiRequest } from '../config/api';

export const useCart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.cart.get);
      setItems(response.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.cart.add, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      setItems(response.items);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.cart.update, {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity }),
      });
      setItems(response.items);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.cart.remove, {
        method: 'DELETE',
        body: JSON.stringify({ productId }),
      });
      setItems(response.items);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await apiRequest(API_ENDPOINTS.cart.clear, {
        method: 'DELETE',
      });
      setItems([]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }, [items]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getTotal,
    refresh: fetchCart,
  };
}; 