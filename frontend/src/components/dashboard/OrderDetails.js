import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Button,
  useToast,
  Heading,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { orderService } from '../../services/orderService';
import EmptyState from '../common/EmptyState';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { order, loading, error } = useOrderTracking(orderId);
  const toast = useToast();

  if (loading) {
    return <Box p={5}>Loading order details...</Box>;
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Order"
        description={error}
        button={{
          label: "Try Again",
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="We couldn't find the order you're looking for"
        button={{
          label: "View All Orders",
          onClick: () => window.location.href = '/orders'
        }}
      />
    );
  }

  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(orderId);
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been successfully cancelled',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel order',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'yellow',
      'processing': 'blue',
      'shipped': 'green',
      'delivered': 'green',
      'cancelled': 'red',
    };
    return statusColors[status.toLowerCase()] || 'gray';
  };

  return (
    <Box p={5}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Order #{order.orderNumber}</Heading>
            <Text color="gray.600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </VStack>
          <Badge
            colorScheme={getStatusColor(order.status)}
            p={2}
            borderRadius="md"
          >
            {order.status}
          </Badge>
        </HStack>

        <Divider />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <Heading size="md" mb={4}>Shipping Details</Heading>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">{order.shippingAddress.fullName}</Text>
              <Text>{order.shippingAddress.street}</Text>
              <Text>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Text>
              <Text>{order.shippingAddress.country}</Text>
            </VStack>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Payment Information</Heading>
            <VStack align="start" spacing={2}>
              <Text>Payment Method: {order.paymentMethod}</Text>
              <Text>Payment Status: {order.paymentStatus}</Text>
            </VStack>
          </Box>
        </SimpleGrid>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>Order Items</Heading>
          <VStack spacing={4} align="stretch">
            {order.items.map((item) => (
              <HStack key={item.productId} p={4} borderWidth={1} borderRadius="md">
                <Image
                  src={item.image}
                  alt={item.name}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <VStack flex={1} align="start" spacing={1}>
                  <Text fontWeight="bold">{item.name}</Text>
                  <Text color="gray.600">
                    Quantity: {item.quantity} x ${item.price}
                  </Text>
                </VStack>
                <Text fontWeight="bold">
                  ${(item.quantity * item.price).toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Divider />

        <Box>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text>Subtotal</Text>
              <Text>${order.subtotal.toFixed(2)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Shipping</Text>
              <Text>${order.shippingCost.toFixed(2)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Tax</Text>
              <Text>${order.tax.toFixed(2)}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" fontWeight="bold">
              <Text>Total</Text>
              <Text>${order.total.toFixed(2)}</Text>
            </HStack>
          </VStack>
        </Box>

        {order.status === 'pending' && (
          <Button
            colorScheme="red"
            onClick={handleCancelOrder}
          >
            Cancel Order
          </Button>
        )}

        {order.trackingNumber && (
          <Box p={4} borderWidth={1} borderRadius="md">
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">Tracking Information</Text>
              <Text>Tracking Number: {order.trackingNumber}</Text>
              <Text>Carrier: {order.shippingCarrier}</Text>
              <Button
                colorScheme="blue"
                onClick={() => window.open(order.trackingUrl, '_blank')}
              >
                Track Package
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default OrderDetails; 