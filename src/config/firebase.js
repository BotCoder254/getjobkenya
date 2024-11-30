import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBMjKssyRSZJ16EhSdVOFd2XjIkj8_BT-E",
  authDomain: "twitterclone-47ebf.firebaseapp.com",
  databaseURL: "https://twitterclone-47ebf-default-rtdb.firebaseio.com",
  projectId: "twitterclone-47ebf",
  storageBucket: "twitterclone-47ebf.appspot.com",
  messagingSenderId: "700556014223",
  appId: "1:700556014223:web:a0646158ade0b1e55ab6fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  COMPANIES: 'companies',
  SAVED_JOBS: 'savedJobs',
  NOTIFICATIONS: 'notifications',
};

// Document templates
const DOCUMENT_TEMPLATES = {
  JOB: {
    title: '',
    description: '',
    companyId: '',
    companyName: '',
    companyLogo: '',
    location: '',
    type: 'full-time',
    salary: '',
    requirements: '',
    benefits: '',
    skills: [],
    experienceLevel: 'entry',
    deadline: null,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    applications: [],
    views: 0,
  },
  APPLICATION: {
    jobId: '',
    userId: '',
    status: 'pending',
    coverLetter: '',
    resume: '',
    appliedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
    notes: '',
  },
  USER_PROFILE: {
    type: 'applicant',
    email: '',
    displayName: '',
    photoURL: '',
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: 'active',
    profile: {
      title: '',
      bio: '',
      skills: [],
      experience: [],
      education: [],
      location: '',
      resume: '',
      links: {
        linkedin: '',
        github: '',
        portfolio: '',
      },
    },
    settings: {
      emailNotifications: true,
      jobAlerts: true,
      profileVisibility: 'public',
    },
  },
};

// Firebase helper functions
const createJob = async (jobData) => {
  try {
    const jobRef = collection(db, COLLECTIONS.JOBS);
    return await addDoc(jobRef, {
      ...DOCUMENT_TEMPLATES.JOB,
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

const updateJob = async (jobId, updates) => {
  try {
    const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
    return await updateDoc(jobRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

const deleteJob = async (jobId) => {
  try {
    const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
    return await deleteDoc(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

const submitApplication = async (jobId, userId, applicationData) => {
  try {
    const applicationRef = collection(db, COLLECTIONS.APPLICATIONS);
    return await addDoc(applicationRef, {
      ...DOCUMENT_TEMPLATES.APPLICATION,
      jobId,
      userId,
      ...applicationData,
      appliedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    return await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export {
  auth,
  db,
  storage,
  COLLECTIONS,
  DOCUMENT_TEMPLATES,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp,
  createJob,
  updateJob,
  deleteJob,
  submitApplication,
  updateUserProfile,
}; 
