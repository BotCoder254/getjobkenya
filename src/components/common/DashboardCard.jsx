import React from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

const DashboardCard = ({
  title,
  value,
  icon,
  change,
  changeType = 'increase',
  helpText,
  accentColor = 'blue',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '4px',
        bg: `${accentColor}.500`,
      }}
    >
      <Stat>
        <StatLabel fontSize="md" color="gray.500">
          {title}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="bold">
          {value}
        </StatNumber>
        {(change || helpText) && (
          <StatHelpText>
            {change && (
              <>
                <StatArrow type={changeType} />
                {change}
              </>
            )}
            {helpText}
          </StatHelpText>
        )}
      </Stat>
      {icon && (
        <Icon
          as={icon}
          position="absolute"
          top={4}
          right={4}
          boxSize={6}
          color={`${accentColor}.500`}
          opacity={0.3}
        />
      )}
    </Box>
  );
};

export default DashboardCard; 