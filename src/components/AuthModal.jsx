import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Radio,
  Text,
  Divider,
  useToast,
  Box,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { FaGoogle, FaGithub, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('applicant');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle, signInWithGithub, signUpWithEmail } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        toast({
          title: 'Welcome back!',
          description: "You've successfully signed in.",
          status: 'success',
          duration: 3000,
        });
      } else {
        await signUpWithEmail(email, password, userType);
        toast({
          title: 'Account created!',
          description: "You've successfully signed up.",
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      onClose();
      toast({
        title: 'Welcome!',
        description: "You've successfully signed in with Google.",
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGithub();
      onClose();
      toast({
        title: 'Welcome!',
        description: "You've successfully signed in with GitHub.",
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader textAlign="center">
          {mode === 'signin' ? 'Welcome Back!' : 'Create Account'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stack spacing={4}>
              <Button
                leftIcon={<FaGoogle />}
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                w="full"
                colorScheme="red"
                variant="outline"
              >
                Continue with Google
              </Button>

              <Button
                leftIcon={<FaGithub />}
                onClick={handleGithubSignIn}
                isLoading={isLoading}
                w="full"
                colorScheme="gray"
                variant="outline"
              >
                Continue with GitHub
              </Button>

              <Divider />

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaEnvelope} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaLock} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                      />
                    </InputGroup>
                  </FormControl>

                  {mode === 'signup' && (
                    <FormControl as="fieldset">
                      <FormLabel as="legend">Account Type</FormLabel>
                      <RadioGroup value={userType} onChange={setUserType}>
                        <Stack direction="row" spacing={4}>
                          <Radio value="applicant">Job Seeker</Radio>
                          <Radio value="company">Company</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  )}

                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    w="full"
                  >
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Button>
                </Stack>
              </form>

              <Text textAlign="center" fontSize="sm">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      colorScheme="blue"
                      onClick={() => setMode('signup')}
                    >
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button
                      variant="link"
                      colorScheme="blue"
                      onClick={() => setMode('signin')}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Text>
            </Stack>
          </MotionBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal; 
