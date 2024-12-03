import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  icon = FiInbox,
  title = 'No Items Found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      py={12}
      px={6}
      textAlign="center"
      bg={bgColor}
      borderRadius="lg"
      width="100%"
    >
      <VStack spacing={4}>
        <Icon as={icon} boxSize={12} color={textColor} />
        <Text fontSize="xl" fontWeight="medium">
          {title}
        </Text>
        <Text color={textColor}>{description}</Text>
        {actionLabel && onAction && (
          <Button
            colorScheme="brand"
            onClick={onAction}
            size="lg"
            mt={2}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState; 