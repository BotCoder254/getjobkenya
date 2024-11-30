import { useState } from 'react';
import { doc, updateDoc, getDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useProfileInteractions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const viewProfile = async (userId, viewerId) => {
    try {
      const profileRef = doc(db, 'users', userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const views = profileDoc.data().views || [];
        if (!views.includes(viewerId)) {
          await updateDoc(profileRef, {
            views: [...views, viewerId],
            lastViewed: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error viewing profile:', error);
    }
  };

  const connectWithUser = async (userId, connectorId) => {
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const connectorRef = doc(db, 'users', connectorId);
      
      await updateDoc(userRef, {
        connections: arrayUnion(connectorId),
        updatedAt: serverTimestamp(),
      });
      
      await updateDoc(connectorRef, {
        connections: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Connection Request Sent',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    viewProfile,
    connectWithUser,
  };
}; 