import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  FaHome,
  FaBriefcase,
  FaUsers,
  FaUserCircle,
  FaBookmark,
  FaHistory,
  FaBuilding,
  FaChartLine,
} from 'react-icons/fa';

const MotionBox = motion(Box);

const MobileNavItem = ({ icon, label, to, isActive }) => {
  const activeColor = useColorModeValue('blue.500', 'blue.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <VStack
      as={Link}
      to={to}
      spacing={1}
      flex={1}
      align="center"
      color={isActive ? activeColor : inactiveColor}
      _hover={{ color: activeColor }}
    >
      <MotionBox
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon as={icon} fontSize="20px" />
      </MotionBox>
      <Text fontSize="xs" fontWeight={isActive ? "bold" : "normal"}>
        {label}
      </Text>
    </VStack>
  );
};

const getNavItems = (userType) => {
  switch (userType) {
    case 'admin':
      return [
        { icon: FaHome, label: 'Dashboard', path: '/admin' },
        { icon: FaBriefcase, label: 'Jobs', path: '/admin/jobs' },
        { icon: FaUsers, label: 'Users', path: '/admin/users' },
        { icon: FaChartLine, label: 'Analytics', path: '/admin/analytics' },
      ];
    case 'company':
      return [
        { icon: FaHome, label: 'Dashboard', path: '/company' },
        { icon: FaBriefcase, label: 'Jobs', path: '/company/jobs' },
        { icon: FaUsers, label: 'Applications', path: '/company/applications' },
        { icon: FaBuilding, label: 'Profile', path: '/company/profile' },
      ];
    case 'applicant':
      return [
        { icon: FaHome, label: 'Home', path: '/jobs' },
        { icon: FaBookmark, label: 'Saved', path: '/jobs/saved' },
        { icon: FaHistory, label: 'Applications', path: '/jobs/applications' },
        { icon: FaUserCircle, label: 'Profile', path: '/profile' },
      ];
    default:
      return [];
  }
};

const MobileNav = () => {
  const { userType } = useAuth();
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = getNavItems(userType);

  return (
    <MotionBox
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height="16"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      px={4}
      zIndex={1000}
    >
      <Flex h="full" align="center" justify="space-around">
        {navItems.map((item) => (
          <MobileNavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            to={item.path}
            isActive={location.pathname === item.path}
          />
        ))}
      </Flex>
    </MotionBox>
  );
};

export default MobileNav; 