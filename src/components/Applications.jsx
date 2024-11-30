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
  Stack,
  Text,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  HStack,
  VStack,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaPhone, FaLinkedin, FaFileAlt } from 'react-icons/fa';

const Applications = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobAndApplications();
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (jobDoc.exists()) {
        const jobData = { id: jobDoc.id, ...jobDoc.data() };
        setJob(jobData);
        setApplications(jobData.applications || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleStatusChange = async (applicationIndex, newStatus) => {
    try {
      const updatedApplications = [...applications];
      updatedApplications[applicationIndex].status = newStatus;

      await updateDoc(doc(db, 'jobs', jobId), {
        applications: updatedApplications,
      });

      setApplications(updatedApplications);
      toast({
        title: 'Status Updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const viewApplication = (application) => {
    setSelectedApplication(application);
    onOpen();
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={2}>{job?.title} - Applications</Heading>
          <Text color="gray.600">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </Text>
        </Box>

        <Box bg="white" shadow="base" rounded="lg" overflow="hidden">
          <Table>
            <Thead bg="gray.50">
              <Tr>
                <Th>Applicant</Th>
                <Th>Applied Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {applications.map((application, index) => (
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
                  <Td>
                    {new Date(application.appliedAt.toDate()).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Select
                      size="sm"
                      value={application.status}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                      width="150px"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </Select>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => viewApplication(application)}
                    >
                      View Details
                    </Button>
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
                    <HStack>
                      <Icon as={FaEnvelope} color="gray.500" />
                      <Text>{selectedApplication.userEmail}</Text>
                    </HStack>
                  </VStack>
                </HStack>

                <Box>
                  <Heading size="sm" mb={2}>Cover Letter</Heading>
                  <Text whiteSpace="pre-line">{selectedApplication.coverLetter}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Application Status</Heading>
                  <Badge
                    colorScheme={
                      selectedApplication.status === 'hired' ? 'green' :
                      selectedApplication.status === 'rejected' ? 'red' :
                      selectedApplication.status === 'shortlisted' ? 'blue' :
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
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Applications; 