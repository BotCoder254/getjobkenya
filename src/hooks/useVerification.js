import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const toast = useToast();

  const verifyUser = async (userId, adminId, verificationData = {}) => {
    setIsVerifying(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: true,
        verifiedAt: serverTimestamp(),
        verifiedBy: adminId,
        ...verificationData,
      });

      toast({
        title: 'User Verified',
        description: 'User has been successfully verified',
        status: 'success',
        duration: 3000,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const unverifyUser = async (userId) => {
    setIsVerifying(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null,
      });

      toast({
        title: 'User Unverified',
        description: 'User verification has been removed',
        status: 'success',
        duration: 3000,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verifyUser,
    unverifyUser,
  };
}; 