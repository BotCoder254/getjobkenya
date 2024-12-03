import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import {
  FiShoppingBag,
  FiTruck,
  FiHeart,
  FiCreditCard,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import API_ENDPOINTS from '../../config/api';

const StatCard = ({ title, value, icon, helpText, loading }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      position="relative"
      overflow="hidden"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Stat>
          <StatLabel color={textColor}>{title}</StatLabel>
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <StatNumber fontSize="2xl" fontWeight="bold">
              {value}
            </StatNumber>
          )}
          {helpText && (
            <StatHelpText mb={0} color={textColor}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Icon
          as={icon}
          w={8}
          h={8}
          color={useColorModeValue('brand.500', 'brand.200')}
        />
      </Flex>
    </Box>
  );
};

const OrderCard = ({ order, bgColor, textColor, statusBg, statusColor }) => (
  <Box
    key={order._id}
    p={4}
    bg={bgColor}
    borderRadius="lg"
    boxShadow="sm"
  >
    <Flex justify="space-between" align="center">
      <VStack align="start" spacing={1}>
        <Text fontWeight="medium">Order #{order._id.slice(-6)}</Text>
        <Text fontSize="sm" color={textColor}>
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </VStack>
      <Text
        px={3}
        py={1}
        borderRadius="full"
        fontSize="sm"
        bg={statusBg}
        color={statusColor}
      >
        {order.status}
      </Text>
    </Flex>
  </Box>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const { itemCount: cartItems } = useCart();
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    recentOrders: [],
    loading: true,
  });

  // Color mode values
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const statusBg = useColorModeValue('brand.50', 'brand.900');
  const statusColor = useColorModeValue('brand.700', 'brand.200');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          fetch(API_ENDPOINTS.orders.list, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          fetch(API_ENDPOINTS.wishlist.get, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);

        const [ordersData, wishlistData] = await Promise.all([
          ordersRes.json(),
          wishlistRes.json(),
        ]);

        setStats({
          orders: ordersData.total || 0,
          wishlist: wishlistData.items?.length || 0,
          recentOrders: ordersData.orders?.slice(0, 5) || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.name}!
          </Heading>
          <Text color={textColor}>
            Here's what's happening with your account today.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <StatCard
            title="Cart Items"
            value={cartItems}
            icon={FiShoppingBag}
            loading={false}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            icon={FiTruck}
            loading={stats.loading}
          />
          <StatCard
            title="Wishlist Items"
            value={stats.wishlist}
            icon={FiHeart}
            loading={stats.loading}
          />
          <StatCard
            title="Payment Methods"
            value="2"
            icon={FiCreditCard}
            loading={false}
          />
        </SimpleGrid>

        {/* Recent Orders Section */}
        <Box>
          <Heading size="md" mb={4}>
            Recent Orders
          </Heading>
          {stats.loading ? (
            <Spinner />
          ) : stats.recentOrders.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {stats.recentOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  bgColor={cardBgColor}
                  textColor={textColor}
                  statusBg={statusBg}
                  statusColor={statusColor}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text color={textColor}>
              No recent orders found.
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default UserDashboard; 