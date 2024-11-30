import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage, db } from '../config/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useToast } from '@chakra-ui/react';

export const useDocumentManagement = (userId) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const toast = useToast();

  const uploadDocument = async (file, type, metadata = {}) => {
    try {
      setUploading(true);
      const timestamp = new Date().getTime();
      const filename = `${type}_${timestamp}_${file.name}`;
      const path = `documents/${userId}/${filename}`;
      const storageRef = ref(storage, path);

      // Upload file with metadata
      await uploadBytes(storageRef, file, {
        customMetadata: {
          ...metadata,
          type,
          originalName: file.name,
          uploadedAt: timestamp.toString(),
          userId
        }
      });

      const downloadURL = await getDownloadURL(storageRef);

      // Create document metadata
      const documentData = {
        type,
        name: file.name,
        path,
        url: downloadURL,
        uploadedAt: timestamp,
        metadata,
        size: file.size,
        fileType: file.type
      };

      // Update user's document list in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        documents: arrayUnion(documentData)
      });

      toast({
        title: 'Document Uploaded',
        description: `${file.name} has been uploaded successfully`,
        status: 'success',
        duration: 3000
      });

      return documentData;
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        status: 'error',
        duration: 5000
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteDocument = async (documentPath, documentData) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, documentPath);
      await deleteObject(storageRef);

      // Remove from user's document list in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        documents: arrayRemove(documentData)
      });

      toast({
        title: 'Document Deleted',
        description: `${documentData.name} has been deleted successfully`,
        status: 'success',
        duration: 3000
      });

      return true;
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        status: 'error',
        duration: 5000
      });
      return false;
    }
  };

  const fetchUserDocuments = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDocuments(userData.documents || []);
        return userData.documents || [];
      }
      return [];
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch documents',
        status: 'error',
        duration: 5000
      });
      return [];
    }
  };

  const updateDocumentMetadata = async (documentPath, newMetadata) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const documents = userData.documents || [];
        
        const updatedDocuments = documents.map(doc => {
          if (doc.path === documentPath) {
            return {
              ...doc,
              metadata: {
                ...doc.metadata,
                ...newMetadata
              }
            };
          }
          return doc;
        });

        await updateDoc(userRef, {
          documents: updatedDocuments
        });

        toast({
          title: 'Metadata Updated',
          status: 'success',
          duration: 3000
        });

        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        status: 'error',
        duration: 5000
      });
      return false;
    }
  };

  const validateDocument = (file, allowedTypes, maxSize) => {
    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: `Please upload a ${allowedTypes.join(' or ')} file`,
        status: 'error',
        duration: 5000
      });
      return false;
    }

    // Check file size (in bytes)
    if (maxSize && file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: `File size should be less than ${Math.round(maxSize/1024/1024)}MB`,
        status: 'error',
        duration: 5000
      });
      return false;
    }

    return true;
  };

  return {
    uploading,
    progress,
    documents,
    uploadDocument,
    deleteDocument,
    fetchUserDocuments,
    updateDocumentMetadata,
    validateDocument
  };
}; 