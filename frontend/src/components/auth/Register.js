import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
  Divider,
  HStack,
  useToast,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  Select,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const onSubmit = async (data) => {
    try {
      const role = await registerUser(data);
      
      // Role-based navigation
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'seller':
          navigate('/seller/dashboard');
          break;
        case 'customer':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login here
    console.log(`${provider} login clicked`);
  };

  return (
    <Container maxW="container.sm" py={12}>
      <Box
        bg={bgColor}
        p={8}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VStack spacing={6}>
          <VStack spacing={2} align="center" w="full">
            <Heading size="xl">Create Account</Heading>
            <Text color="gray.600">
              Join us to start shopping
            </Text>
          </VStack>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isInvalid={errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
                <FormErrorMessage>
                  {errors.name && errors.name.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {errors.password && errors.password.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || 'Passwords do not match',
                  })}
                />
                <FormErrorMessage>
                  {errors.confirmPassword && errors.confirmPassword.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.role}>
                <FormLabel>Account Type</FormLabel>
                <Select
                  {...register('role', {
                    required: 'Please select an account type',
                  })}
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                </Select>
                <FormErrorMessage>
                  {errors.role && errors.role.message}
                </FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <VStack w="full" spacing={4}>
            <Divider />
            <Text>Or sign up with</Text>

            <HStack spacing={4} w="full">
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGoogle />}
                onClick={() => handleSocialLogin('google')}
              >
                Google
              </Button>
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaFacebook />}
                onClick={() => handleSocialLogin('facebook')}
              >
                Facebook
              </Button>
            </HStack>
          </VStack>

          <Text>
            Already have an account?{' '}
            <Link
              as={RouterLink}
              to="/login"
              color="blue.500"
              fontWeight="semibold"
            >
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default Register; 