import { useState, useEffect } from 'react';
import { websocketService } from '../services/websocketService';
import { orderService } from '../services/orderService';

export const useOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleOrderUpdate = (updatedOrder) => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder);
      }
    };

    // Subscribe to order updates
    unsubscribe = websocketService.subscribe('orderUpdate', handleOrderUpdate);

    // Fetch initial order data
    fetchOrder();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId]);

  return { order, loading, error };
}; 