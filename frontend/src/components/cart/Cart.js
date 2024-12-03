import React from 'react';
import { Box, VStack, HStack, Text, Button, Image, IconButton, useToast } from '@chakra-ui/react';
import { DeleteIcon, AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import EmptyState from '../common/EmptyState';

const Cart = () => {
  const { items, loading, error, addItem, updateItem, removeItem, getTotal } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  if (loading) {
    return <Box p={5}>Loading...</Box>;
  }

  if (error) {
    return <Box p={5} color="red.500">Error: {error}</Box>;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some items to your cart to get started"
        button={{
          label: "Start Shopping",
          onClick: () => navigate('/products')
        }}
      />
    );
  }

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      await updateItem(productId, newQuantity);
      toast({
        title: 'Cart updated',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error updating cart',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeItem(productId);
      toast({
        title: 'Item removed',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error removing item',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">
        {items.map((item) => (
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
              <Text color="gray.600">${item.price}</Text>
            </VStack>
            <HStack>
              <IconButton
                icon={<MinusIcon />}
                onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                size="sm"
              />
              <Text>{item.quantity}</Text>
              <IconButton
                icon={<AddIcon />}
                onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                size="sm"
              />
              <IconButton
                icon={<DeleteIcon />}
                onClick={() => handleRemoveItem(item.productId)}
                colorScheme="red"
                size="sm"
              />
            </HStack>
          </HStack>
        ))}
        <Box borderTopWidth={1} pt={4}>
          <HStack justify="space-between">
            <Text fontWeight="bold">Total:</Text>
            <Text fontWeight="bold">${getTotal().toFixed(2)}</Text>
          </HStack>
          <Button
            colorScheme="blue"
            size="lg"
            width="full"
            mt={4}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Cart; 