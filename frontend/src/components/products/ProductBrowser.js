import React, { useState, useEffect } from 'react';
import {
  SimpleGrid,
  Box,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
  Input,
  Select,
  IconButton,
  Skeleton,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../hooks/useCart';
import EmptyState from '../common/EmptyState';

const ProductBrowser = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addItem } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      const data = await productService.getProducts(params);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await productService.searchProducts(searchQuery);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addItem(product._id);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add item to cart',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Box p={5}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="300px" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Products"
        description={error}
        button={{
          label: "Try Again",
          onClick: fetchProducts
        }}
      />
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title="No Products Found"
        description="We couldn't find any products matching your criteria"
        button={{
          label: "Clear Filters",
          onClick: () => {
            setSearchQuery('');
            setSelectedCategory('');
            fetchProducts();
          }
        }}
      />
    );
  }

  return (
    <Box p={5}>
      <VStack spacing={6}>
        <HStack w="full" spacing={4}>
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <IconButton
            icon={<SearchIcon />}
            onClick={handleSearch}
            aria-label="Search"
          />
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
          {products.map((product) => (
            <Box
              key={product._id}
              borderWidth={1}
              borderRadius="lg"
              overflow="hidden"
              _hover={{ shadow: 'md' }}
            >
              <Image
                src={product.image}
                alt={product.name}
                height="200px"
                width="100%"
                objectFit="cover"
                onClick={() => navigate(`/products/${product._id}`)}
                cursor="pointer"
              />
              <VStack p={4} align="start" spacing={2}>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="bold" fontSize="lg">
                    {product.name}
                  </Text>
                  <Badge colorScheme={product.inStock ? 'green' : 'red'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </HStack>
                <Text color="gray.600" noOfLines={2}>
                  {product.description}
                </Text>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="bold" fontSize="xl">
                    ${product.price}
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => handleAddToCart(product)}
                    isDisabled={!product.inStock}
                  >
                    Add to Cart
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default ProductBrowser; 