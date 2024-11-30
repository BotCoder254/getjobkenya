import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Avatar,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaClock, 
  FaMoneyBillWave,
  FaBookmark,
  FaRegBookmark,
  FaCheckCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job, onSave, showSaveButton = false, isCompact = false, isSaved = false }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/jobs/${job.id}`);
  };

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: 'blue.400',
      }}
      transition="all 0.2s"
      position="relative"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <HStack spacing={3} flex={1}>
            <Avatar
              size="md"
              name={job.companyName}
              src={job.companyLogo}
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="lg">
                {job.title}
              </Text>
              <HStack>
                <Text color={textColor} fontSize="sm">
                  {job.companyName}
                </Text>
                {job.companyVerified && (
                  <Tooltip label="Verified Company">
                    <Icon as={FaCheckCircle} color="blue.500" />
                  </Tooltip>
                )}
              </HStack>
            </VStack>
          </HStack>
          <HStack>
            <Badge
              colorScheme={job.status === 'active' ? 'green' : 'gray'}
              variant="subtle"
              fontSize="sm"
            >
              {job.status}
            </Badge>
            {showSaveButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave && onSave();
                }}
                leftIcon={<Icon as={isSaved ? FaBookmark : FaRegBookmark} />}
                aria-label={isSaved ? "Unsave Job" : "Save Job"}
              />
            )}
          </HStack>
        </HStack>

        {!isCompact && (
          <Text noOfLines={2} color={textColor}>
            {job.description}
          </Text>
        )}

        <VStack align="stretch" spacing={2}>
          <HStack spacing={4} flexWrap="wrap">
            <HStack color={textColor}>
              <Icon as={FaMapMarkerAlt} />
              <Text fontSize="sm">{job.location}</Text>
            </HStack>
            <HStack color={textColor}>
              <Icon as={FaBriefcase} />
              <Text fontSize="sm">{job.type}</Text>
            </HStack>
            <HStack color={textColor}>
              <Icon as={FaMoneyBillWave} />
              <Text fontSize="sm">KSH {job.salary}</Text>
            </HStack>
          </HStack>

          {job.deadline && (
            <HStack color={textColor}>
              <Icon as={FaClock} />
              <Text fontSize="sm">
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </Text>
            </HStack>
          )}
        </VStack>

        <HStack spacing={2} flexWrap="wrap">
          {job.skills?.slice(0, 3).map((skill, index) => (
            <Badge
              key={index}
              colorScheme="blue"
              variant="subtle"
              fontSize="xs"
            >
              {skill}
            </Badge>
          ))}
          {job.skills?.length > 3 && (
            <Badge
              colorScheme="gray"
              variant="subtle"
              fontSize="xs"
            >
              +{job.skills.length - 3} more
            </Badge>
          )}
        </HStack>

        <Button
          colorScheme="blue"
          size="sm"
          onClick={handleViewDetails}
        >
          View Details & Apply
        </Button>
      </VStack>
    </Box>
  );
};

export default JobCard; 