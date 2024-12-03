import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  Divider,
  useColorModeValue,
  Portal,
} from '@chakra-ui/react';
import {
  FiShoppingCart,
  FiTrash2,
  FiArrowRight,
  FiShoppingBag,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const MiniCart = () => {
  const { cartItems, removeFromCart, cartTotal, itemCount } = useCart();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          variant="ghost"
          position="relative"
          p={2}
          aria-label="Shopping cart"
        >
          <FiShoppingCart size={20} />
          {itemCount > 0 && (
            <Badge
              colorScheme="brand"
              position="absolute"
              top={0}
              right={0}
              transform="translate(25%, -25%)"
              borderRadius="full"
              fontSize="xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          width="350px"
          bg={bgColor}
          borderColor={borderColor}
          _focus={{ boxShadow: 'lg' }}
        >
          <PopoverArrow bg={bgColor} />
          <PopoverCloseButton />
          <PopoverHeader borderBottomWidth="1px">
            <HStack justify="space-between">
              <Text fontWeight="bold">Shopping Cart</Text>
              <Badge colorScheme="brand">{itemCount} items</Badge>
            </HStack>
          </PopoverHeader>
          <PopoverBody maxH="400px" overflowY="auto">
            {cartItems.length === 0 ? (
              <VStack py={8} spacing={4}>
                <FiShoppingBag size={40} color="gray.400" />
                <Text color="gray.500">Your cart is empty</Text>
                <Button
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  Start Shopping
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch" py={2}>
                {cartItems.map((item) => (
                  <HStack key={item._id} spacing={3}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack flex={1} spacing={0} align="start">
                      <Text fontWeight="medium" noOfLines={1}>
                        {item.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </Text>
                    </VStack>
                    <Text fontWeight="bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <IconButton
                      icon={<FiTrash2 />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      aria-label="Remove item"
                      onClick={() => removeFromCart(item._id)}
                    />
                  </HStack>
                ))}
              </VStack>
            )}
          </PopoverBody>
          {cartItems.length > 0 && (
            <>
              <Divider />
              <PopoverFooter>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Subtotal:</Text>
                    <Text fontWeight="bold" fontSize="lg">
                      ${cartTotal.toFixed(2)}
                    </Text>
                  </HStack>
                  <Button
                    colorScheme="brand"
                    rightIcon={<FiArrowRight />}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                  <Button variant="ghost" onClick={handleViewCart}>
                    View Cart
                  </Button>
                </VStack>
              </PopoverFooter>
            </>
          )}
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default MiniCart; 