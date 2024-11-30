import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  HStack,
  Avatar,
  Text,
  Input,
  Select,
  Stack,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import {
  FaEllipsisV,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaBan,
  FaTrash,
  FaSearch,
} from 'react-icons/fa';
import { db } from '../config/firebase';
import {
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useVerification } from '../hooks/useVerification';
import { useAuth } from '../contexts/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const toast = useToast();
  const { verifyUser, unverifyUser, isVerifying } = useVerification();
  const { user: adminUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const userRef = doc(db, 'users', userId);
      if (action === 'delete') {
        await deleteDoc(userRef);
        toast({
          title: 'User Deleted',
          status: 'success',
          duration: 3000,
        });
      } else {
        await updateDoc(userRef, {
          role: action,
          updatedAt: new Date()
        });
        toast({
          title: 'User Role Updated',
          status: 'success',
          duration: 3000,
        });
      }
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleVerification = async (userId, isVerified) => {
    if (isVerified) {
      await unverifyUser(userId);
    } else {
      await verifyUser(userId, adminUser.uid, {
        verificationNotes: 'Verified by admin',
      });
    }
    // Refresh user list
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesFilter;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'company': return 'blue';
      case 'applicant': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={6}>Users Management</Heading>
          
          <HStack spacing={4} mb={6}>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="300px"
            />
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              maxW="200px"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="company">Company</option>
              <option value="applicant">Applicant</option>
            </Select>
          </HStack>
        </Box>

        <Box bg={useColorModeValue('white', 'gray.800')} shadow="base" rounded="lg" overflow="hidden">
          <Table>
            <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
              <Tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={user.displayName} src={user.photoURL} />
                      <Text fontWeight="medium">{user.displayName}</Text>
                    </HStack>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge
                      colorScheme={getRoleBadgeColor(user.role)}
                      rounded="full"
                      px={2}
                    >
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.status === 'active' ? 'green' : 'red'}
                      rounded="full"
                      px={2}
                    >
                      {user.status || 'active'}
                    </Badge>
                  </Td>
                  <Td>
                    {new Date(user.createdAt?.toDate()).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FaUserShield />}
                          onClick={() => handleUserAction(user.id, 'admin')}
                        >
                          Make Admin
                        </MenuItem>
                        <MenuItem
                          icon={<FaUserTie />}
                          onClick={() => handleUserAction(user.id, 'company')}
                        >
                          Make Company
                        </MenuItem>
                        <MenuItem
                          icon={<FaUser />}
                          onClick={() => handleUserAction(user.id, 'applicant')}
                        >
                          Make Applicant
                        </MenuItem>
                        <MenuItem
                          icon={<FaBan />}
                          onClick={() => handleUserAction(user.id, 'suspended')}
                          color="orange.500"
                        >
                          Suspend User
                        </MenuItem>
                        <MenuItem
                          icon={<FaTrash />}
                          onClick={() => handleUserAction(user.id, 'delete')}
                          color="red.500"
                        >
                          Delete User
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
    </Container>
  );
};

export default AdminUsers; 