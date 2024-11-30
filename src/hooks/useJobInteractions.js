import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useJobInteractions = (userId) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const saveJob = async (jobId, jobData) => {
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'savedJobs'), {
        userId,
        jobId,
        jobData,
        savedAt: new Date(),
      });

      toast({
        title: 'Job Saved',
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

  const applyForJob = async (jobId, applicationData) => {
    setIsLoading(true);
    try {
      // Add to applications collection
      const applicationRef = await addDoc(collection(db, 'applications'), {
        userId,
        jobId,
        ...applicationData,
        status: 'pending',
        appliedAt: new Date(),
      });

      // Update job document
      await updateDoc(doc(db, 'jobs', jobId), {
        applications: arrayUnion({
          userId,
          applicationId: applicationRef.id,
          status: 'pending',
          appliedAt: new Date(),
        }),
      });

      toast({
        title: 'Application Submitted',
        status: 'success',
        duration: 3000,
      });

      return applicationRef.id;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveJob,
    applyForJob,
  };
}; 