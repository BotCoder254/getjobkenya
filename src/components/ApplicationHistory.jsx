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
  useColorModeValue,
  VStack,
  Text,
  HStack,
  Icon,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Progress,
  Flex,
  Select,
  Input,
} from '@chakra-ui/react';
import { 
  FaEye, 
  FaDownload, 
  FaFilter, 
  FaSearch, 
  FaEllipsisV,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { Player } from '@lottiefiles/react-lottie-player';
import { LOTTIE_FILES } from '../animations';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { useDocumentManagement } from '../hooks/useDocumentManagement';
import { format } from 'date-fns';

const ApplicationHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');
  const { data: applications, loading } = useRealTimeUpdates(user?.uid, 'applications');
  const { downloadDocument } = useDocumentManagement(user?.uid);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'reviewing':
        return 'blue';
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'withdrawn':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return FaClock;
      case 'reviewing':
        return FaFileAlt;
      case 'accepted':
        return FaCheckCircle;
      case 'rejected':
        return FaTimesCircle;
      default:
        return FaClock;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
          <Text>Loading applications...</Text>
        </VStack>
      </Container>
    );
  }

  if (applications.length === 0) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Player
            autoplay
            loop
            src={LOTTIE_FILES.empty}
            style={{ height: '300px', width: '300px' }}
          />
          <Heading size="lg">No Applications Yet</Heading>
          <Text color="gray.500">
            Start applying to jobs to see your application history
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
        <Flex justify="space-between" align="center">
          <Heading size="lg">Application History</Heading>
          <HStack spacing={4}>
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              width="300px"
              leftElement={<Icon as={FaSearch} color="gray.500" />}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              width="200px"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </Select>
          </HStack>
        </Flex>

        <Box bg={bgColor} rounded="lg" shadow="base" overflow="hidden">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Job Title</Th>
                <Th>Company</Th>
                <Th>Applied Date</Th>
                <Th>Status</Th>
                <Th>Last Updated</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredApplications.map((application) => (
                <Tr key={application.id}>
                  <Td fontWeight="medium">{application.jobTitle}</Td>
                  <Td>{application.companyName}</Td>
                  <Td>{format(application.appliedAt.toDate(), 'MMM dd, yyyy')}</Td>
                  <Td>
                    <HStack>
                      <Icon 
                        as={getStatusIcon(application.status)} 
                        color={`${getStatusColor(application.status)}.500`}
                      />
                      <Badge colorScheme={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </HStack>
                  </Td>
                  <Td>{format(application.lastUpdated.toDate(), 'MMM dd, yyyy')}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="View Details">
                        <IconButton
                          icon={<FaEye />}
                          variant="ghost"
                          onClick={() => navigate(`/applications/${application.id}`)}
                        />
                      </Tooltip>
                      {application.documents && (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                          />
                          <MenuList>
                            {Object.entries(application.documents).map(([key, url]) => (
                              <MenuItem
                                key={key}
                                icon={<FaDownload />}
                                onClick={() => downloadDocument(url)}
                              >
                                Download {key}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default ApplicationHistory; 