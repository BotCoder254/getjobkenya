import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Container,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorMode,
  useDisclosure,
  Text,
  Icon,
  Divider,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMoon, 
  FaSun, 
  FaUser, 
  FaBriefcase, 
  FaSignOutAlt, 
  FaBell,
  FaEnvelope,
  FaCog,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import NotificationsCenter from './NotificationsCenter';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState('signin');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getMenuItems = () => {
    switch (userType) {
      case 'company':
        return [
          { label: 'Dashboard', icon: FaBriefcase, path: '/company' },
          { label: 'Company Profile', icon: FaUser, path: '/company/profile' },
          { label: 'Messages', icon: FaEnvelope, path: '/company/messages' },
          { label: 'Settings', icon: FaCog, path: '/company/settings' },
        ];
      case 'applicant':
        return [
          { label: 'Dashboard', icon: FaBriefcase, path: '/jobs' },
          { label: 'My Profile', icon: FaUser, path: '/profile' },
          { label: 'Messages', icon: FaEnvelope, path: '/messages' },
          { label: 'Settings', icon: FaCog, path: '/settings' },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', icon: FaBriefcase, path: '/admin' },
          { label: 'Settings', icon: FaCog, path: '/admin/settings' },
        ];
      default:
        return [];
    }
  };

  return (
    <Box
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      px={4}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Image 
            src="/logo.png" 
            h="40px" 
            alt="TalentBridge" 
            cursor="pointer"
            onClick={() => navigate('/')}
          />

          <HStack spacing={4}>
            {user && <NotificationsCenter />}

            <Button onClick={toggleColorMode} variant="ghost">
              <Icon as={colorMode === 'light' ? FaMoon : FaSun} />
            </Button>

            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <HStack spacing={3}>
                    <Avatar 
                      size="sm" 
                      src={user.photoURL} 
                      name={user.displayName}
                    />
                    <Text display={{ base: 'none', md: 'block' }}>
                      {user.displayName}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  {getMenuItems().map((item, index) => (
                    <MenuItem
                      key={index}
                      icon={<Icon as={item.icon} />}
                      onClick={() => navigate(item.path)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem 
                    icon={<Icon as={FaSignOutAlt} />} 
                    onClick={handleSignOut}
                    color="red.500"
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                colorScheme="blue"
                onClick={() => {
                  setAuthMode('signin');
                  onOpen();
                }}
              >
                Sign In
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>

      <AuthModal 
        isOpen={isOpen} 
        onClose={onClose} 
        initialMode={authMode}
      />
    </Box>
  );
};

export default Navbar; 