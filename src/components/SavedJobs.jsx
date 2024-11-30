import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FaBookmark, FaTrash } from 'react-icons/fa';
import { Player } from '@lottiefiles/react-lottie-player';
import { LOTTIE_FILES } from '../animations';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      const q = query(
        collection(db, 'savedJobs'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedJobs(jobs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'savedJobs', jobId));
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Player
            autoplay
            loop
            src={LOTTIE_FILES.loading}
            style={{ height: '200px', width: '200px' }}
          />
          <Text>Loading saved jobs...</Text>
        </VStack>
      </Container>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Player
            autoplay
            loop
            src={LOTTIE_FILES.empty}
            style={{ height: '300px', width: '300px' }}
          />
          <Heading size="lg">No Saved Jobs</Heading>
          <Text color="gray.500">
            Jobs you save will appear here
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Saved Jobs</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {savedJobs.map((job) => (
            <Box
              key={job.id}
              p={6}
              bg={bgColor}
              rounded="lg"
              shadow="base"
              position="relative"
            >
              <Icon
                as={FaTrash}
                position="absolute"
                top={4}
                right={4}
                cursor="pointer"
                color="red.500"
                onClick={() => removeSavedJob(job.id)}
              />
              <VStack align="start" spacing={3}>
                <Heading size="md">{job.title}</Heading>
                <Text color="gray.500">{job.companyName}</Text>
                <Text>{job.location}</Text>
                <Text fontWeight="bold">{job.salary}</Text>
                <Button
                  colorScheme="blue"
                  width="full"
                  onClick={() => navigate(`/jobs/${job.jobId}`)}
                >
                  View Details
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default SavedJobs; 