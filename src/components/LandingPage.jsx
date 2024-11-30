import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  Flex,
  Image,
  SimpleGrid,
  Icon,
  useColorModeValue,
  useDisclosure,
  VStack,
  HStack,
  Badge,
  Circle,
  Avatar,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaBriefcase, 
  FaSearch, 
  FaUsers, 
  FaRocket, 
  FaCheckCircle, 
  FaShieldAlt,
  FaGraduationCap,
  FaHandshake,
  FaUser,
} from 'react-icons/fa';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import { LOTTIE_FILES } from '../animations';

// Professional Images from Unsplash
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  office: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  meeting: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  workspace: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  collaboration: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  success: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
};

// Add these new images
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "https://images.unsplash.com/photo-1450387635224-8ecb6f079a4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
];

// Update the TESTIMONIALS array with more success stories
const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    text: "TalentBridge helped me find my dream job at Google. The platform is intuitive and the job matching is spot-on!"
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    company: "Microsoft",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    text: "As a hiring manager, TalentBridge has streamlined our recruitment process significantly."
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    company: "Apple",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    text: "The quality of job matches and the user experience on TalentBridge is exceptional."
  },
  {
    name: "David Kim",
    role: "Data Scientist",
    company: "Amazon",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    text: "Found my current position through TalentBridge. The AI matching system is incredibly accurate!"
  },
  {
    name: "Lisa Patel",
    role: "Marketing Director",
    company: "Netflix",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    text: "TalentBridge made my career transition seamless. Highly recommend for professionals!"
  },
  {
    name: "James Wilson",
    role: "DevOps Engineer",
    company: "Meta",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    text: "The platform's focus on tech roles and skill matching is outstanding."
  }
];

// Update the COMPANIES array with more trusted companies
const COMPANIES = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2880px-Google_2015_logo.svg.png",
    description: "Leading technology company"
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
    description: "Software and cloud solutions"
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png",
    description: "Consumer electronics and software"
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
    description: "E-commerce and cloud computing"
  },
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png",
    description: "Social media and technology"
  },
  {
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png",
    description: "Streaming entertainment"
  },
  {
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/2560px-Tesla_Motors.svg.png",
    description: "Electric vehicles and clean energy"
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png",
    description: "Enterprise technology solutions"
  }
];

const MotionBox = motion(Box);

// Create a separate Feature component
const Feature = ({ icon, title, text, image, bgColor, iconBgColor, textColor }) => {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      bg={bgColor}
      p={8}
      rounded="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      align="center"
      spacing={6}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
        transition: 'all 0.3s ease',
      }}
    >
      <Box flex={1}>
        <Flex
          w={16}
          h={16}
          align="center"
          justify="center"
          rounded="full"
          bg={iconBgColor}
          color="blue.500"
          mb={4}
        >
          <Icon as={icon} w={8} h={8} />
        </Flex>
        <Heading size="md" mb={2}>
          {title}
        </Heading>
        <Text color={textColor}>
          {text}
        </Text>
      </Box>
      <Box flex={1}>
        <Image
          src={image}
          alt={title}
          rounded="lg"
          shadow="2xl"
          w="full"
          h="200px"
          objectFit="cover"
        />
      </Box>
    </Stack>
  );
};

// Create a separate JobCategory component
const JobCategory = ({ icon, title, count, description, bgColor, iconBgColor, borderColor }) => {
  return (
    <Stack
      direction="column"
      p={6}
      bg={bgColor}
      rounded="xl"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: 'blue.400',
      }}
      transition="all 0.3s ease"
      cursor="pointer"
      spacing={4}
    >
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        rounded="xl"
        bg={iconBgColor}
        color="blue.500"
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <VStack align="start" spacing={2}>
        <Heading size="md">{title}</Heading>
        <Text color="gray.500" fontSize="sm">{description}</Text>
        <HStack>
          <Badge colorScheme="blue" rounded="full" px={3}>
            {count} jobs
          </Badge>
          <Badge colorScheme="green" rounded="full" px={3}>
            Active
          </Badge>
        </HStack>
      </VStack>
    </Stack>
  );
};

