import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { useToast } from '@chakra-ui/react';

export const useApplications = (jobId) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Real-time applications tracking
  useEffect(() => {
    if (!jobId) return;

    const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(applicationsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [jobId]);

  const updateApplicationStatus = async (applicationId, newStatus, feedback = '') => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        feedback,
        updatedAt: new Date(),
      });

      // Update job document if status is 'accepted'
      if (newStatus === 'accepted') {
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobRef);
        if (jobDoc.exists()) {
          const currentApplications = jobDoc.data().currentApplicants || 0;
          const maxApplicants = jobDoc.data().maxApplicants || 0;
          
          if (maxApplicants > 0 && currentApplications + 1 >= maxApplicants) {
            await updateDoc(jobRef, {
              status: 'filled',
              currentApplicants: currentApplications + 1,
            });
          } else {
            await updateDoc(jobRef, {
              currentApplicants: currentApplications + 1,
            });
          }
        }
      }

      toast({
        title: 'Status Updated',
        description: `Application status changed to ${newStatus}`,
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
    }
  };

  const downloadDocument = async (documentPath) => {
    try {
      const storageRef = ref(storage, documentPath);
      const url = await getDownloadURL(storageRef);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return {
    applications,
    loading,
    error,
    updateApplicationStatus,
    downloadDocument,
  };
}; 