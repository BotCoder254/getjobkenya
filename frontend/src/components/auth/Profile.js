import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  HStack,
  Divider,
  Badge,
  IconButton,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiLock,
  FiMail,
  FiUser,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiShoppingBag,
  FiHeart,
  FiSettings,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null,
  });
  const [errors, setErrors] = useState({});

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (formData.newPassword) {
        await updatePassword(formData.currentPassword, formData.newPassword);
      }

      const profileData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.avatar) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('avatar', formData.avatar);
        // Handle avatar upload here
      }

      await updateProfile(profileData);

      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="lg">Profile</Heading>
              <Button
                leftIcon={<FiEdit2 />}
                onClick={() => setIsEditing(!isEditing)}
                variant="ghost"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="center">
              <Box position="relative">
                <Avatar
                  size="2xl"
                  name={user?.name}
                  src={user?.avatar}
                />
                {isEditing && (
                  <IconButton
                    icon={<FiUpload />}
                    position="absolute"
                    bottom={0}
                    right={0}
                    rounded="full"
                    onClick={() =>
                      document.getElementById('avatar-upload').click()
                    }
                  />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </Box>

              <Badge colorScheme="brand" px={2} py={1} borderRadius="full">
                {user?.role}
              </Badge>
            </VStack>

            <Divider my={6} />

            <Tabs>
              <TabList>
                <Tab>Personal Info</Tab>
                <Tab>Security</Tab>
                <Tab>Activity</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <form onSubmit={handleSubmit}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isInvalid={errors.name}>
                        <FormLabel>Full Name</FormLabel>
                        <InputGroup>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            isReadOnly={!isEditing}
                            leftElement={<FiUser />}
                          />
                        </InputGroup>
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.email}>
                        <FormLabel>Email Address</FormLabel>
                        <InputGroup>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            isReadOnly={!isEditing}
                            leftElement={<FiMail />}
                          />
                        </InputGroup>
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>

                    {isEditing && (
                      <Button
                        mt={6}
                        colorScheme="brand"
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Saving..."
                      >
                        Save Changes
                      </Button>
                    )}
                  </form>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={errors.currentPassword}>
                      <FormLabel>Current Password</FormLabel>
                      <InputGroup>
                        <Input
                          name="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={handleChange}
                          isDisabled={!isEditing}
                          leftElement={<FiLock />}
                        />
                        <InputRightElement>
                          <IconButton
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.newPassword}>
                      <FormLabel>New Password</FormLabel>
                      <InputGroup>
                        <Input
                          name="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={handleChange}
                          isDisabled={!isEditing}
                          leftElement={<FiLock />}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.confirmPassword}>
                      <FormLabel>Confirm New Password</FormLabel>
                      <InputGroup>
                        <Input
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          isDisabled={!isEditing}
                          leftElement={<FiLock />}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    </FormControl>

                    {isEditing && (
                      <Button
                        mt={4}
                        colorScheme="brand"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        loadingText="Updating..."
                      >
                        Update Password
                      </Button>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card>
                      <CardHeader>
                        <HStack>
                          <FiShoppingBag />
                          <Heading size="sm">Recent Orders</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <Text color="gray.500">No recent orders</Text>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <HStack>
                          <FiHeart />
                          <Heading size="sm">Wishlist</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <Text color="gray.500">No items in wishlist</Text>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Profile; 