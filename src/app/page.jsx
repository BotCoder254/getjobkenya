import React from 'react';
import { Box, Container, Flex, Heading, Text, Button, Stack, useColorModeValue } from '@chakra-ui/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const HomePage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={10}>
        <Flex direction="column" align="center" textAlign="center" mb={10}>
          <Heading size="2xl" mb={4}>
            Find Your Dream Job
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Connect with top companies and opportunities
          </Text>
        </Flex>

        <Flex gap={6} justify="center" wrap="wrap">
          {/* Company Login/Signup Card */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            width={{ base: "full", md: "400px" }}
          >
            <Stack spacing={4}>
              <Heading size="lg">For Companies</Heading>
              <Text color="gray.600">
                Post jobs and find the perfect candidates for your company
              </Text>
              <Button
                leftIcon={<FaGoogle />}
                colorScheme="red"
                variant="outline"
                size="lg"
                width="full"
              >
                Sign in with Google
              </Button>
              <Button
                leftIcon={<FaGithub />}
                colorScheme="gray"
                variant="outline"
                size="lg"
                width="full"
              >
                Sign in with GitHub
              </Button>
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
              >
                Sign in with Email
              </Button>
            </Stack>
          </Box>

          {/* Job Seeker Login/Signup Card */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            width={{ base: "full", md: "400px" }}
          >
            <Stack spacing={4}>
              <Heading size="lg">For Job Seekers</Heading>
              <Text color="gray.600">
                Find and apply to your next opportunity
              </Text>
              <Button
                leftIcon={<FaGoogle />}
                colorScheme="red"
                variant="outline"
                size="lg"
                width="full"
              >
                Sign in with Google
              </Button>
              <Button
                leftIcon={<FaGithub />}
                colorScheme="gray"
                variant="outline"
                size="lg"
                width="full"
              >
                Sign in with GitHub
              </Button>
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
              >
                Sign in with Email
              </Button>
            </Stack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default HomePage; 