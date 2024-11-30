import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <Container as={Stack} maxW="container.xl" py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack spacing={6}>
            <Box>
              <Image src="/logo.png" h="40px" alt="TalentBridge" />
            </Box>
            <Text fontSize="sm">
              © 2024 TalentBridge. All rights reserved
            </Text>
            <Stack direction="row" spacing={6}>
              <Link href="#"><FaTwitter /></Link>
              <Link href="#"><FaLinkedin /></Link>
              <Link href="#"><FaGithub /></Link>
            </Stack>
          </Stack>

          <Stack align="flex-start">
            <Text fontWeight="semibold" mb={2}>Company</Text>
            <Link href="#">About Us</Link>
            <Link href="#">Blog</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Contact Us</Link>
          </Stack>

          <Stack align="flex-start">
            <Text fontWeight="semibold" mb={2}>Support</Text>
            <Link href="#">Help Center</Link>
            <Link href="#">Safety Center</Link>
            <Link href="#">Community Guidelines</Link>
          </Stack>

          <Stack align="flex-start">
            <Text fontWeight="semibold" mb={2}>Legal</Text>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Cookie Policy</Link>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Footer; 