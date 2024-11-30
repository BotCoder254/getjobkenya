import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  useColorModeValue,
  Divider,
  Icon,
} from '@chakra-ui/react';
import {
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheck,
} from 'react-icons/fa';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onRead }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const getIcon = (type) => {
    switch (type) {
      case 'application_status':
        return FaCheckCircle;
      case 'document_verification':
        return FaExclamationCircle;
      default:
        return FaInfoCircle;
    }
  };

  return (
    <Box
      p={4}
      bg={notification.read ? 'transparent' : bgColor}
      borderRadius="md"
      cursor="pointer"
      onClick={() => !notification.read && onRead(notification.id)}
      _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
    >
      <HStack spacing={4}>
        <Icon as={getIcon(notification.type)} color="blue.500" boxSize={5} />
        <VStack align="start" spacing={1} flex={1}>
          <Text fontWeight="medium">{notification.title}</Text>
          <Text fontSize="sm" color="gray.500">
            {notification.message}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

const NotificationsCenter = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications(user?.uid);
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<FaBell />}
            variant="ghost"
            position="relative"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              position="absolute"
              top="-1"
              right="-1"
              borderRadius="full"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent width="400px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <HStack justify="space-between">
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button
                size="sm"
                leftIcon={<FaCheck />}
                onClick={markAllAsRead}
                variant="ghost"
              >
                Mark all as read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody maxH="400px" overflowY="auto">
          <VStack spacing={2} align="stretch">
            {loading ? (
              <Text textAlign="center" py={4}>Loading notifications...</Text>
            ) : notifications.length === 0 ? (
              <Text textAlign="center" py={4}>No notifications</Text>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsCenter; 