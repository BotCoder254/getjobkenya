import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Avatar,
  Divider,
  useColorModeValue,
  useDisclosure,
  Icon,
  Progress,
  SimpleGrid,
  Tooltip,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUsers,
  FaCheckCircle,
  FaBriefcase,
  FaGraduationCap,
  FaCheck,
} from 'react-icons/fa';
import JobApplicationForm from './JobApplicationForm';
import ApplicationStatus from './ApplicationStatus';
import { useJobApplicationProcess } from '../hooks/useJobApplicationProcess';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { application, submitting } = useJobApplicationProcess(jobId, user?.uid);
  const { data: realTimeData } = useRealTimeUpdates(jobId, 'jobs');

  useEffect(() => {
    fetchJobDetails();
  }, [jobId, realTimeData]);

  const fetchJobDetails = async () => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        setJob({
          id: jobDoc.id,
          ...jobDoc.data(),
          currentApplicants: realTimeData?.currentApplicants || jobDoc.data().currentApplicants || 0,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Progress size="xs" isIndeterminate />
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Job not found</Text>
      </Container>
    );
  }

  const isJobClosed = job.status === 'filled' || 
    (job.maxApplicants > 0 && job.currentApplicants >= job.maxApplicants);

  const hasApplied = application !== null;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Job Header */}
        <Box
          bg={bgColor}
          p={8}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between" align="start">
              <HStack spacing={4}>
                <Avatar
                  size="xl"
                  src={job.companyLogo}
                  name={job.companyName}
                />
                <VStack align="start" spacing={2}>
                  <Heading size="lg">{job.title}</Heading>
                  <HStack>
                    <Text color="gray.500">{job.companyName}</Text>
                    {job.companyVerified && (
                      <Icon as={FaCheckCircle} color="blue.500" />
                    )}
                  </HStack>
                  <HStack wrap="wrap" spacing={4}>
                    <Badge colorScheme={job.status === 'active' ? 'green' : 'red'}>
                      {job.status}
                    </Badge>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} />
                      <Text>{job.location}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaBriefcase} />
                      <Text>{job.type}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaDollarSign} />
                      <Text>{job.salary}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>

              {user && user.uid !== job.companyId && (
                <VStack spacing={2}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={onOpen}
                    isDisabled={isJobClosed || hasApplied}
                    leftIcon={<Icon as={hasApplied ? FaCheck : FaBriefcase} />}
                  >
                    {hasApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                  {isJobClosed && (
                    <Badge colorScheme="red">
                      This position is no longer accepting applications
                    </Badge>
                  )}
                </VStack>
              )}
            </HStack>

            {/* Application Progress */}
            {job.maxApplicants > 0 && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text>Applications</Text>
                  <Text>{job.currentApplicants} / {job.maxApplicants}</Text>
                </HStack>
                <Progress
                  value={(job.currentApplicants / job.maxApplicants) * 100}
                  colorScheme="blue"
                  rounded="full"
                />
              </Box>
            )}
          </VStack>
        </Box>

        {/* Job Details */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <VStack align="stretch" spacing={6}>
            <Box
              bg={bgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>Job Description</Heading>
              <Text whiteSpace="pre-wrap">{job.description}</Text>
            </Box>

            <Box
              bg={bgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>Requirements</Heading>
              <List spacing={3}>
                {job.requirements?.split('\n').map((req, index) => (
                  <ListItem key={index}>
                    <ListIcon as={FaCheck} color="green.500" />
                    {req}
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>

          <VStack align="stretch" spacing={6}>
            {/* Application Status for Applied Users */}
            {hasApplied && (
              <ApplicationStatus jobId={jobId} userId={user.uid} />
            )}

            <Box
              bg={bgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>Skills Required</Heading>
              <HStack wrap="wrap" spacing={2}>
                {job.skills?.map((skill, index) => (
                  <Badge
                    key={index}
                    colorScheme="blue"
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {skill}
                  </Badge>
                ))}
              </HStack>
            </Box>

            {job.benefits && (
              <Box
                bg={bgColor}
                p={6}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4}>Benefits</Heading>
                <Text whiteSpace="pre-wrap">{job.benefits}</Text>
              </Box>
            )}
          </VStack>
        </SimpleGrid>
      </VStack>

      {/* Application Form Modal */}
      <JobApplicationForm
        isOpen={isOpen}
        onClose={onClose}
        job={job}
      />
    </Container>
  );
};

export default JobDetails; 