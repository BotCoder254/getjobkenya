import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FiTruck, FiCreditCard, FiShield, FiPackage } from 'react-icons/fi';

const LandingPage = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  const features = [
    {
      icon: FiTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100',
    },
    {
      icon: FiCreditCard,
      title: 'Secure Payment',
      description: 'Multiple secure payment options',
    },
    {
      icon: FiShield,
      title: 'Money-Back Guarantee',
      description: '30-day money-back guarantee',
    },
    {
      icon: FiPackage,
      title: 'Quality Products',
      description: 'Handpicked premium products',
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Premium Watch',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      category: 'Accessories',
    },
    {
      id: 2,
      name: 'Leather Bag',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601',
      category: 'Bags',
    },
    {
      id: 3,
      name: 'Sunglasses',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      category: 'Accessories',
    },
    {
      id: 4,
      name: 'Smart Watch',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
      category: 'Electronics',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={useColorModeValue('brand.50', 'gray.900')}
        py={{ base: 16, md: 24 }}
        px={4}
      >
        <Container maxW="container.xl">
          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap={8}
            alignItems="center"
          >
            <VStack align="flex-start" spacing={6}>
              <Heading
                as="h1"
                size="2xl"
                color={headingColor}
                lineHeight="shorter"
              >
                Discover Premium Products for Your Lifestyle
              </Heading>
              <Text fontSize="xl" color={textColor}>
                Shop the latest trends in fashion, electronics, and more with our
                curated collection of premium products.
              </Text>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/products"
                  size="lg"
                  colorScheme="brand"
                  px={8}
                >
                  Shop Now
                </Button>
                <Button
                  as={RouterLink}
                  to="/categories"
                  size="lg"
                  variant="outline"
                  px={8}
                >
                  Browse Categories
                </Button>
              </Stack>
            </VStack>
            <Box>
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                alt="Shopping"
                borderRadius="xl"
                objectFit="cover"
                w="full"
                h={{ base: '300px', md: '400px' }}
              />
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={16} px={4}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {features.map((feature, index) => (
              <VStack
                key={index}
                align="center"
                p={6}
                bg={bgColor}
                borderRadius="lg"
                boxShadow="md"
                spacing={4}
              >
                <Icon as={feature.icon} w={10} h={10} color="brand.500" />
                <Text fontWeight="bold" fontSize="lg">
                  {feature.title}
                </Text>
                <Text color={textColor} textAlign="center">
                  {feature.description}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Box py={16} px={4} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading size="xl" textAlign="center">
              Featured Products
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  as={RouterLink}
                  to={`/products/${product.id}`}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Box
                    bg={bgColor}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.02)' }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      h="250px"
                      w="full"
                      objectFit="cover"
                    />
                    <Box p={4}>
                      <Badge colorScheme="brand" mb={2}>
                        {product.category}
                      </Badge>
                      <Heading size="md" mb={2}>
                        {product.name}
                      </Heading>
                      <Text color="brand.500" fontWeight="bold">
                        ${product.price}
                      </Text>
                    </Box>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
            <Button
              as={RouterLink}
              to="/products"
              size="lg"
              colorScheme="brand"
              px={8}
            >
              View All Products
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Box py={16} px={4}>
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={8}
            align="center"
            justify="space-between"
            bg={useColorModeValue('brand.50', 'gray.800')}
            p={8}
            borderRadius="xl"
          >
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Heading size="lg">Stay Updated</Heading>
              <Text color={textColor}>
                Subscribe to our newsletter for the latest products and exclusive
                offers.
              </Text>
            </VStack>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              colorScheme="brand"
              px={8}
            >
              Sign Up Now
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 