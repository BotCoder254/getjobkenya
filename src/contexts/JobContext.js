import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, COLLECTIONS } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    experienceLevel: '',
    salary: '',
    skills: [],
  });

  useEffect(() => {
    let q = query(collection(db, COLLECTIONS.JOBS));

    // Apply filters
    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    // Add more filters as needed

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters]);

  const value = {
    jobs,
    loading,
    filters,
    setFilters,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}; 