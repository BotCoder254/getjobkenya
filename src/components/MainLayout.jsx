import React from 'react';
import { Box, Flex, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Flex>
        {user && !isMobile && <Sidebar />}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ml={user && !isMobile ? '64' : 0}
          w="full"
          p={8}
          pb={isMobile ? '24' : '8'}
          transition="margin 0.3s"
        >
          {children}
        </MotionBox>
      </Flex>
      {user && isMobile && <MobileNav />}
      {!user && <Footer />}
    </Box>
  );
};

export default MainLayout; 