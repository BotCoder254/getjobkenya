import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Grid,
  GridItem,
  Text,
  useToast,
  HStack,
  VStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  FormHelperText,
  IconButton,
} from '@chakra-ui/react';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FaBriefcase, FaUsers, FaChartLine, FaEdit, FaTrash, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    requirements: '',
    type: 'full-time',
    deadline: '',
    experienceLevel: 'entry',
    skills: '',
    benefits: '',
    maxApplicants: 0,
    screeningQuestions: [],
    requiredDocuments: [],
    applicationInstructions: '',
    status: 'active',
  });

  const [questionInput, setQuestionInput] = useState('');
  const [documentInput, setDocumentInput] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    const q = query(collection(db, 'jobs'), where('companyId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const jobsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setJobs(jobsList);
    
    // Update stats
    setJobStats({
      totalJobs: jobsList.length,
      activeJobs: jobsList.filter(job => job.status === 'active').length,
      totalApplications: jobsList.reduce((acc, job) => acc + (job.applications?.length || 0), 0),
    });
  };

  const handleJobAction = async (action) => {
    try {
      const formattedJob = {
        ...newJob,
        salary: formatSalaryToKSH(newJob.salary),
        companyId: user.uid,
        companyName: user.displayName,
        companyLogo: user.photoURL,
        companyVerified: user.isVerified || false,
        createdAt: new Date(),
        status: 'active',
        applications: [],
        currentApplicants: 0,
        skills: newJob.skills.split(',').map(skill => skill.trim()),
      };

      if (action === 'create') {
        await addDoc(collection(db, 'jobs'), formattedJob);
        toast({
          title: 'Job Posted Successfully',
          status: 'success',
          duration: 3000,
        });
      } else if (action === 'update' && selectedJob) {
        await updateDoc(doc(db, 'jobs', selectedJob.id), {
          ...formattedJob,
          updatedAt: new Date(),
        });
        toast({
          title: 'Job Updated Successfully',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      fetchJobs();
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatSalaryToKSH = (salary) => {
    if (!salary) return '';
    // Remove any existing currency symbols and commas
    const cleanAmount = salary.replace(/[^0-9.-]+/g, '');
    // Format as KSH
    return `KSH ${parseInt(cleanAmount).toLocaleString()}`;
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      toast({
        title: 'Job Deleted Successfully',
        status: 'success',
        duration: 3000,
      });
      fetchJobs();
    } catch (error) {
      toast({
        title: 'Error Deleting Job',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      requirements: job.requirements,
      type: job.type || 'full-time',
      deadline: job.deadline || '',
      experienceLevel: job.experienceLevel || 'entry',
      skills: job.skills || '',
      benefits: job.benefits || '',
      maxApplicants: job.maxApplicants || 0,
      screeningQuestions: job.screeningQuestions || [],
      requiredDocuments: job.requiredDocuments || [],
      applicationInstructions: job.applicationInstructions || '',
      status: job.status || 'active',
    });
    setIsEditing(true);
    onOpen();
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      description: '',
      location: '',
      salary: '',
      requirements: '',
      type: 'full-time',
      deadline: '',
      experienceLevel: 'entry',
      skills: '',
      benefits: '',
      maxApplicants: 0,
      screeningQuestions: [],
      requiredDocuments: [],
      applicationInstructions: '',
      status: 'active',
    });
    setSelectedJob(null);
    setIsEditing(false);
  };

  const handleAddQuestion = () => {
    if (questionInput.trim()) {
      setNewJob(prev => ({
        ...prev,
        screeningQuestions: [...prev.screeningQuestions, questionInput.trim()]
      }));
      setQuestionInput('');
    }
  };

  const handleAddDocument = () => {
    if (documentInput.trim()) {
      setNewJob(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, documentInput.trim()]
      }));
      setDocumentInput('');
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        {/* Stats Section */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat
            px={6}
            py={4}
            bg="white"
            shadow="base"
            rounded="lg"
            borderLeft="4px"
            borderLeftColor="blue.500"
          >
            <StatLabel fontSize="md">Total Jobs</StatLabel>
            <StatNumber fontSize="3xl">{jobStats.totalJobs}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {jobStats.activeJobs} Active
            </StatHelpText>
          </Stat>
          
          <Stat
            px={6}
            py={4}
            bg="white"
            shadow="base"
            rounded="lg"
            borderLeft="4px"
            borderLeftColor="green.500"
          >
            <StatLabel fontSize="md">Active Listings</StatLabel>
            <StatNumber fontSize="3xl">{jobStats.activeJobs}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Currently Live
            </StatHelpText>
          </Stat>
          
          <Stat
            px={6}
            py={4}
            bg="white"
            shadow="base"
            rounded="lg"
            borderLeft="4px"
            borderLeftColor="purple.500"
          >
            <StatLabel fontSize="md">Total Applications</StatLabel>
            <StatNumber fontSize="3xl">{jobStats.totalApplications}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Received
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Actions Header */}
        <Box d="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Job Listings</Heading>
          <Button
            leftIcon={<FaBriefcase />}
            colorScheme="blue"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Post New Job
          </Button>
        </Box>

        {/* Jobs Table */}
        <Box
          bg="white"
          shadow="base"
          rounded="lg"
          overflow="hidden"
        >
          <Table>
            <Thead bg="gray.50">
              <Tr>
                <Th>Job Title</Th>
                <Th>Location</Th>
                <Th>Posted Date</Th>
                <Th>Status</Th>
                <Th>Applications</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {jobs.map((job) => (
                <Tr key={job.id}>
                  <Td fontWeight="medium">{job.title}</Td>
                  <Td>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="gray.500" />
                      <Text>{job.location}</Text>
                    </HStack>
                  </Td>
                  <Td>{new Date(job.createdAt.toDate()).toLocaleDateString()}</Td>
                  <Td>
                    <Badge
                      colorScheme={job.status === 'active' ? 'green' : 'gray'}
                      rounded="full"
                      px={2}
                    >
                      {job.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FaUsers />}
                    >
                      {job.applications?.length || 0} Applications
                    </Button>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(job)}
                      >
                        <Icon as={FaEdit} />
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Icon as={FaTrash} />
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Stack>

      {/* Job Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Job Listing' : 'Post New Job'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={1}>
                  <FormControl>
                    <FormLabel>Job Type</FormLabel>
                    <Select
                      value={newJob.type}
                      onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={1}>
                  <FormControl>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      value={newJob.experienceLevel}
                      onChange={(e) => setNewJob({...newJob, experienceLevel: e.target.value})}
                    >
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="executive">Executive</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={1}>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={1}>
                  <FormControl isRequired>
                    <FormLabel>Salary Range</FormLabel>
                    <Input
                      value={newJob.salary}
                      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="e.g., 50000 - 70000"
                      helperText="Enter amount in KSH"
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={newJob.description}
                      onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                      rows={4}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Requirements</FormLabel>
                    <Textarea
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                      rows={4}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Required Skills</FormLabel>
                    <Input
                      value={newJob.skills}
                      onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Benefits</FormLabel>
                    <Textarea
                      value={newJob.benefits}
                      onChange={(e) => setNewJob({...newJob, benefits: e.target.value})}
                      placeholder="List the benefits and perks"
                      rows={3}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Application Deadline</FormLabel>
                    <Input
                      type="date"
                      value={newJob.deadline}
                      onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Maximum Number of Applicants</FormLabel>
                    <Input
                      type="number"
                      value={newJob.maxApplicants}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        maxApplicants: parseInt(e.target.value)
                      })}
                      min={0}
                    />
                    <FormHelperText>
                      Set to 0 for unlimited applications
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Screening Questions</FormLabel>
                    <HStack>
                      <Input
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder="Enter a screening question"
                      />
                      <Button onClick={handleAddQuestion}>Add</Button>
                    </HStack>
                    <VStack mt={2} align="stretch">
                      {newJob.screeningQuestions.map((question, index) => (
                        <HStack key={index}>
                          <Text>{question}</Text>
                          <IconButton
                            icon={<FaTrash />}
                            onClick={() => {
                              setNewJob(prev => ({
                                ...prev,
                                screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index)
                              }));
                            }}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Required Documents</FormLabel>
                    <HStack>
                      <Input
                        value={documentInput}
                        onChange={(e) => setDocumentInput(e.target.value)}
                        placeholder="Enter required document"
                      />
                      <Button onClick={handleAddDocument}>Add</Button>
                    </HStack>
                    <VStack mt={2} align="stretch">
                      {newJob.requiredDocuments.map((doc, index) => (
                        <HStack key={index}>
                          <Text>{doc}</Text>
                          <IconButton
                            icon={<FaTrash />}
                            onClick={() => {
                              setNewJob(prev => ({
                                ...prev,
                                requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index)
                              }));
                            }}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Application Instructions</FormLabel>
                    <Textarea
                      value={newJob.applicationInstructions}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        applicationInstructions: e.target.value
                      })}
                      placeholder="Provide specific instructions for applicants"
                      rows={4}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleJobAction(isEditing ? 'update' : 'create')}
            >
              {isEditing ? 'Update Job' : 'Post Job'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CompanyDashboard; 