import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
  Image,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorModeValue,
  Badge,
  Stack,
  Skeleton,
  Alert,
  AlertIcon,
  Tooltip,
  Icon,
  List,
  ListItem,
  Button,
} from '@chakra-ui/react';
import { FiInfo, FiTruck, FiClock, FiShield } from 'react-icons/fi';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const OrderSummary = ({ cartItems, cartTotal, shippingData, stockStatus }) => {
  const [loading, setLoading] = useState(true);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [taxRate, setTaxRate] = useState(0);
  const [promoCode, setPromoCode] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtotalColor = useColorModeValue('gray.600', 'gray.400');
  const totalBgColor = useColorModeValue('gray.50', 'gray.700');
  const highlightColor = useColorModeValue('brand.50', 'brand.900');

  useEffect(() => {
    if (shippingData) {
      calculateShippingAndTax();
    }
  }, [shippingData, cartItems]);

  const calculateShippingAndTax = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.checkout.shipping, {
        method: 'POST',
        body: JSON.stringify({
          items: cartItems,
          address: shippingData,
          subtotal: cartTotal,
        }),
      });

      setShippingRates(response.shippingRates);
      setSelectedShipping(response.shippingRates[0]);
      setTaxRate(response.taxRate);
      setEstimatedDelivery(response.estimatedDelivery);
    } catch (error) {
      console.error('Error calculating shipping:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShippingCost = () => {
    if (!selectedShipping) return 0;
    return selectedShipping.cost;
  };

  const getTaxAmount = () => {
    const taxableAmount = getSubtotal() + getShippingCost();
    return taxableAmount * taxRate;
  };

  const getDiscountAmount = () => {
    if (!promoCode) return 0;
    return (getSubtotal() * promoCode.discountPercentage) / 100;
  };

  const getFinalTotal = () => {
    return getSubtotal() + getShippingCost() + getTaxAmount() - getDiscountAmount();
  };

  const getEstimatedDeliveryDate = () => {
    if (!estimatedDelivery) return null;
    const date = new Date();
    date.setDate(date.getDate() + estimatedDelivery.minDays);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + estimatedDelivery.maxDays);
    
    return {
      minDate: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      maxDate: maxDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  };

  if (loading) {
    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Skeleton height="24px" width="200px" />
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="60px" width="100%" />
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardHeader>
        <Heading size="md">Order Summary</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Items List */}
          <VStack spacing={4} align="stretch">
            {cartItems.map((item) => (
              <HStack key={item._id} spacing={4}>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  boxSize="60px"
                  objectFit="cover"
                  borderRadius="md"
                  fallbackSrc="https://via.placeholder.com/60"
                />
                <Stack flex={1} spacing={0}>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">{item.name}</Text>
                    <Badge
                      colorScheme={
                        stockStatus && stockStatus[item._id] >= item.quantity
                          ? 'green'
                          : 'red'
                      }
                    >
                      {stockStatus && stockStatus[item._id] >= item.quantity
                        ? 'In Stock'
                        : 'Low Stock'}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color={subtotalColor}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </Text>
                </Stack>
                <Text fontWeight="medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>

          <Divider />

          {/* Shipping Options */}
          {shippingRates.length > 0 && (
            <Box>
              <Text fontWeight="medium" mb={2}>
                Shipping Method
              </Text>
              <VStack align="stretch" spacing={2}>
                {shippingRates.map((rate) => (
                  <Box
                    key={rate.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={
                      selectedShipping?.id === rate.id
                        ? 'brand.500'
                        : borderColor
                    }
                    bg={
                      selectedShipping?.id === rate.id
                        ? highlightColor
                        : 'transparent'
                    }
                    cursor="pointer"
                    onClick={() => setSelectedShipping(rate)}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiTruck} />
                        <Text fontWeight="medium">{rate.name}</Text>
                      </HStack>
                      <Text>
                        {rate.cost === 0 ? (
                          <Badge colorScheme="green">Free</Badge>
                        ) : (
                          `$${rate.cost.toFixed(2)}`
                        )}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={subtotalColor} mt={1}>
                      {rate.description}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* Price Breakdown */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text color={subtotalColor}>Subtotal</Text>
              <Text>${getSubtotal().toFixed(2)}</Text>
            </HStack>
            <HStack justify="space-between">
              <HStack>
                <Text color={subtotalColor}>Shipping</Text>
                <Tooltip label="Shipping cost is calculated based on your location and selected shipping method">
                  <Icon as={FiInfo} color={subtotalColor} />
                </Tooltip>
              </HStack>
              <Text>
                {getShippingCost() === 0 ? (
                  <Badge colorScheme="green">Free</Badge>
                ) : (
                  `$${getShippingCost().toFixed(2)}`
                )}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <HStack>
                <Text color={subtotalColor}>Tax</Text>
                <Tooltip label={`Tax rate: ${(taxRate * 100).toFixed(2)}%`}>
                  <Icon as={FiInfo} color={subtotalColor} />
                </Tooltip>
              </HStack>
              <Text>${getTaxAmount().toFixed(2)}</Text>
            </HStack>
            {promoCode && (
              <HStack justify="space-between" color="green.500">
                <Text>Discount ({promoCode.code})</Text>
                <Text>-${getDiscountAmount().toFixed(2)}</Text>
              </HStack>
            )}
          </VStack>

          <Divider />

          {/* Total */}
          <Box p={4} bg={totalBgColor} borderRadius="md">
            <VStack spacing={2}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="bold" fontSize="lg">
                  Total
                </Text>
                <Text fontWeight="bold" fontSize="lg" color="brand.500">
                  ${getFinalTotal().toFixed(2)}
                </Text>
              </HStack>
              {estimatedDelivery && (
                <HStack
                  w="full"
                  fontSize="sm"
                  color={subtotalColor}
                  spacing={1}
                >
                  <Icon as={FiClock} />
                  <Text>
                    Estimated delivery:{' '}
                    {`${getEstimatedDeliveryDate().minDate} - ${
                      getEstimatedDeliveryDate().maxDate
                    }`}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Shipping Address */}
          {shippingData && (
            <>
              <Divider />
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Shipping To:
                </Text>
                <VStack align="stretch" spacing={1}>
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

          {/* Order Protection */}
          <Alert status="info" borderRadius="md">
            <AlertIcon as={FiShield} />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Secure Order</Text>
              <Text fontSize="sm">
                Your order is protected by our secure payment system
              </Text>
            </VStack>
          </Alert>

          {/* Additional Information */}
          <List spacing={2} fontSize="sm" color={subtotalColor}>
            <ListItem>
              <HStack>
                <Icon as={FiTruck} />
                <Text>Free shipping on orders over $100</Text>
              </HStack>
            </ListItem>
            <ListItem>
              <HStack>
                <Icon as={FiShield} />
                <Text>Money-back guarantee</Text>
              </HStack>
            </ListItem>
          </List>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderSummary; 