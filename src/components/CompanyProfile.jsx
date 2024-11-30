import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorModeValue,
  IconButton,
  Badge,
  SimpleGrid,
  Divider,
  useToast,
  Progress,
  Flex,
  Icon,
  Link,
} from '@chakra-ui/react';
import {
  FaCamera,
  FaBuilding,
  FaGlobe,
  FaLinkedin,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaEdit,
  FaCheckCircle,
} from 'react-icons/fa';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import VerifiedBadge from './common/VerifiedBadge';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [editedProfile, setEditedProfile] = useState({
    companyName: '',
    industry: '',
    size: '',
    founded: '',
    description: '',
    mission: '',
    headquarters: '',
    website: '',
    linkedin: '',
    twitter: '',
    benefits: [],
    culture: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, [user]);

  const fetchCompanyProfile = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setEditedProfile({
          companyName: data.companyName || '',
          industry: data.industry || '',
          size: data.size || '',
          founded: data.founded || '',
          description: data.description || '',
          mission: data.mission || '',
          headquarters: data.headquarters || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          benefits: data.benefits || [],
          culture: data.culture || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company profile',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `companyLogos/${user.uid}`);
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
          setProfile(prev => ({ ...prev, photoURL: downloadURL }));
          setUploadProgress(0);
          toast({
            title: 'Success',
            description: 'Company logo updated successfully',
            status: 'success',
            duration: 3000,
          });
        }
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company logo',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...editedProfile,
        updatedAt: new Date(),
      });
      setProfile(prev => ({ ...prev, ...editedProfile }));
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Company profile updated successfully',
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

  if (!profile) {
    return null;
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
          <VStack spacing={6} align="stretch">
            <HStack spacing={8}>
              <Box position="relative">
                <Avatar
                  size="2xl"
                  src={profile.photoURL}
                  name={profile.companyName}
                />
                <IconButton
                  aria-label="Change logo"
                  icon={<FaCamera />}
                  size="sm"
                  colorScheme="blue"
                  rounded="full"
                  position="absolute"
                  bottom={0}
                  right={0}
                  onClick={() => fileInputRef.current.click()}
                />
              </Box>
              <VStack align="start" flex={1} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    value={editedProfile.companyName}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      companyName: e.target.value
                    })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Industry</FormLabel>
                  <Input
                    value={editedProfile.industry}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      industry: e.target.value
                    })}
                  />
                </FormControl>
              </VStack>
            </HStack>

            <SimpleGrid columns={2} spacing={6}>
              <FormControl>
                <FormLabel>Company Size</FormLabel>
                <Input
                  value={editedProfile.size}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    size: e.target.value
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Founded Year</FormLabel>
                <Input
                  value={editedProfile.founded}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    founded: e.target.value
                  })}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Company Description</FormLabel>
              <Textarea
                value={editedProfile.description}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  description: e.target.value
                })}
                rows={4}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Mission Statement</FormLabel>
              <Textarea
                value={editedProfile.mission}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  mission: e.target.value
                })}
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={6}>
              <FormControl>
                <FormLabel>Headquarters</FormLabel>
                <Input
                  value={editedProfile.headquarters}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    headquarters: e.target.value
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  value={editedProfile.website}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    website: e.target.value
                  })}
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={6}>
              <FormControl>
                <FormLabel>LinkedIn</FormLabel>
                <Input
                  value={editedProfile.linkedin}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    linkedin: e.target.value
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Twitter</FormLabel>
                <Input
                  value={editedProfile.twitter}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    twitter: e.target.value
                  })}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Company Culture</FormLabel>
              <Textarea
                value={editedProfile.culture}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  culture: e.target.value
                })}
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={6}>
              <FormControl>
                <FormLabel>Contact Email</FormLabel>
                <Input
                  value={editedProfile.contactEmail}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    contactEmail: e.target.value
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Contact Phone</FormLabel>
                <Input
                  value={editedProfile.contactPhone}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    contactPhone: e.target.value
                  })}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea
                value={editedProfile.address}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  address: e.target.value
                })}
                rows={2}
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
          </VStack>
        ) : (
          <VStack spacing={8} align="stretch">
            <HStack spacing={8}>
              <Avatar
                size="2xl"
                src={profile.photoURL}
                name={profile.companyName}
              />
              <VStack align="start" spacing={2}>
                <HStack>
                  <Heading size="lg">{profile.companyName}</Heading>
                  {profile.isVerified && <VerifiedBadge />}
                </HStack>
                <Text color="gray.500">{profile.industry}</Text>
                <HStack spacing={4}>
                  <Badge colorScheme="blue">{profile.size} employees</Badge>
                  <Badge colorScheme="green">Founded {profile.founded}</Badge>
                </HStack>
              </VStack>
              <Button
                leftIcon={<FaEdit />}
                colorScheme="blue"
                variant="outline"
                ml="auto"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </HStack>

            <Divider />

            <VStack align="start" spacing={4}>
              <Heading size="md">About Us</Heading>
              <Text>{profile.description}</Text>
            </VStack>

            <VStack align="start" spacing={4}>
              <Heading size="md">Mission</Heading>
              <Text>{profile.mission}</Text>
            </VStack>

            <SimpleGrid columns={2} spacing={8}>
              <VStack align="start" spacing={4}>
                <Heading size="md">Contact Information</Heading>
                <HStack>
                  <Icon as={FaMapMarkerAlt} />
                  <Text>{profile.headquarters}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaEnvelope} />
                  <Text>{profile.contactEmail}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaPhone} />
                  <Text>{profile.contactPhone}</Text>
                </HStack>
              </VStack>

              <VStack align="start" spacing={4}>
                <Heading size="md">Social Links</Heading>
                <Link href={profile.website} isExternal>
                  <HStack>
                    <Icon as={FaGlobe} />
                    <Text>Website</Text>
                  </HStack>
                </Link>
                <Link href={profile.linkedin} isExternal>
                  <HStack>
                    <Icon as={FaLinkedin} />
                    <Text>LinkedIn</Text>
                  </HStack>
                </Link>
                <Link href={profile.twitter} isExternal>
                  <HStack>
                    <Icon as={FaTwitter} />
                    <Text>Twitter</Text>
                  </HStack>
                </Link>
              </VStack>
            </SimpleGrid>

            <VStack align="start" spacing={4}>
              <Heading size="md">Company Culture</Heading>
              <Text>{profile.culture}</Text>
            </VStack>
          </VStack>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {uploadProgress > 0 && (
          <Progress
            value={uploadProgress}
            size="xs"
            colorScheme="blue"
            mt={4}
          />
        )}
      </Box>
    </Container>
  );
};

export default CompanyProfile; 