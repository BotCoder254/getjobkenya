import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import API_ENDPOINTS from '../config/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.cart.get, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      const response = await fetch(API_ENDPOINTS.cart.add, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add item to cart');
      const data = await response.json();
      setItems(data.items);
      toast({
        title: 'Item added to cart',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error adding item',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
      throw err;
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const response = await fetch(API_ENDPOINTS.cart.update, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to update cart');
      const data = await response.json();
      setItems(data.items);
      toast({
        title: 'Cart updated',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error updating cart',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
      throw err;
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(API_ENDPOINTS.cart.remove, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) throw new Error('Failed to remove item from cart');
      const data = await response.json();
      setItems(data.items);
      toast({
        title: 'Item removed',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error removing item',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.cart.clear, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to clear cart');
      setItems([]);
      toast({
        title: 'Cart cleared',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error clearing cart',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
      throw err;
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        getTotal,
        itemCount,
        refresh: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 