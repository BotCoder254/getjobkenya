import React, { useState } from 'react';
import {
  Box,
  Container,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Select,
  HStack,
  Spinner,
  Center,
  InputGroup,
  InputLeftElement,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { useJobs } from '../hooks/useJobs';
import JobCard from './common/JobCard';

const JobSeekerDashboard = () => {
  const { jobs, loading, error } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation;

    return matchesSearch && matchesType && matchesLocation;
  });

  // Get unique locations for filter
  const locations = [...new Set(jobs.map(job => job.location))];

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading jobs...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="50vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} w="full">
        {/* Search and Filters */}
        <HStack w="full" spacing={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
          <InputGroup>
            <InputLeftElement>
              <Icon as={FaSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search jobs by title, company, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            minW="150px"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </Select>

          <Select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            minW="150px"
          >
            <option value="all">All Locations</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </Select>
        </HStack>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Center h="200px">
            <Text>No jobs found matching your criteria</Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => {
                  // Handle job click - navigate to details or open modal
                  console.log('Job clicked:', job);
                }}
              />
            ))}
          </SimpleGrid>
        )}

        {/* Show total count */}
        <Text color="gray.500">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </Text>
      </VStack>
    </Container>
  );
};

export default JobSeekerDashboard; 