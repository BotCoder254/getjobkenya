import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  Progress,
  Avatar,
  Flex,
  Heading,
  Icon,
} from '@chakra-ui/react';
import {
  FaDownload,
  FaCheck,
  FaTimes,
  FaClock,
  FaComments,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
} from 'react-icons/fa';
import { useApplications } from '../hooks/useApplications';

const ApplicationReview = ({ jobId, maxApplicants }) => {
  const { applications, loading, updateApplicationStatus, downloadDocument } = useApplications(jobId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleStatusUpdate = async () => {
    await updateApplicationStatus(selectedApplication.id, newStatus, feedback);
    onClose();
    setFeedback('');
    setNewStatus('');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'yellow',
      reviewing: 'blue',
      accepted: 'green',
      rejected: 'red',
      withdrawn: 'gray',
    };
    return statusColors[status] || 'gray';
  };

  const currentApplications = applications.filter(app => app.status === 'accepted').length;
  const progressValue = (currentApplications / maxApplicants) * 100;

  return (
    <Box>
      {maxApplicants > 0 && (
        <Box mb={6}>
          <Text mb={2}>Applications Progress ({currentApplications}/{maxApplicants})</Text>
          <Progress
            value={progressValue}
            colorScheme={progressValue >= 100 ? 'green' : 'blue'}
            size="sm"
            borderRadius="full"
          />
        </Box>
      )}

      <Table variant="simple" bg={bgColor} borderRadius="lg" overflow="hidden">
        <Thead>
          <Tr>
            <Th>Applicant</Th>
            <Th>Submitted</Th>
            <Th>Status</Th>
            <Th>Documents</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {applications.map((application) => (
            <Tr key={application.id}>
              <Td>
                <HStack>
                  <Avatar size="sm" name={application.applicantName} src={application.applicantPhoto} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{application.applicantName}</Text>
                    <Text fontSize="sm" color="gray.500">{application.applicantEmail}</Text>
                  </VStack>
                </HStack>
              </Td>
              <Td>{new Date(application.appliedAt?.toDate()).toLocaleDateString()}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </Td>
              <Td>
                <HStack>
                  <Tooltip label="Download Resume">
                    <IconButton
                      icon={<FaDownload />}
                      size="sm"
                      onClick={() => downloadDocument(application.resume)}
                    />
                  </Tooltip>
                  {application.portfolio && (
                    <Tooltip label="View Portfolio">
                      <IconButton
                        icon={<FaLinkedin />}
                        size="sm"
                        as="a"
                        href={application.portfolio}
                        target="_blank"
                      />
                    </Tooltip>
                  )}
                </HStack>
              </Td>
              <Td>
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      setSelectedApplication(application);
                      onOpen();
                    }}
                  >
                    Review
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Application</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedApplication && (
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" mb={4}>Applicant Information</Heading>
                  <HStack spacing={4}>
                    <Avatar
                      size="xl"
                      name={selectedApplication.applicantName}
                      src={selectedApplication.applicantPhoto}
                    />
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold">{selectedApplication.applicantName}</Text>
                      <HStack>
                        <Icon as={FaEnvelope} />
                        <Text>{selectedApplication.applicantEmail}</Text>
                      </HStack>
                      {selectedApplication.phone && (
                        <HStack>
                          <Icon as={FaPhone} />
                          <Text>{selectedApplication.phone}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <Heading size="md" mb={4}>Screening Questions</Heading>
                  <VStack align="stretch" spacing={4}>
                    {selectedApplication.answers?.map((answer, index) => (
                      <Box key={index}>
                        <Text fontWeight="medium">{answer.question}</Text>
                        <Text mt={2}>{answer.response}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                <Box>
                  <Heading size="md" mb={4}>Cover Letter</Heading>
                  <Text>{selectedApplication.coverLetter}</Text>
                </Box>

                <Box>
                  <Heading size="md" mb={4}>Update Status</Heading>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="Select new status"
                    mb={4}
                  >
                    <option value="reviewing">Reviewing</option>
                    <option value="accepted">Accept</option>
                    <option value="rejected">Reject</option>
                  </Select>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add feedback or notes (optional)"
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ApplicationReview; 