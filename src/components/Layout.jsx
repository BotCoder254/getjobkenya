import React from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Flex>
        {user && (
          <Box
            w={{ base: 'full', md: 60 }}
            display={{ base: 'none', md: 'block' }}
          >
            <Sidebar />
          </Box>
        )}
        <Box
          flex="1"
          ml={{ base: 0, md: user ? 60 : 0 }}
          p={4}
          transition=".3s ease"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout; 