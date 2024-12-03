import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  SimpleGrid,
  Select,
  FormErrorMessage,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Collapse,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { FiUser, FiMapPin, FiPhone, FiMail, FiHome, FiCheck } from 'react-icons/fi';
import { API_ENDPOINTS, apiRequest } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ShippingForm = ({ onSubmit, initialData }) => {
  const [verifyingAddress, setVerifyingAddress] = useState(false);
  const [suggestedAddresses, setSuggestedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData || {},
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (user && !initialData) {
      loadUserProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const profile = await apiRequest(API_ENDPOINTS.auth.profile);
      if (profile.shippingAddress) {
        reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          address: profile.shippingAddress.address,
          city: profile.shippingAddress.city,
          state: profile.shippingAddress.state,
          zipCode: profile.shippingAddress.zipCode,
          country: profile.shippingAddress.country,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const verifyAddress = async (data) => {
    setVerifyingAddress(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.checkout.validate, {
        method: 'POST',
        body: JSON.stringify({
          type: 'address',
          data: {
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          },
        }),
      });

      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestedAddresses(response.suggestions);
        setSelectedAddress(response.suggestions[0]);
      } else {
        // Address is valid, proceed with submission
        handleFinalSubmit(data);
      }
    } catch (error) {
      toast({
        title: 'Address Verification Failed',
        description: error.message || 'Failed to verify address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setVerifyingAddress(false);
    }
  };

  const handleFinalSubmit = async (data) => {
    try {
      // Save shipping address to user profile if logged in
      if (user) {
        await apiRequest(API_ENDPOINTS.auth.updateProfile, {
          method: 'PUT',
          body: JSON.stringify({
            shippingAddress: {
              address: data.address,
              city: data.city,
              state: data.state,
              zipCode: data.zipCode,
              country: data.country,
            },
          }),
        });
      }

      onSubmit(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save shipping information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddressSelection = (address) => {
    setSelectedAddress(address);
    setValue('address', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('zipCode', address.zipCode);
  };

  if (loadingProfile) {
    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="center" py={8}>
            <Spinner size="xl" color="brand.500" />
            <Text>Loading shipping information...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardHeader>
        <Heading size="md">Shipping Information</Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(verifyAddress)}>
          <VStack spacing={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FormControl isInvalid={errors.firstName} isRequired>
                <FormLabel>First Name</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FiUser />
                  </InputLeftElement>
                  <Input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                    placeholder="John"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.firstName && errors.firstName.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.lastName} isRequired>
                <FormLabel>Last Name</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FiUser />
                  </InputLeftElement>
                  <Input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                    placeholder="Doe"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.lastName && errors.lastName.message}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={errors.email} isRequired>
              <FormLabel>Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FiMail />
                </InputLeftElement>
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  placeholder="john.doe@example.com"
                />
              </InputGroup>
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.phone} isRequired>
              <FormLabel>Phone Number</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FiPhone />
                </InputLeftElement>
                <Input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  placeholder="+1234567890"
                />
              </InputGroup>
              <FormErrorMessage>
                {errors.phone && errors.phone.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.address} isRequired>
              <FormLabel>Street Address</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FiHome />
                </InputLeftElement>
                <Input
                  {...register('address', {
                    required: 'Street address is required',
                    minLength: {
                      value: 5,
                      message: 'Please enter a valid street address',
                    },
                  })}
                  placeholder="123 Main St"
                />
              </InputGroup>
              <FormErrorMessage>
                {errors.address && errors.address.message}
              </FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FormControl isInvalid={errors.city} isRequired>
                <FormLabel>City</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FiMapPin />
                  </InputLeftElement>
                  <Input
                    {...register('city', {
                      required: 'City is required',
                      minLength: {
                        value: 2,
                        message: 'Please enter a valid city name',
                      },
                    })}
                    placeholder="New York"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.city && errors.city.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.state} isRequired>
                <FormLabel>State/Province</FormLabel>
                <Controller
                  name="state"
                  control={control}
                  rules={{ required: 'State is required' }}
                  render={({ field }) => (
                    <Select {...field} placeholder="Select state">
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      {/* Add all US states */}
                    </Select>
                  )}
                />
                <FormErrorMessage>
                  {errors.state && errors.state.message}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FormControl isInvalid={errors.zipCode} isRequired>
                <FormLabel>ZIP/Postal Code</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FiMapPin />
                  </InputLeftElement>
                  <Input
                    {...register('zipCode', {
                      required: 'ZIP code is required',
                      pattern: {
                        value: /^\d{5}(-\d{4})?$/,
                        message: 'Invalid ZIP code format (e.g., 12345 or 12345-6789)',
                      },
                    })}
                    placeholder="10001"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.zipCode && errors.zipCode.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.country} isRequired>
                <FormLabel>Country</FormLabel>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: 'Country is required' }}
                  render={({ field }) => (
                    <Select {...field} placeholder="Select country">
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      {/* Add more countries as needed */}
                    </Select>
                  )}
                />
                <FormErrorMessage>
                  {errors.country && errors.country.message}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Collapse in={suggestedAddresses.length > 0} animateOpacity>
              <Box w="full" p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium" mb={4}>
                  We found some suggestions for your address. Please select the correct one:
                </Text>
                <RadioGroup
                  value={selectedAddress?.id}
                  onChange={(value) => {
                    const address = suggestedAddresses.find((a) => a.id === value);
                    handleAddressSelection(address);
                  }}
                >
                  <Stack spacing={4}>
                    {suggestedAddresses.map((address) => (
                      <Radio key={address.id} value={address.id}>
                        <Text>
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>
            </Collapse>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              isLoading={isSubmitting || verifyingAddress}
              loadingText={verifyingAddress ? 'Verifying Address...' : 'Saving...'}
              w="full"
              leftIcon={suggestedAddresses.length > 0 ? <FiCheck /> : undefined}
            >
              {suggestedAddresses.length > 0 ? 'Confirm Address' : 'Continue to Payment'}
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
};

export default ShippingForm; 