// Create separate components for Companies and Testimonials
const CompanyCard = ({ company, bgColor }) => (
  <Box
    p={6}
    bg={bgColor}
    rounded="xl"
    shadow="md"
    _hover={{ transform: 'scale(1.05)', shadow: 'lg' }}
    transition="all 0.3s"
    textAlign="center"
  >
    <VStack spacing={4}>
      <Image
        src={company.logo}
        alt={company.name}
        h="50px"
        objectFit="contain"
      />
      <Text fontWeight="medium">{company.name}</Text>
      <Text fontSize="sm" color="gray.500">
        {company.description}
      </Text>
    </VStack>
  </Box>
);

const TestimonialCard = ({ testimonial, bgColor }) => (
  <Box
    bg={bgColor}
    p={8}
    rounded="xl"
    shadow="xl"
    position="relative"
    _hover={{ transform: 'translateY(-5px)', shadow: '2xl' }}
    transition="all 0.3s"
  >
    <VStack spacing={4}>
      <Avatar
        size="xl"
        src={testimonial.image}
        name={testimonial.name}
        border="4px solid"
        borderColor="blue.400"
      />
      <Text fontSize="lg" fontStyle="italic" textAlign="center">
        "{testimonial.text}"
      </Text>
      <VStack spacing={1}>
        <Text fontWeight="bold" fontSize="lg">
          {testimonial.name}
        </Text>
        <Text color="blue.500">
          {testimonial.role}
        </Text>
        <Text color="gray.500">
          at {testimonial.company}
        </Text>
      </VStack>
    </VStack>
  </Box>
);

