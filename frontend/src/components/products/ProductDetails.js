import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Image,
  Badge,
  Skeleton,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  Spacer,
  Icon,
} from '@chakra-ui/react';
import {
  FiHeart,
  FiShoppingCart,
  FiCheck,
  FiChevronRight,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from 'react-icons/fi';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import axios from 'axios';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const pageBgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
      setProduct(response.data.product);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product details. Please try again later.');
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (quantity > product.stock) {
        throw new Error('Selected quantity exceeds available stock');
      }
      await addToCart(product, quantity);
      toast({
        title: 'Added to Cart',
        description: `${product.name} has been added to your cart`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(product);
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} has been added to your wishlist`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Skeleton height="500px" />
          <VStack align="stretch" spacing={6}>
            <Skeleton height="40px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" width="60%" />
            <Skeleton height="40px" />
            <Skeleton height="100px" />
          </VStack>
        </SimpleGrid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Text color="red.500">{error || 'Product not found'}</Text>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box bg={pageBgColor}>
      <Container maxW="container.xl" py={8}>
        <Breadcrumb
          mb={8}
          spacing="8px"
          separator={<Icon as={FiChevronRight} color="gray.500" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/products">
              Products
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{product.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <VStack spacing={4}>
            <Box
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              position="relative"
            >
              <Image
                src={product.images[selectedImage]?.url}
                alt={product.name}
                width="100%"
                height="500px"
                objectFit="cover"
              />
              <IconButton
                aria-label="Add to wishlist"
                icon={<Icon as={FiHeart} />}
                position="absolute"
                top={4}
                right={4}
                colorScheme={isInWishlist(product._id) ? 'red' : 'gray'}
                variant="solid"
                onClick={handleAddToWishlist}
              />
            </Box>
            <SimpleGrid columns={4} spacing={2} w="full">
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  borderWidth="2px"
                  borderColor={selectedImage === index ? 'brand.500' : borderColor}
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    height="80px"
                    width="100%"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          <VStack align="stretch" spacing={6}>
            <VStack align="stretch" spacing={2}>
              <HStack>
                <Badge colorScheme={product.stock > 0 ? 'green' : 'red'}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <Badge colorScheme="purple">{product.category}</Badge>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                {product.name}
              </Text>
              <HStack spacing={2}>
                <HStack>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={FiStar}
                      color={i < product.rating ? 'yellow.400' : 'gray.300'}
                    />
                  ))}
                </HStack>
                <Text color={mutedColor}>({product.numReviews} reviews)</Text>
              </HStack>
            </VStack>

            <Text fontSize="2xl" fontWeight="bold" color="brand.500">
              ${product.price.toFixed(2)}
            </Text>

            <Text color={mutedColor}>{product.description}</Text>

            <Divider />

            <VStack spacing={4} align="stretch">
              <HStack>
                <Text>Quantity:</Text>
                <NumberInput
                  defaultValue={1}
                  min={1}
                  max={product.stock}
                  onChange={(value) => setQuantity(parseInt(value))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text color={mutedColor}>
                  ({product.stock} units available)
                </Text>
              </HStack>

              <Button
                leftIcon={<Icon as={FiShoppingCart} />}
                colorScheme="brand"
                size="lg"
                onClick={handleAddToCart}
                isDisabled={product.stock <= 0}
              >
                Add to Cart
              </Button>
            </VStack>

            <Divider />

            <List spacing={3}>
              <ListItem>
                <ListIcon as={FiTruck} color="brand.500" />
                Free shipping on orders over $100
              </ListItem>
              <ListItem>
                <ListIcon as={FiShield} color="brand.500" />
                2-year warranty included
              </ListItem>
              <ListItem>
                <ListIcon as={FiRefreshCw} color="brand.500" />
                30-day money-back guarantee
              </ListItem>
            </List>
          </VStack>
        </SimpleGrid>

        <Box mt={12}>
          <Tabs colorScheme="brand">
            <TabList>
              <Tab>Description</Tab>
              <Tab>Specifications</Tab>
              <Tab>Reviews</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Text color={mutedColor}>{product.description}</Text>
              </TabPanel>
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {product.specifications?.map((spec, index) => (
                    <HStack
                      key={index}
                      p={4}
                      bg={bgColor}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <Text fontWeight="medium">{spec.name}:</Text>
                      <Text color={mutedColor}>{spec.value}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              </TabPanel>
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  {product.reviews?.map((review) => (
                    <Box
                      key={review._id}
                      p={4}
                      bg={bgColor}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <HStack mb={2}>
                        <Text fontWeight="medium">{review.name}</Text>
                        <Spacer />
                        <HStack>
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              as={FiStar}
                              color={i < review.rating ? 'yellow.400' : 'gray.300'}
                            />
                          ))}
                        </HStack>
                      </HStack>
                      <Text color={mutedColor}>{review.comment}</Text>
                    </Box>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetails;
