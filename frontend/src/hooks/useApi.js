import { useState, useCallback } from 'react';
import { apiRequest } from '../config/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (endpoint, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(endpoint, options);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    execute,
  };
}; 