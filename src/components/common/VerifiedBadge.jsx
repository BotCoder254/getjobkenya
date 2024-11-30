import React from 'react';
import { Icon, Tooltip } from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

const VerifiedBadge = ({ size = "1em" }) => {
  return (
    <Tooltip label="Verified Account" placement="top">
      <span>
        <Icon
          as={FaCheckCircle}
          color="blue.400"
          w={size}
          h={size}
          ml={1}
        />
      </span>
    </Tooltip>
  );
};

export default VerifiedBadge; 