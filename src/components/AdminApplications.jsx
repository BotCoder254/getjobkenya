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
  Avatar,
  Text,
  Stack,
  Select,
  Input,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaEye,
  FaDownload,
  FaEnvelope,
} from 'react-icons/fa';
import { db } from '../config/firebase';
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const jobsQuery = query(collection(db, 'jobs'));
      const jobsSnapshot = await getDocs(jobsQuery);
      let allApplications = [];
      
      jobsSnapshot.docs.forEach(doc => {
        const jobData = doc.data();
        if (jobData.applications) {
          const jobApplications = jobData.applications.map(app => ({
            ...app,
            jobId: doc.id,
            jobTitle: jobData.title,
            companyName: jobData.companyName,
          }));
          allApplications = [...allApplications, ...jobApplications];
        }
      });
      
      setApplications(allApplications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleStatusChange = async (jobId, applicationIndex, newStatus) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const job = (await getDocs(query(collection(db, 'jobs'), where('id', '==', jobId)))).docs[0];
      const updatedApplications = job.data().applications;
      updatedApplications[applicationIndex].status = newStatus;
      
      await updateDoc(jobRef, {
        applications: updatedApplications,
      });

      toast({
        title: 'Status Updated',
        status: 'success',
        duration: 3000,
      });
      
      fetchApplications();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const viewApplication = (application) => {
    setSelectedApplication(application);
    onOpen();
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || app.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={6}>Applications Management</Heading>
          
          <HStack spacing={4} mb={6}>
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="300px"
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              maxW="200px"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </Select>
          </HStack>
        </Box>

        <Box bg={useColorModeValue('white', 'gray.800')} shadow="base" rounded="lg" overflow="hidden">
          <Table>
            <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
              <Tr>
                <Th>Applicant</Th>
                <Th>Job</Th>
                <Th>Company</Th>
                <Th>Status</Th>
                <Th>Applied Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredApplications.map((application, index) => (
                <Tr key={index}>
                  <Td>
                    <HStack>
                      <Avatar
                        size="sm"
                        name={application.userName}
                        src={application.userPhoto}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{application.userName}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {application.userEmail}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>{application.jobTitle}</Td>
                  <Td>{application.companyName}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        application.status === 'accepted' ? 'green' :
                        application.status === 'rejected' ? 'red' :
                        application.status === 'reviewing' ? 'blue' :
                        'yellow'
                      }
                      rounded="full"
                      px={2}
                    >
                      {application.status}
                    </Badge>
                  </Td>
                  <Td>
                    {new Date(application.appliedAt.toDate()).toLocaleDateString()}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FaEye />}
                        variant="ghost"
                        onClick={() => viewApplication(application)}
                        aria-label="View application"
                      />
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
                            onClick={() => handleStatusChange(application.jobId, index, 'accepted')}
                          >
                            Accept
                          </MenuItem>
                          <MenuItem
                            icon={<FaTimes />}
                            onClick={() => handleStatusChange(application.jobId, index, 'rejected')}
                          >
                            Reject
                          </MenuItem>
                          <MenuItem
                            icon={<FaEnvelope />}
                            onClick={() => window.location.href = `mailto:${application.userEmail}`}
                          >
                            Contact Applicant
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Stack>

      {/* Application Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Application Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedApplication && (
              <Stack spacing={6}>
                <HStack>
                  <Avatar
                    size="xl"
                    name={selectedApplication.userName}
                    src={selectedApplication.userPhoto}
                  />
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{selectedApplication.userName}</Heading>
                    <Text color="gray.500">{selectedApplication.userEmail}</Text>
                  </VStack>
                </HStack>

                <Box>
                  <Heading size="sm" mb={2}>Job Details</Heading>
                  <Text fontWeight="bold">{selectedApplication.jobTitle}</Text>
                  <Text color="gray.500">{selectedApplication.companyName}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Cover Letter</Heading>
                  <Text whiteSpace="pre-line">{selectedApplication.coverLetter}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Status</Heading>
                  <Badge
                    colorScheme={
                      selectedApplication.status === 'accepted' ? 'green' :
                      selectedApplication.status === 'rejected' ? 'red' :
                      selectedApplication.status === 'reviewing' ? 'blue' :
                      'yellow'
                    }
                  >
                    {selectedApplication.status.toUpperCase()}
                  </Badge>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Applied On</Heading>
                  <Text>
                    {new Date(selectedApplication.appliedAt.toDate()).toLocaleString()}
                  </Text>
                </Box>

                <HStack spacing={4}>
                  <Button
                    leftIcon={<FaEnvelope />}
                    onClick={() => window.location.href = `mailto:${selectedApplication.userEmail}`}
                  >
                    Contact Applicant
                  </Button>
                  {selectedApplication.resume && (
                    <Button
                      leftIcon={<FaDownload />}
                      onClick={() => window.open(selectedApplication.resume)}
                    >
                      Download Resume
                    </Button>
                  )}
                </HStack>
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminApplications; 