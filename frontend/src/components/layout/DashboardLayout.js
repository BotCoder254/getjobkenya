import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loading } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (loading) {
    return null;
  }

  const MobileHeader = () => (
    <Flex
      px={4}
      height="20"
      alignItems="center"
      bg={headerBg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent="space-between"
    >
      <IconButton
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />
    </Flex>
  );

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Desktop sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="60"
        position="fixed"
        h="full"
      >
        <Sidebar />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Main content area */}
      <Box ml={{ base: 0, lg: '60' }}>
        {/* Mobile header with menu button */}
        {isMobile && <MobileHeader />}

        {/* Page content */}
        <Box p={4}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 