import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Link,
  Divider,
  useColorModeValue,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiUsers,
  FiGrid,
  FiLogOut,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ icon, children, to, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.700', 'brand.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link
      as={to ? RouterLink : 'button'}
      to={to}
      onClick={onClick}
      w="full"
      _hover={{ textDecoration: 'none', bg: hoverBg }}
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : undefined}
      p={3}
      borderRadius="md"
      display="flex"
      alignItems="center"
    >
      <Icon as={icon} boxSize={5} mr={3} />
      <Text fontWeight="medium">{children}</Text>
    </Link>
  );
};

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userNavItems = [
    { icon: FiHome, label: 'Dashboard', to: '/dashboard' },
    { icon: FiShoppingBag, label: 'Products', to: '/products' },
    { icon: FiShoppingCart, label: 'Cart', to: '/cart' },
    { icon: FiPackage, label: 'My Orders', to: '/dashboard/orders' },
    { icon: FiUser, label: 'Profile', to: '/profile' },
  ];

  const adminNavItems = [
    { icon: FiGrid, label: 'Admin Dashboard', to: '/admin' },
    { icon: FiShoppingBag, label: 'Manage Products', to: '/admin/products' },
    { icon: FiPackage, label: 'Manage Orders', to: '/admin/orders' },
    { icon: FiUsers, label: 'Manage Users', to: '/admin/users' },
    { icon: FiGrid, label: 'Manage Categories', to: '/admin/categories' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      w="60"
      h="full"
      position="fixed"
      overflowY="auto"
    >
      <Flex justify="space-between" p={4}>
        <Text fontSize="xl" fontWeight="bold">
          {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
        </Text>
        {onClose && (
          <IconButton
            icon={<FiX />}
            variant="ghost"
            onClick={onClose}
            aria-label="Close menu"
          />
        )}
      </Flex>
      <VStack spacing={1} align="stretch" p={4}>
        {navItems.map((item) => (
          <NavItem key={item.to} icon={item.icon} to={item.to}>
            {item.label}
          </NavItem>
        ))}
        <Divider my={4} />
        <NavItem icon={FiLogOut} onClick={handleLogout}>
          Logout
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar; 