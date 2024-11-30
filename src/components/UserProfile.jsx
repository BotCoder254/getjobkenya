import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  VStack,
  HStack,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Icon,
  useColorModeValue,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Flex,
  Progress,
  AvatarBadge,
  Textarea,
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaBriefcase, 
  FaGraduationCap, 
  FaLink, 
  FaCamera,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaEdit,
} from 'react-icons/fa';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Player } from '@lottiefiles/react-lottie-player';
import { LOTTIE_FILES } from '../animations';
import VerifiedBadge from './common/VerifiedBadge';
import ProfileView from './ProfileView';

const UserProfile = ({ userId }) => {
  const { user, userType } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: '',
    title: '',
    bio: '',
    location: '',
    skills: [],
    experience: '',
    education: '',
    links: {
      linkedin: '',
      github: '',
      portfolio: '',
    },
    photoURL: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const canView = () => {
    if (userType === 'admin') {
      return profile?.userType !== 'admin';
    }
    if (userType === 'company' && profile?.userType === 'applicant') {
      return true;
    }
    if (userType === 'applicant' && profile?.userType === 'company') {
      return true;
    }
    return user.uid === (userId || user.uid);
  };

  const canEditProfile = () => {
    return user.uid === (userId || user.uid);
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'users', userId || user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setProfile(profileData);
        setEditedProfile({
          displayName: profileData.displayName || '',
          title: profileData.title || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          skills: profileData.skills || [],
          experience: profileData.experience || '',
          education: profileData.education || '',
          links: profileData.links || {
            linkedin: '',
            github: '',
            portfolio: '',
          },
          photoURL: profileData.photoURL || '',
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytes(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          throw error;
        },
        async () => {
          const downloadURL = await getDownloadURL(storageRef);
          await updateDoc(doc(db, 'users', user.uid), {
            photoURL: downloadURL,
          });
          setEditedProfile(prev => ({ ...prev, photoURL: downloadURL }));
          setProfile(prev => ({ ...prev, photoURL: downloadURL }));
          setUploadProgress(0);
          toast({
            title: 'Success',
            description: 'Profile picture updated successfully',
            status: 'success',
            duration: 3000,
          });
        }
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        ...editedProfile,
        skills: typeof editedProfile.skills === 'string' 
          ? editedProfile.skills.split(',').map(skill => skill.trim())
          : editedProfile.skills || [],
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(prev => ({ ...prev, ...updatedProfile }));
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const EditForm = () => (
    <Stack spacing={6}>
      <FormControl>
        <FormLabel>Display Name</FormLabel>
        <Input
          value={editedProfile.displayName}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            displayName: e.target.value
          })}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Title</FormLabel>
        <Input
          value={editedProfile.title}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            title: e.target.value
          })}
          placeholder={userType === 'applicant' ? "e.g., Software Engineer" : "e.g., Company Name"}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Bio</FormLabel>
        <Textarea
          value={editedProfile.bio}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            bio: e.target.value
          })}
          rows={4}
          placeholder={userType === 'applicant' ? "Tell us about yourself" : "Tell us about your company"}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Location</FormLabel>
        <Input
          value={editedProfile.location}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            location: e.target.value
          })}
        />
      </FormControl>

      {userType === 'applicant' && (
        <>
          <FormControl>
            <FormLabel>Skills (comma separated)</FormLabel>
            <Input
              value={Array.isArray(editedProfile.skills) ? editedProfile.skills.join(', ') : ''}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                skills: e.target.value.split(',').map(skill => skill.trim())
              })}
              placeholder="e.g., React, Node.js, Python"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Experience</FormLabel>
            <Textarea
              value={editedProfile.experience}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                experience: e.target.value
              })}
              placeholder="List your work experience"
              rows={4}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Education</FormLabel>
            <Textarea
              value={editedProfile.education}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                education: e.target.value
              })}
              placeholder="List your educational background"
              rows={4}
            />
          </FormControl>
        </>
      )}

      <FormControl>
        <FormLabel>LinkedIn Profile</FormLabel>
        <Input
          value={editedProfile.links?.linkedin}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            links: { ...editedProfile.links, linkedin: e.target.value }
          })}
        />
      </FormControl>

      {userType === 'applicant' && (
        <FormControl>
          <FormLabel>GitHub Profile</FormLabel>
          <Input
            value={editedProfile.links?.github}
            onChange={(e) => setEditedProfile({
              ...editedProfile,
              links: { ...editedProfile.links, github: e.target.value }
            })}
          />
        </FormControl>
      )}

      <FormControl>
        <FormLabel>Portfolio Website</FormLabel>
        <Input
          value={editedProfile.links?.portfolio}
          onChange={(e) => setEditedProfile({
            ...editedProfile,
            links: { ...editedProfile.links, portfolio: e.target.value }
          })}
        />
      </FormControl>

      <HStack spacing={4}>
        <Button colorScheme="blue" onClick={handleSaveProfile}>
          Save Changes
        </Button>
        <Button variant="ghost" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </HStack>
    </Stack>
  );

  if (!canView()) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Heading>Access Denied</Heading>
          <Text>You don't have permission to view this profile.</Text>
        </VStack>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Player
            autoplay
            loop
            src={LOTTIE_FILES.loading}
            style={{ height: '200px', width: '200px' }}
          />
          <Text>Loading profile...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        p={8}
      >
        {isEditing ? (
          <EditForm />
        ) : (
          <ProfileView 
            profile={profile}
            showActions={user.uid !== userId && userType === 'company'}
          />
        )}

        {canEditProfile() && !isEditing && (
          <Button
            leftIcon={<FaEdit />}
            colorScheme="blue"
            variant="outline"
            mt={6}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default UserProfile; 