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
  Input,
  Select,
  useDisclosure,
  VStack,
  HStack,
  Flex,
  useColorModeValue,
  Badge,
  Avatar,
  InputGroup,
  InputLeftElement,
  Switch,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
} from '@chakra-ui/react';
import {
  FiMoreVertical,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiLock,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error fetching users',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        toast({
          title: 'User deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
      } catch (error) {
        toast({
          title: 'Error deleting user',
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
      const method = selectedUser?._id ? 'PUT' : 'POST';
      const url = selectedUser?._id
        ? `/api/users/${selectedUser._id}`
        : '/api/users';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedUser),
      });

      if (!response.ok) throw new Error('Failed to save user');

      toast({
        title: `User ${selectedUser?._id ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error saving user',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.isActive).length;
    const adminUsers = users.filter((user) => user.role === 'admin').length;
    const customerUsers = users.filter((user) => user.role === 'customer').length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      customerUsers,
    };
  };

  const stats = calculateStats();

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!filterRole || user.role === filterRole)
  );

  return (
    <Box>
      <Stack spacing={6}>
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Stat bg={statBg} p={4} borderRadius="lg" borderWidth="1px">
            <StatLabel>Total Users</StatLabel>
            <StatNumber>{stats.totalUsers}</StatNumber>
            <StatHelpText>All registered users</StatHelpText>
          </Stat>
          <Stat bg={statBg} p={4} borderRadius="lg" borderWidth="1px">
            <StatLabel>Active Users</StatLabel>
            <StatNumber>{stats.activeUsers}</StatNumber>
            <StatHelpText>Currently active accounts</StatHelpText>
          </Stat>
          <Stat bg={statBg} p={4} borderRadius="lg" borderWidth="1px">
            <StatLabel>Admin Users</StatLabel>
            <StatNumber>{stats.adminUsers}</StatNumber>
            <StatHelpText>Administrative accounts</StatHelpText>
          </Stat>
          <Stat bg={statBg} p={4} borderRadius="lg" borderWidth="1px">
            <StatLabel>Customers</StatLabel>
            <StatNumber>{stats.customerUsers}</StatNumber>
            <StatHelpText>Regular customer accounts</StatHelpText>
          </Stat>
        </Grid>

        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Users
          </Text>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => {
              setSelectedUser({
                name: '',
                email: '',
                role: 'customer',
                isActive: true,
              });
              onOpen();
            }}
          >
            Add User
          </Button>
        </Flex>

        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="Filter by role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            maxW="200px"
          >
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </Select>
        </HStack>

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
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user._id}>
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={user.name}
                        src={user.avatar}
                      />
                      <Text>{user.name}</Text>
                    </HStack>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge
                      colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                      borderRadius="full"
                      px={2}
                    >
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.isActive ? 'green' : 'red'}
                      borderRadius="full"
                      px={2}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    {new Date(user.createdAt).toLocaleDateString()}
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
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => handleDelete(user._id)}
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
              {selectedUser?._id ? 'Edit User' : 'Add New User'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    leftElement={<FiUser />}
                    value={selectedUser?.name || ''}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        name: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    leftElement={<FiMail />}
                    value={selectedUser?.email || ''}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                  />
                </FormControl>

                {!selectedUser?._id && (
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      leftElement={<FiLock />}
                      value={selectedUser?.password || ''}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          password: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={selectedUser?.role || 'customer'}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    isChecked={selectedUser?.isActive}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        isActive: e.target.checked,
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
                {selectedUser?._id ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement; 