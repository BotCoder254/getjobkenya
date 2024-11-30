import React from 'react';
import {
  HStack,
  Button,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUserPlus, FaEnvelope, FaBookmark, FaBan } from 'react-icons/fa';
import { useProfileInteractions } from '../../hooks/useProfileInteractions';
import { useAuth } from '../../contexts/AuthContext';

const ProfileActions = ({ profileId, isVerified, onConnect }) => {
  const { user, userType } = useAuth();
  const { isLoading, connectWithUser } = useProfileInteractions();
  const buttonBg = useColorModeValue('gray.100', 'gray.700');

  const handleConnect = async () => {
    await connectWithUser(profileId, user.uid);
    if (onConnect) onConnect();
  };

  return (
    <HStack spacing={2}>
      {userType !== 'admin' && (
        <Tooltip label="Connect">
          <Button
            leftIcon={<Icon as={FaUserPlus} />}
            onClick={handleConnect}
            isLoading={isLoading}
            bg={buttonBg}
          >
            Connect
          </Button>
        </Tooltip>
      )}

      <Tooltip label="Message">
        <Button
          leftIcon={<Icon as={FaEnvelope} />}
          bg={buttonBg}
        >
          Message
        </Button>
      </Tooltip>

      {userType === 'admin' && (
        <Tooltip label={isVerified ? 'Remove Verification' : 'Verify User'}>
          <Button
            leftIcon={<Icon as={isVerified ? FaBan : FaBookmark} />}
            colorScheme={isVerified ? 'red' : 'green'}
            variant="outline"
          >
            {isVerified ? 'Unverify' : 'Verify'}
          </Button>
        </Tooltip>
      )}
    </HStack>
  );
};

export default ProfileActions; 