import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Icon,
  useColorModeValue,
  Button,
  Divider,
  List,
  ListItem,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaFileAlt,
  FaDownload,
} from 'react-icons/fa';
import { format } from 'date-fns';
import { useJobApplicationProcess } from '../hooks/useJobApplicationProcess';

const ApplicationStatus = ({ jobId, userId }) => {
  const {
    application,
    loading,
    withdrawApplication,
  } = useJobApplicationProcess(jobId, userId);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
        return FaSpinner;
      case 'accepted':
        return FaCheckCircle;
      case 'rejected':
        return FaTimesCircle;
      case 'withdrawn':
        return FaTimesCircle;
      default:
        return FaClock;
    }
  };

  if (loading) {
    return <Progress size="xs" isIndeterminate />;
  }

  if (!application) {
    return null;
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Badge
            colorScheme={getStatusColor(application.status)}
            p={2}
            borderRadius="full"
          >
            <HStack spacing={2}>
              <Icon as={getStatusIcon(application.status)} />
              <Text>{application.status.toUpperCase()}</Text>
            </HStack>
          </Badge>
          {application.status !== 'withdrawn' && (
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={withdrawApplication}
            >
              Withdraw Application
            </Button>
          )}
        </HStack>

        <Divider />

        <VStack align="start" spacing={4}>
          <Text fontWeight="bold">Application History</Text>
          <List spacing={3} width="100%">
            {application.history?.map((event, index) => (
              <ListItem key={index}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">
                      Status changed to {event.status}
                    </Text>
                    {event.feedback && (
                      <Text color="gray.500">{event.feedback}</Text>
                    )}
                  </VStack>
                  <Text fontSize="sm" color="gray.500">
                    {format(event.timestamp.toDate(), 'MMM dd, yyyy HH:mm')}
                  </Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>

        {application.documents && Object.keys(application.documents).length > 0 && (
          <>
            <Divider />
            <VStack align="start" spacing={4}>
              <Text fontWeight="bold">Submitted Documents</Text>
              <List spacing={3} width="100%">
                {Object.entries(application.documents).map(([key, url]) => (
                  <ListItem key={key}>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FaFileAlt} />
                        <Text>{key}</Text>
                      </HStack>
                      <Button
                        size="sm"
                        leftIcon={<FaDownload />}
                        onClick={() => window.open(url)}
                      >
                        Download
                      </Button>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ApplicationStatus; 