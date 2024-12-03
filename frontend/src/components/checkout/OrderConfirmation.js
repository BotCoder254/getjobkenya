import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  Card,
  CardBody,
  useColorModeValue,
  Heading,
  Divider,
  HStack,
  Badge,
  Image,
  SimpleGrid,
  Progress,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  useToast,
  Link,
  Skeleton,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiPackage,
  FiMail,
  FiTruck,
  FiClock,
  FiMapPin,
  FiDownload,
  FiPrinter,
  FiShare2,
  FiAlertCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const OrderConfirmation = ({ orderNumber, shippingData, items, total }) => {
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('green.500', 'green.300');
  const stepBg = useColorModeValue('gray.50', 'gray.700');
  const progressColor = useColorModeValue('brand.500', 'brand.400');

  useEffect(() => {
    if (orderNumber) {
      fetchOrderStatus();
    }
  }, [orderNumber]);

  const fetchOrderStatus = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.orders.detail(orderNumber));
      setOrderStatus(response.status);
      setTrackingInfo(response.tracking);
      setEstimatedDelivery(response.estimatedDelivery);
    } catch (error) {
      console.error('Error fetching order status:', error);
      toast({
        title: 'Error fetching order status',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrderProgress = () => {
    const statuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(orderStatus?.toLowerCase());
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.orders.invoice(orderNumber), {
        method: 'GET',
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Error downloading invoice',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleShareOrder = async () => {
    try {
      await navigator.share({
        title: `Order #${orderNumber}`,
        text: 'Check out my order status',
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const steps = [
    {
      icon: FiCheck,
      title: 'Order Confirmed',
      description: 'Your order has been successfully placed',
      status: 'completed',
      timestamp: orderStatus?.confirmedAt,
    },
    {
      icon: FiMail,
      title: 'Confirmation Email',
      description: 'You will receive an email confirmation shortly',
      status: orderStatus?.emailSent ? 'completed' : 'pending',
      timestamp: orderStatus?.emailSentAt,
    },
    {
      icon: FiPackage,
      title: 'Order Processing',
      description: 'We are preparing your items for shipment',
      status: orderStatus?.status === 'processing' ? 'active' : 'pending',
      timestamp: orderStatus?.processingStartedAt,
    },
    {
      icon: FiTruck,
      title: 'Shipping',
      description: trackingInfo
        ? `Tracking number: ${trackingInfo.number}`
        : 'Your order will be shipped soon',
      status: orderStatus?.status === 'shipped' ? 'completed' : 'pending',
      timestamp: orderStatus?.shippedAt,
    },
  ];

  if (loading) {
    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={8}>
            <Skeleton height="80px" width="80px" borderRadius="full" />
            <Skeleton height="30px" width="200px" />
            <Skeleton height="20px" width="300px" />
            <Skeleton height="40px" width="150px" />
            <Divider />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="60px" width="100%" />
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardBody>
        <VStack spacing={8} align="stretch">
          {/* Success Message */}
          <VStack spacing={4} align="center">
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              bg={iconColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCheck} boxSize={10} color="white" />
            </Box>
            <Heading size="lg" textAlign="center">
              Thank You for Your Order!
            </Heading>
            <Text color="gray.500" textAlign="center">
              Your order has been successfully placed and will be processed soon.
            </Text>
            <Badge
              colorScheme="brand"
              fontSize="lg"
              p={2}
              borderRadius="md"
            >
              Order #{orderNumber}
            </Badge>
          </VStack>

          <Divider />

          {/* Order Progress */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="medium">Order Progress</Text>
              <Text color="gray.500" fontSize="sm">
                {orderStatus?.status.charAt(0).toUpperCase() +
                  orderStatus?.status.slice(1)}
              </Text>
            </HStack>
            <Progress
              value={getOrderProgress()}
              colorScheme="brand"
              borderRadius="full"
              size="sm"
              mb={4}
            />
          </Box>

          {/* Estimated Delivery */}
          {estimatedDelivery && (
            <Alert status="info" borderRadius="md">
              <AlertIcon as={FiClock} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Estimated Delivery</Text>
                <Text fontSize="sm">
                  {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </VStack>
            </Alert>
          )}

          {/* Order Steps */}
          <VStack spacing={4} align="stretch">
            {steps.map((step, index) => (
              <HStack
                key={index}
                spacing={4}
                p={4}
                bg={stepBg}
                borderRadius="md"
                opacity={step.status === 'pending' ? 0.7 : 1}
              >
                <Box
                  p={2}
                  borderRadius="full"
                  bg={
                    step.status === 'completed'
                      ? iconColor
                      : step.status === 'active'
                      ? 'blue.500'
                      : 'gray.400'
                  }
                  color="white"
                >
                  <Icon as={step.icon} boxSize={5} />
                </Box>
                <Box flex={1}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{step.title}</Text>
                    {step.timestamp && (
                      <Text fontSize="sm" color="gray.500">
                        {new Date(step.timestamp).toLocaleString()}
                      </Text>
                    )}
                  </HStack>
                  <Text color="gray.500" fontSize="sm">
                    {step.description}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>

          {/* Tracking Information */}
          {trackingInfo && (
            <>
              <Divider />
              <Box>
                <Heading size="sm" mb={4}>
                  Tracking Information
                </Heading>
                <List spacing={3}>
                  <ListItem>
                    <HStack>
                      <ListIcon as={FiTruck} color={iconColor} />
                      <Text fontWeight="medium">Carrier:</Text>
                      <Text>{trackingInfo.carrier}</Text>
                    </HStack>
                  </ListItem>
                  <ListItem>
                    <HStack>
                      <ListIcon as={FiPackage} color={iconColor} />
                      <Text fontWeight="medium">Tracking Number:</Text>
                      <Link
                        color="brand.500"
                        href={trackingInfo.trackingUrl}
                        isExternal
                      >
                        {trackingInfo.number}
                      </Link>
                    </HStack>
                  </ListItem>
                  <ListItem>
                    <HStack>
                      <ListIcon as={FiMapPin} color={iconColor} />
                      <Text fontWeight="medium">Current Location:</Text>
                      <Text>{trackingInfo.currentLocation}</Text>
                    </HStack>
                  </ListItem>
                </List>
              </Box>
            </>
          )}

          {/* Order Items */}
          <Box>
            <Heading size="sm" mb={4}>
              Order Items
            </Heading>
            <VStack spacing={4} align="stretch">
              {items.map((item) => (
                <HStack key={item._id} spacing={4}>
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    boxSize="60px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/60"
                  />
                  <Box flex={1}>
                    <Text fontWeight="medium">{item.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Quantity: {item.quantity}
                    </Text>
                  </Box>
                  <Text fontWeight="medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </HStack>
              ))}
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="bold">Total</Text>
                <Text fontWeight="bold" fontSize="lg">
                  ${total.toFixed(2)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Shipping Information */}
          {shippingData && (
            <>
              <Divider />
              <Box>
                <Heading size="sm" mb={4}>
                  Shipping Details
                </Heading>
                <VStack align="stretch" spacing={2}>
                  <Text>
                    {shippingData.firstName} {shippingData.lastName}
                  </Text>
                  <Text>{shippingData.address}</Text>
                  <Text>
                    {shippingData.city}, {shippingData.state}{' '}
                    {shippingData.zipCode}
                  </Text>
                  <Text>{shippingData.country}</Text>
                  <Text>{shippingData.phone}</Text>
                </VStack>
              </Box>
            </>
          )}

          <Divider />

          {/* Action Buttons */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <VStack spacing={4}>
              <Button
                colorScheme="brand"
                leftIcon={<FiTruck />}
                onClick={() => navigate('/dashboard/orders')}
                width="full"
              >
                Track Order
              </Button>
              <Button
                variant="outline"
                colorScheme="brand"
                leftIcon={<FiPackage />}
                onClick={() => navigate('/products')}
                width="full"
              >
                Continue Shopping
              </Button>
            </VStack>
            <VStack spacing={4}>
              <Button
                leftIcon={<FiDownload />}
                onClick={handleDownloadInvoice}
                width="full"
              >
                Download Invoice
              </Button>
              <HStack spacing={4} width="full">
                <Button
                  leftIcon={<FiPrinter />}
                  onClick={handlePrintOrder}
                  flex={1}
                >
                  Print
                </Button>
                <Button
                  leftIcon={<FiShare2 />}
                  onClick={handleShareOrder}
                  flex={1}
                >
                  Share
                </Button>
              </HStack>
            </VStack>
          </SimpleGrid>

          {/* Support Information */}
          <Alert status="info" variant="subtle">
            <AlertIcon as={FiAlertCircle} />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Need Help?</Text>
              <Text fontSize="sm">
                If you have any questions about your order, please contact our
                customer support at{' '}
                <Link color="brand.500" href="mailto:support@example.com">
                  support@example.com
                </Link>
              </Text>
            </VStack>
          </Alert>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderConfirmation; 