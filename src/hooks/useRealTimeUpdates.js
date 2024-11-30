import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useRealTimeUpdates = (userId, type = 'applications') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!userId) return;

    let q;
    if (type === 'applications') {
      q = query(
        collection(db, 'applications'),
        where('userId', '==', userId),
        orderBy('appliedAt', 'desc')
      );
    } else if (type === 'jobs') {
      q = query(
        collection(db, 'jobs'),
        where('companyId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error in real-time updates:', err);
        setError(err.message);
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to get real-time updates',
          status: 'error',
          duration: 5000,
        });
      }
    );

    return () => unsubscribe();
  }, [userId, type]);

  return {
    data,
    loading,
    error,
  };
}; 