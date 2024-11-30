import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '@chakra-ui/react';

export const useApplicationStatus = (applicationId) => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!applicationId) return;

    const q = query(
      collection(db, 'applicationHistory'),
      where('applicationId', '==', applicationId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setHistory(historyData);
      if (historyData.length > 0) {
        setStatus(historyData[0].status);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [applicationId]);

  const updateStatus = async (newStatus, feedback = '', notifyApplicant = true) => {
    try {
      // Update application status
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        lastUpdated: new Date()
      });

      // Add to history
      await addDoc(collection(db, 'applicationHistory'), {
        applicationId,
        status: newStatus,
        feedback,
        timestamp: new Date()
      });

      // Create notification
      if (notifyApplicant) {
        const application = await getDoc(applicationRef);
        const applicationData = application.data();

        await addDoc(collection(db, 'notifications'), {
          userId: applicationData.userId,
          type: 'application_status',
          title: `Application Status Updated`,
          message: `Your application for ${applicationData.jobTitle} has been ${newStatus}`,
          read: false,
          createdAt: new Date()
        });
      }

      toast({
        title: 'Status Updated',
        description: `Application status changed to ${newStatus}`,
        status: 'success',
        duration: 3000
      });

      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
      return false;
    }
  };

  return {
    status,
    history,
    loading,
    updateStatus
  };
}; 