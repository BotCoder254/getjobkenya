import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Divider,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaBriefcase,
  FaUsers,
  FaUserCircle,
  FaCog,
  FaChartBar,
  FaBookmark,
  FaHistory,
  FaBuilding,
  FaClipboardList,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const SidebarLink = ({ icon, children, to, isActive }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.800');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        as={RouterLink}
        to={to}
        style={{ textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
      >
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : undefined}
          _hover={{
            bg: isActive ? activeBg : hoverBg,
          }}
        >
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
          />
          <Text fontSize="md">{children}</Text>
        </Flex>
      </Link>
    </MotionBox>
  );
};

const getNavItems = (userType) => {
  switch (userType) {
    case 'admin':
      return [
        { name: 'Dashboard', icon: FaHome, path: '/admin' },
        { name: 'Jobs', icon: FaBriefcase, path: '/admin/jobs' },
        { name: 'Users', icon: FaUsers, path: '/admin/users' },
        { name: 'Applications', icon: FaClipboardList, path: '/admin/applications' },
        { name: 'Analytics', icon: FaChartBar, path: '/admin/analytics' },
      ];
    case 'company':
      return [
        { name: 'Dashboard', icon: FaHome, path: '/company' },
        { name: 'Job Postings', icon: FaBriefcase, path: '/company/jobs' },
        { name: 'Applications', icon: FaClipboardList, path: '/company/applications' },
        { name: 'Company Profile', icon: FaBuilding, path: '/company/profile' },
      ];
    case 'applicant':
      return [
        { name: 'Dashboard', icon: FaHome, path: '/jobs' },
        { name: 'Saved Jobs', icon: FaBookmark, path: '/jobs/saved' },
        { name: 'Applications', icon: FaHistory, path: '/jobs/applications' },
        { name: 'Profile', icon: FaUserCircle, path: '/profile' },
      ];
    default:
      return [];
  }
};

const Sidebar = () => {
  const { userType } = useAuth();
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = getNavItems(userType);

  return (
    <Box
      pos="fixed"
      h="full"
      w="64"
      borderRight="1px"
      borderRightColor={borderColor}
      bg={bgColor}
      py={8}
    >
      <VStack spacing={1} align="stretch">
        {navItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <SidebarLink
              icon={item.icon}
              to={item.path}
              isActive={location.pathname === item.path}
            >
              {item.name}
            </SidebarLink>
            {index === navItems.length - 2 && <Divider my={4} />}
          </React.Fragment>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar; 