const CompaniesSection = ({ bgColor }) => {
  const sectionBgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box py={20} bg={sectionBgColor}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading textAlign="center" size="2xl">
            Trusted by Leading Companies
          </Heading>
          <Text textAlign="center" fontSize="xl" color="gray.500" maxW="2xl">
            Join thousands of innovative companies that trust TalentBridge for their hiring needs
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={10} width="full">
            {COMPANIES.map((company, index) => (
              <CompanyCard 
                key={index} 
                company={company} 
                bgColor={bgColor}
              />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

const TestimonialsSection = ({ bgColor }) => (
  <Box py={20}>
    <Container maxW="container.xl">
      <VStack spacing={12}>
        <Heading textAlign="center" size="2xl">
          Success Stories
        </Heading>
        <Text textAlign="center" fontSize="xl" color="gray.500" maxW="2xl">
          Hear from professionals who found their dream careers through TalentBridge
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard 
              key={index} 
              testimonial={testimonial} 
              bgColor={bgColor}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  </Box>
);

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState('signin');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Move color mode values to the component level
  const bgColor = useColorModeValue('white', 'gray.800');
  const iconBgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  // Auto-slide hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/jobs');
    } else {
      setAuthMode('signup');
      onOpen();
    }
  };

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    onOpen();
  };

  // Create a memoized steps array
  const steps = React.useMemo(() => [
    {
      icon: FaUser,
      title: "Create Profile",
      description: "Build your professional profile and showcase your skills"
    },
    {
      icon: FaSearch,
      title: "Discover Opportunities",
      description: "Browse through curated job listings matching your skills"
    },
    {
      icon: FaRocket,
      title: "Apply & Grow",
      description: "Apply with one click and track your applications"
    }
  ], []);

  // Create a Step component
  const Step = React.memo(({ icon, title, description }) => (
    <VStack
      bg={bgColor}
      p={8}
      rounded="xl"
      shadow="xl"
      spacing={4}
      _hover={{ transform: 'translateY(-8px)' }}
      transition="all 0.3s"
    >
      <Circle
        size="60px"
        bg={iconBgColor}
        color="blue.500"
      >
        <Icon as={icon} w={6} h={6} />
      </Circle>
      <Heading size="md">{title}</Heading>
      <Text textAlign="center" color="gray.500">
        {description}
      </Text>
    </VStack>
  ));

  // Create a Testimonial component
  const Testimonial = React.memo(({ testimonial }) => (
    <Box
      bg={bgColor}
      p={8}
      rounded="xl"
      shadow="xl"
      position="relative"
    >
      <VStack spacing={4}>
        <Avatar
          size="xl"
          src={testimonial.image}
          name={testimonial.name}
        />
        <Text fontSize="lg" fontStyle="italic">
          "{testimonial.text}"
        </Text>
        <VStack spacing={1}>
          <Text fontWeight="bold">{testimonial.name}</Text>
          <Text color="gray.500">
            {testimonial.role} at {testimonial.company}
          </Text>
        </VStack>
      </VStack>
    </Box>
  ));

  // Create a Company component
  const Company = React.memo(({ company }) => (
    <Box
      p={6}
      bg={bgColor}
      rounded="xl"
      shadow="md"
      _hover={{ transform: 'scale(1.05)' }}
      transition="all 0.3s"
    >
      <Image
        src={company.logo}
        alt={company.name}
        h="50px"
        objectFit="contain"
      />
    </Box>
  ));

  return (
    <Box>
      {/* Hero Section with Auto-sliding Background */}
      <Box position="relative" h="100vh" overflow="hidden">
        {HERO_IMAGES.map((image, index) => (
          <Box
            key={index}
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgImage={`url(${image})`}
            bgSize="cover"
            bgPosition="center"
            opacity={index === currentImageIndex ? 1 : 0}
            transition="opacity 1s ease-in-out"
            filter="brightness(0.7)"
          />
        ))}
        
        <Container maxW="container.xl" position="relative" h="full">
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="full"
            textAlign="center"
            color="white"
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heading
                fontSize={{ base: "4xl", md: "6xl" }}
                fontWeight="bold"
                mb={6}
                bgGradient="linear(to-r, white, blue.200)"
                bgClip="text"
              >
                Your Career Journey <br />
                Starts Here
              </Heading>
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                mb={8}
                maxW="800px"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                Connect with top companies, find your dream job, and take the next step in your career journey.
              </Text>
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={4}
                justify="center"
              >
                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={handleGetStarted}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                >
                  Get Started
                </Button>
                {!user && (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      onClick={() => handleAuthClick('signin')}
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="lg"
                      colorScheme="green"
                      onClick={() => handleAuthClick('signup')}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Stack>
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
            {[
              { number: "100K+", label: "Active Jobs" },
              { number: "50K+", label: "Companies" },
              { number: "1M+", label: "Job Seekers" },
              { number: "95%", label: "Success Rate" },
            ].map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                textAlign="center"
              >
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  color="blue.500"
                >
                  {stat.number}
                </Text>
                <Text color="gray.500">{stat.label}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={16}>
          <Feature
            icon={FaBriefcase}
            title="Smart Job Matching"
            text="Our AI-powered system connects you with the perfect opportunities based on your skills and preferences."
            image={IMAGES.workspace}
            bgColor={bgColor}
            iconBgColor={iconBgColor}
            textColor={textColor}
          />
          <Feature
            icon={FaUsers}
            title="Professional Network"
            text="Build meaningful connections with industry leaders and like-minded professionals."
            image={IMAGES.meeting}
            bgColor={bgColor}
            iconBgColor={iconBgColor}
            textColor={textColor}
          />
          <Feature
            icon={FaGraduationCap}
            title="Career Growth"
            text="Access resources and mentorship to accelerate your professional development."
            image={IMAGES.collaboration}
            bgColor={bgColor}
            iconBgColor={iconBgColor}
            textColor={textColor}
          />
        </VStack>
      </Container>

      {/* New Sections */}

      {/* How It Works Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading textAlign="center" size="2xl">
              How It Works
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {steps.map((step, index) => (
                <Step key={index} {...step} />
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Updated Companies Section */}
      <CompaniesSection bgColor={bgColor} />
      
      {/* Updated Testimonials Section */}
      <TestimonialsSection bgColor={bgColor} />
      
      {/* CTA Section */}
      <Box
        py={20}
        bgImage={`url(${IMAGES.success})`}
        bgSize="cover"
        bgPosition="center"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blue.900"
          opacity={0.8}
        />
        <Container maxW="container.xl" position="relative">
          <VStack spacing={8} color="white" textAlign="center">
            <Heading size="2xl">Ready to Start Your Journey?</Heading>
            <Text fontSize="xl" maxW="2xl">
              Join thousands of professionals who have already found their dream jobs through TalentBridge
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={handleGetStarted}
              rightIcon={<FaRocket />}
            >
              Get Started Now
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isOpen} 
        onClose={onClose} 
        initialMode={authMode}
      />
    </Box>
  );
};

export default LandingPage; 