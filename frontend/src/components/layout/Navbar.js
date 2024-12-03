import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  useColorMode,
  Text,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Container,
  Link,
  IconButton,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiBell,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  const cartItemCount = items?.length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      bg={bgColor}
      px={4}
      position="sticky"
      top={0}
      zIndex="sticky"
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link
            as={RouterLink}
            to="/"
            fontSize="2xl"
            fontWeight="bold"
            color="brand.500"
            _hover={{ textDecoration: 'none' }}
          >
            Store
          </Link>

          {/* Search Bar */}
          <InputGroup maxW="md" mx={4}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search products..."
              borderRadius="full"
              onChange={(e) => {
                if (e.target.value) {
                  navigate(`/products?search=${e.target.value}`);
                }
              }}
            />
          </InputGroup>

          {/* Right Section */}
          <HStack spacing={4}>
            {/* Color Mode Toggle */}
            <IconButton
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle color mode"
            />

            {/* Wishlist */}
            <IconButton
              icon={<FiHeart />}
              variant="ghost"
              aria-label="Wishlist"
              onClick={() => navigate('/wishlist')}
            />

            {/* Cart */}
            <Button
              leftIcon={<FiShoppingCart />}
              variant="ghost"
              position="relative"
              onClick={() => navigate('/cart')}
            >
              Cart
              {cartItemCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="red"
                  borderRadius="full"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    name={user.name}
                    src={user.avatar}
                    cursor="pointer"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem icon={<FiShoppingCart />} onClick={() => navigate('/orders')}>
                    My Orders
                  </MenuItem>
                  <MenuItem icon={<FiHeart />} onClick={() => navigate('/wishlist')}>
                    Wishlist
                  </MenuItem>
                  <MenuItem icon={<FiSettings />} onClick={() => navigate('/settings')}>
                    Settings
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <MenuDivider />
                      <MenuItem onClick={() => navigate('/admin/dashboard')}>
                        Admin Dashboard
                      </MenuItem>
                    </>
                  )}
                  <MenuDivider />
                  <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={4}>
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 