import React, { createContext, useContext, useState, useEffect } from 'react';

import { 

  auth,

  signInWithEmailAndPassword as firebaseSignIn,

  createUserWithEmailAndPassword,

  signInWithPopup,

  GoogleAuthProvider,

  GithubAuthProvider,

  signOut

} from '../config/firebase';

import { setDoc, doc, getDoc } from 'firebase/firestore';

import { db } from '../config/firebase';

import { useProfileUpdates } from '../hooks/useProfileUpdates';



const AuthContext = createContext();



export const useAuth = () => {

  return useContext(AuthContext);

};



export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [userType, setUserType] = useState(null);

  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState(null);

  const { updateProfile, updateProfilePicture } = useProfileUpdates(user?.uid);



  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(async (user) => {

      if (user) {

        setUser(user);

        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {

          const userData = userDoc.data();

          setUserType(userData.userType);

          setProfileData(userData);

        }

      } else {

        setUser(null);

        setUserType(null);

        setProfileData(null);

      }

      setLoading(false);

    });



    return () => unsubscribe();

  }, []);



  const signInWithEmail = async (email, password) => {

    try {

      const result = await firebaseSignIn(auth, email, password);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (userDoc.exists()) {

        setUserType(userDoc.data().userType);

      }

      return result;

    } catch (error) {

      console.error('Sign in error:', error);

      throw error;

    }

  };



  const signInWithGoogle = async () => {

    try {

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (!userDoc.exists()) {

        // Create new user document

        await setDoc(doc(db, 'users', result.user.uid), {

          email: result.user.email,

          userType: 'applicant', // Default type

          createdAt: new Date()

        });

        setUserType('applicant');

      } else {

        setUserType(userDoc.data().userType);

      }

      return result;

    } catch (error) {

      throw error;

    }

  };



  const signInWithGithub = async () => {

    try {

      const provider = new GithubAuthProvider();

      const result = await signInWithPopup(auth, provider);

      // Similar to Google sign in

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (!userDoc.exists()) {

        await setDoc(doc(db, 'users', result.user.uid), {

          email: result.user.email,

          userType: 'applicant',

          createdAt: new Date()

        });

        setUserType('applicant');

      } else {

        setUserType(userDoc.data().userType);

      }

      return result;

    } catch (error) {

      throw error;

    }

  };



  const signUpWithEmail = async (email, password, type) => {

    try {

      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', result.user.uid), {

        email,

        userType: type,

        createdAt: new Date()

      });

      setUserType(type);

      return result;

    } catch (error) {

      throw error;

    }

  };



  const signOutUser = async () => {

    try {

      await signOut(auth);

      setUser(null);

      setUserType(null);

    } catch (error) {

      throw error;

    }

  };



  const updateUserProfile = async (data) => {

    try {

      await updateProfile(data);

      setProfileData(data);

      return true;

    } catch (error) {

      console.error('Error updating profile:', error);

      return false;

    }

  };



  const updateUserPhoto = async (file) => {

    try {

      const photoURL = await updateProfilePicture(file);

      if (photoURL) {

        setUser(prev => ({ ...prev, photoURL }));

      }

      return photoURL;

    } catch (error) {

      console.error('Error updating photo:', error);

      return null;

    }

  };



  return (

    <AuthContext.Provider value={{

      user,

      userType,

      profileData,

      signInWithEmail,

      signInWithGoogle,

      signInWithGithub,

      signUpWithEmail,

      signOut: signOutUser,

      updateUserProfile,

      updateUserPhoto,

      isAuthenticated: !!user,

      isLoading: loading,

    }}>

      {!loading && children}

    </AuthContext.Provider>

  );

}; 
