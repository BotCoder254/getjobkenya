import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  useToast,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Box,
  IconButton,
  Badge,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiShare2,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems((prevItems) => {
      if (prevItems.some((item) => item._id === product._id)) {
        toast({
          title: 'Already in Wishlist',
          description: `${product.name} is already in your wishlist`,
          status: 'info',
          duration: 2000,
          isClosable: true,
          position: 'top-right',
        });
        return prevItems;
      }

      toast({
        title: 'Added to Wishlist',
        description: `${product.name} has been added to your wishlist`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      return [...prevItems, product];
    });

    onOpen();
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prevItems) => {
      const removedItem = prevItems.find((item) => item._id === productId);
      const updatedItems = prevItems.filter((item) => item._id !== productId);

      toast({
        title: 'Removed from Wishlist',
        description: `${removedItem.name} has been removed from your wishlist`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      return updatedItems;
    });
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
    toast({
      title: 'Wishlist Cleared',
      description: 'All items have been removed from your wishlist',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    toast({
      title: 'Moved to Cart',
      description: `${product.name} has been moved to your cart`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const WishlistDrawer = () => (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <HStack spacing={2}>
            <FiHeart />
            <Text>Wishlist</Text>
            {wishlistItems.length > 0 && (
              <Badge colorScheme="red" ml={2}>
                {wishlistItems.length} items
              </Badge>
            )}
          </HStack>
        </DrawerHeader>

        <DrawerBody>
          {wishlistItems.length === 0 ? (
            <VStack spacing={4} py={8}>
              <Text color={textColor}>Your wishlist is empty</Text>
              <Button
                colorScheme="brand"
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
              >
                Continue Shopping
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              {wishlistItems.map((item) => (
                <Box
                  key={item._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={borderColor}
                >
                  <HStack spacing={4}>
                    <Image
                      src={item.images[0]?.url}
                      alt={item.name}
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack flex={1} align="start" spacing={1}>
                      <Text fontWeight="medium">{item.name}</Text>
                      <Text color={textColor}>${item.price.toFixed(2)}</Text>
                      <HStack>
                        <Button
                          size="sm"
                          leftIcon={<FiShoppingCart />}
                          colorScheme="brand"
                          variant="outline"
                          onClick={() => moveToCart(item)}
                        >
                          Move to Cart
                        </Button>
                        <IconButton
                          icon={<FiShare2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/products/${item._id}`
                            );
                            toast({
                              title: 'Link Copied',
                              description: 'Product link copied to clipboard',
                              status: 'success',
                              duration: 2000,
                              isClosable: true,
                            });
                          }}
                        />
                      </HStack>
                    </VStack>
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeFromWishlist(item._id)}
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </DrawerBody>

        {wishlistItems.length > 0 && (
          <DrawerFooter borderTopWidth="1px">
            <VStack spacing={4} w="full">
              <Button
                colorScheme="red"
                variant="outline"
                onClick={clearWishlist}
                w="full"
              >
                Clear Wishlist
              </Button>
              <Button
                colorScheme="brand"
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
                w="full"
              >
                Continue Shopping
              </Button>
            </VStack>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        moveToCart,
        loading,
        openWishlist: onOpen,
      }}
    >
      {children}
      <WishlistDrawer />
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 