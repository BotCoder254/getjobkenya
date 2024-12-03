import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiPackage,
  FiGrid,
  FiBarChart2,
  FiUpload,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { name: 'Dashboard', icon: FiHome, path: '/admin' },
  { name: 'Orders', icon: FiShoppingBag, path: '/admin/orders' },
  { name: 'Products', icon: FiPackage, path: '/admin/products' },
  { name: 'Categories', icon: FiGrid, path: '/admin/categories' },
  { name: 'Users', icon: FiUsers, path: '/admin/users' },
  { name: 'Analytics', icon: FiBarChart2, path: '/admin/analytics' },
  { name: 'Bulk Operations', icon: FiUpload, path: '/admin/bulk-operations' },
  { name: 'Settings', icon: FiSettings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  const activeItemBg = useColorModeValue('white', 'gray.800');

  const getCurrentPageName = () => {
    const currentPath = location.pathname;
    const currentItem = sidebarItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  const SidebarContent = ({ onClose }) => (
    <Box
      bg={sidebarBg}
      borderRight="1px"
      borderColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
    >
      <VStack h="full" spacing={0}>
        <Box p={5} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">
            LuxeCart
          </Text>
        </Box>

        <VStack spacing={1} w="full" flex={1} overflowY="auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.name}
                as={RouterLink}
                to={item.path}
                w="full"
                variant="ghost"
                justifyContent="flex-start"
                bg={isActive ? activeItemBg : 'transparent'}
                color={isActive ? 'brand.500' : 'inherit'}
                leftIcon={<Icon as={item.icon} boxSize={5} />}
                _hover={{
                  bg: activeItemBg,
                  color: 'brand.500',
                }}
                onClick={onClose}
              >
                {item.name}
              </Button>
            );
          })}
        </VStack>

        <Box p={5} w="full" borderTop="1px" borderColor={borderColor}>
          <Menu>
            <MenuButton
              as={Button}
              w="full"
              variant="ghost"
              leftIcon={<Avatar size="sm" name={user?.name} src={user?.avatar} />}
              rightIcon={<FiChevronRight />}
            >
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">{user?.name}</Text>
                <Text fontSize="xs" color="gray.500">
                  Admin
                </Text>
              </VStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiSettings />}>Settings</MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </VStack>
    </Box>
  );

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Mobile nav */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Admin Dashboard</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop nav */}
      <Box display={{ base: 'none', md: 'block' }} w={60}>
        <SidebarContent />
      </Box>

      {/* Main content */}
      <Box ml={{ base: 0, md: 60 }} p={4}>
        {/* Mobile header */}
        <Flex
          display={{ base: 'flex', md: 'none' }}
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          <IconButton
            icon={<FiMenu />}
            onClick={onOpen}
            variant="ghost"
            aria-label="Open menu"
          />
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">
            LuxeCart
          </Text>
        </Flex>

        {/* Breadcrumb */}
        <Breadcrumb
          mb={4}
          spacing="8px"
          separator={<Icon as={FiChevronRight} color="gray.500" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/admin">
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{getCurrentPageName()}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Page content */}
        <Box
          bg={bgColor}
          borderRadius="lg"
          p={4}
          shadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout; 