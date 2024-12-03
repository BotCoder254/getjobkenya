import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Spinner,
  Center,
  VStack,
  Text,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  if (loading) {
    return (
      <Center minH="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500"
            size="xl"
          />
          <Text color="gray.500">Loading...</Text>
        </VStack>
      </Center>
    );
  }

  if (!user || user.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You need admin privileges to access this area.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute; 