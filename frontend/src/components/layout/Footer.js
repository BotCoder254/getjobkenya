import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Tag,
  useColorModeValue,
  Image,
  Icon,
  chakra,
  VisuallyHidden,
  Input,
  IconButton,
  Button,
  VStack,
  HStack,
  Heading,
  Divider,
  Link,
} from '@chakra-ui/react';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from 'react-icons/fi';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight="500" fontSize="lg" mb={2}>
      {children}
    </Text>
  );
};

const Footer = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box bg={bgColor} color={textColor}>
      <Container as={Stack} maxW="container.xl" py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align="flex-start">
            <Heading size="md" mb={4}>
              Company
            </Heading>
            <Link href="/about">About Us</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/press">Press</Link>
            <Link href="/blog">Blog</Link>
          </Stack>

          <Stack align="flex-start">
            <Heading size="md" mb={4}>
              Support
            </Heading>
            <Link href="/help">Help Center</Link>
            <Link href="/safety">Safety Center</Link>
            <Link href="/community">Community Guidelines</Link>
            <Link href="/legal">Legal</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
          </Stack>

          <Stack align="flex-start">
            <Heading size="md" mb={4}>
              Services
            </Heading>
            <Link href="/products">Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/warranty">Warranty</Link>
          </Stack>

          <Stack align="flex-start">
            <Heading size="md" mb={4}>
              Stay Connected
            </Heading>
            <VStack spacing={4} align="stretch" w="full">
              <Text>Subscribe to our newsletter</Text>
              <HStack>
                <Input
                  placeholder="Enter your email"
                  bg={useColorModeValue('white', 'gray.800')}
                  border={0}
                  _focus={{
                    bg: useColorModeValue('white', 'gray.800'),
                    outline: 'none',
                    borderColor: 'brand.500',
                  }}
                />
                <IconButton
                  colorScheme="brand"
                  aria-label="Subscribe"
                  icon={<FiArrowRight />}
                />
              </HStack>
              <HStack spacing={4}>
                <IconButton
                  aria-label="facebook"
                  variant="ghost"
                  size="lg"
                  icon={<FiFacebook size="20px" />}
                />
                <IconButton
                  aria-label="twitter"
                  variant="ghost"
                  size="lg"
                  icon={<FiTwitter size="20px" />}
                />
                <IconButton
                  aria-label="instagram"
                  variant="ghost"
                  size="lg"
                  icon={<FiInstagram size="20px" />}
                />
                <IconButton
                  aria-label="youtube"
                  variant="ghost"
                  size="lg"
                  icon={<FiYoutube size="20px" />}
                />
              </HStack>
            </VStack>
          </Stack>
        </SimpleGrid>

        <Divider my={6} borderColor={borderColor} />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <HStack spacing={8}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/sitemap">Sitemap</Link>
          </HStack>
          <HStack justify={{ base: 'center', md: 'flex-end' }}>
            <Image h="24px" src="/payment/visa.png" alt="Visa" />
            <Image h="24px" src="/payment/mastercard.png" alt="Mastercard" />
            <Image h="24px" src="/payment/amex.png" alt="American Express" />
            <Image h="24px" src="/payment/mpesa.png" alt="M-Pesa" />
          </HStack>
        </SimpleGrid>

        <Box pt={6}>
          <Text textAlign="center">
            © {new Date().getFullYear()} LuxeCart. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 