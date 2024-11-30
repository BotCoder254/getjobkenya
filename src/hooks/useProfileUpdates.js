import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useProfileUpdates = (userId) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();

  const updateProfilePicture = async (file) => {
    if (!file) return null;
    
    try {
      setIsUpdating(true);
      const storageRef = ref(storage, `profilePictures/${userId}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'users', userId), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
        status: 'success',
        duration: 3000,
      });

      return downloadURL;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        status: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setIsUpdating(false);
      setUploadProgress(0);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setIsUpdating(true);
      await updateDoc(doc(db, 'users', userId), {
        ...profileData,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    uploadProgress,
    updateProfilePicture,
    updateProfile,
  };
}; 