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
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  HStack,
  Text,
  Avatar,
  Input,
  Select,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaTrash,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import { db } from '../config/firebase';
import {
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  where,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobsQuery = query(collection(db, 'jobs'));
      const snapshot = await getDocs(jobsQuery);
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch jobs',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      if (action === 'delete') {
        await deleteDoc(jobRef);
        toast({
          title: 'Job Deleted',
          status: 'success',
          duration: 3000,
        });
      } else {
        await updateDoc(jobRef, {
          status: action === 'approve' ? 'active' : 'inactive'
        });
        toast({
          title: `Job ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          status: 'success',
          duration: 3000,
        });
      }
      fetchJobs();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || job.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={6}>Jobs Management</Heading>
          
          <HStack spacing={4} mb={6}>
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="300px"
              leftElement={<FaSearch color="gray.300" />}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              maxW="200px"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
          </HStack>
        </Box>

        <Box bg={bgColor} shadow="base" rounded="lg" overflow="hidden">
          <Table>
            <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
              <Tr>
                <Th>Job Title</Th>
                <Th>Company</Th>
                <Th>Status</Th>
                <Th>Posted Date</Th>
                <Th>Applications</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredJobs.map((job) => (
                <Tr key={job.id}>
                  <Td fontWeight="medium">{job.title}</Td>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={job.companyName} src={job.companyLogo} />
                      <Text>{job.companyName}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        job.status === 'active' ? 'green' :
                        job.status === 'inactive' ? 'red' :
                        'yellow'
                      }
                      rounded="full"
                      px={2}
                    >
                      {job.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(job.createdAt.toDate()).toLocaleDateString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/jobs/${job.id}/applications`)}
                    >
                      {job.applications?.length || 0} Applications
                    </Button>
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
                          icon={<FaCheck />}
                          onClick={() => handleJobAction(job.id, 'approve')}
                        >
                          Approve
                        </MenuItem>
                        <MenuItem
                          icon={<FaTimes />}
                          onClick={() => handleJobAction(job.id, 'reject')}
                        >
                          Reject
                        </MenuItem>
                        <MenuItem
                          icon={<FaTrash />}
                          onClick={() => handleJobAction(job.id, 'delete')}
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
    </Container>
  );
};

export default AdminJobs; 