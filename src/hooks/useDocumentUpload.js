import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const uploadDocument = async (file, path) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `${path}/${file.name}`);
      const uploadTask = uploadBytes(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          throw error;
        }
      );

      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      setUploading(false);
      setProgress(0);
      return downloadURL;
    } catch (error) {
      toast({
        title: 'Error uploading document',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setUploading(false);
      setProgress(0);
      return null;
    }
  };

  return {
    uploadDocument,
    uploading,
    progress,
  };
}; 