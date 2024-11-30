import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@chakra-ui/react';
import { useDocumentManagement } from './useDocumentManagement';
import { useNotifications } from './useNotifications';

export const useJobApplicationProcess = (jobId, userId) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { uploadDocument } = useDocumentManagement(userId);

  // Track application status in real-time
  useEffect(() => {
    if (!jobId || !userId) return;

    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplication(applications[0] || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [jobId, userId]);

  const submitApplication = async (applicationData, documents) => {
    try {
      setSubmitting(true);

      // Upload documents first
      const uploadedDocs = {};
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          const path = `applications/${userId}/${jobId}/${key}`;
          const downloadURL = await uploadDocument(file, path);
          uploadedDocs[key] = downloadURL;
        }
      }

      // Create application record
      const applicationRef = await addDoc(collection(db, 'applications'), {
        jobId,
        userId,
        ...applicationData,
        documents: uploadedDocs,
        status: 'pending',
        appliedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        history: [{
          status: 'pending',
          timestamp: serverTimestamp(),
          note: 'Application submitted'
        }]
      });

      // Update job document
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        currentApplicants: increment(1),
        lastActivity: serverTimestamp()
      });

      // Create notification for company
      await addDoc(collection(db, 'notifications'), {
        userId: applicationData.companyId,
        type: 'new_application',
        title: 'New Job Application',
        message: `New application received for ${applicationData.jobTitle}`,
        read: false,
        createdAt: serverTimestamp()
      });

      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
        status: 'success',
        duration: 5000
      });

      return applicationRef.id;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        status: 'error',
        duration: 5000
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const withdrawApplication = async () => {
    if (!application?.id) return;

    try {
      const applicationRef = doc(db, 'applications', application.id);
      await updateDoc(applicationRef, {
        status: 'withdrawn',
        lastUpdated: serverTimestamp(),
        history: [...(application.history || []), {
          status: 'withdrawn',
          timestamp: serverTimestamp(),
          note: 'Application withdrawn by candidate'
        }]
      });

      toast({
        title: 'Application Withdrawn',
        description: 'Your application has been withdrawn.',
        status: 'info',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to withdraw application.',
        status: 'error',
        duration: 5000
      });
    }
  };

  const updateApplicationStatus = async (newStatus, feedback) => {
    if (!application?.id) return;

    try {
      const applicationRef = doc(db, 'applications', application.id);
      await updateDoc(applicationRef, {
        status: newStatus,
        lastUpdated: serverTimestamp(),
        feedback,
        history: [...(application.history || []), {
          status: newStatus,
          timestamp: serverTimestamp(),
          feedback,
          note: `Status updated to ${newStatus}`
        }]
      });

      // Create notification for applicant
      await addDoc(collection(db, 'notifications'), {
        userId: application.userId,
        type: 'application_update',
        title: 'Application Status Updated',
        message: `Your application status has been updated to ${newStatus}`,
        read: false,
        createdAt: serverTimestamp()
      });

      toast({
        title: 'Status Updated',
        description: `Application status updated to ${newStatus}`,
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        status: 'error',
        duration: 5000
      });
    }
  };

  return {
    application,
    loading,
    submitting,
    submitApplication,
    withdrawApplication,
    updateApplicationStatus
  };
}; 