import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Stack,
  Text,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  VStack,
  Flex,
  useColorModeValue,
  Badge,
  Image,
} from '@chakra-ui/react';
import { FiMoreVertical, FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'Error fetching categories',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    onOpen();
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
        });
        toast({
          title: 'Category deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchCategories();
      } catch (error) {
        toast({
          title: 'Error deleting category',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = selectedCategory?._id ? 'PUT' : 'POST';
      const url = selectedCategory?._id
        ? `/api/categories/${selectedCategory._id}`
        : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedCategory),
      });

      if (!response.ok) throw new Error('Failed to save category');

      toast({
        title: `Category ${selectedCategory?._id ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error saving category',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Categories
          </Text>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => {
              setSelectedCategory({
                name: '',
                description: '',
                imageUrl: '',
                slug: '',
              });
              onOpen();
            }}
          >
            Add Category
          </Button>
        </Flex>

        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Image</Th>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Products</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((category) => (
                <Tr key={category._id}>
                  <Td>
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      fallback={<Box as={FiImage} boxSize="50px" color="gray.400" />}
                    />
                  </Td>
                  <Td>{category.name}</Td>
                  <Td>{category.description}</Td>
                  <Td>
                    <Badge colorScheme="blue" borderRadius="full" px={2}>
                      {category.productCount || 0} products
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FiEdit2 />}
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => handleDelete(category._id)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {selectedCategory?._id ? 'Edit Category' : 'Add New Category'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={selectedCategory?.name || ''}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={selectedCategory?.description || ''}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        description: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Image URL</FormLabel>
                  <Input
                    value={selectedCategory?.imageUrl || ''}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand">
                {selectedCategory?._id ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CategoryManagement; 