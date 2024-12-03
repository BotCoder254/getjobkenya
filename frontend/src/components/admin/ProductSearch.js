import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Checkbox,
  Grid,
  Card,
  CardBody,
  Image,
  Stack,
  Heading,
  Divider,
  ButtonGroup,
  Badge,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiChevronUp,
} from 'react-icons/fi';

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { isOpen, onToggle } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && product.stock > 0) ||
        (stockFilter === 'outOfStock' && product.stock === 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box bg={bgColor} p={4} borderRadius="lg" borderWidth="1px">
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Button
              rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
              onClick={onToggle}
              variant="ghost"
              width="full"
            >
              Advanced Filters
            </Button>

            <Collapse in={isOpen} animateOpacity>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
                mt={4}
              >
                <Box>
                  <Text mb={2}>Category</Text>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text mb={2}>Stock Status</Text>
                  <Select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="inStock">In Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                  </Select>
                </Box>

                <Box>
                  <Text mb={2}>Price Range</Text>
                  <HStack>
                    <NumberInput
                      value={priceRange[0]}
                      onChange={(value) =>
                        setPriceRange([parseInt(value), priceRange[1]])
                      }
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text>to</Text>
                    <NumberInput
                      value={priceRange[1]}
                      onChange={(value) =>
                        setPriceRange([priceRange[0], parseInt(value)])
                      }
                      min={priceRange[0]}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                  <RangeSlider
                    aria-label={['min', 'max']}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    min={0}
                    max={1000}
                    mt={2}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                </Box>

                <Box>
                  <Text mb={2}>Sort By</Text>
                  <HStack>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="stock">Stock</option>
                    </Select>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </Select>
                  </HStack>
                </Box>
              </Grid>
            </Collapse>
          </VStack>
        </Box>

        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              bg={bgColor}
              borderColor={borderColor}
              overflow="hidden"
            >
              <CardBody>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  borderRadius="lg"
                  objectFit="cover"
                  height="200px"
                  width="100%"
                />
                <Stack mt={4} spacing={3}>
                  <Heading size="md">{product.name}</Heading>
                  <Text color="brand.500" fontSize="2xl">
                    ${product.price}
                  </Text>
                  <HStack justify="space-between">
                    <Badge
                      colorScheme={product.stock > 0 ? 'green' : 'red'}
                      borderRadius="full"
                      px={2}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                    <Text color="gray.500">Stock: {product.stock}</Text>
                  </HStack>
                  <Text noOfLines={2}>{product.description}</Text>
                  <Divider />
                  <ButtonGroup spacing={2} size="sm">
                    <IconButton
                      icon={<FiEye />}
                      aria-label="View product"
                      variant="ghost"
                    />
                    <IconButton
                      icon={<FiEdit2 />}
                      aria-label="Edit product"
                      variant="ghost"
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Delete product"
                      variant="ghost"
                      colorScheme="red"
                    />
                  </ButtonGroup>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </VStack>
    </Box>
  );
};

export default ProductSearch; 