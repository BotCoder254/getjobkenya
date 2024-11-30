import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Divider,
  SimpleGrid,
  Icon,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaBriefcase,
  FaGraduationCap,
} from 'react-icons/fa';
import VerifiedBadge from './common/VerifiedBadge';
import ProfileActions from './common/ProfileActions';
import { useAuth } from '../contexts/AuthContext';

const ProfileView = ({ profile, isPreview = false, showActions = true }) => {
  const { userType } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const ProfileSection = ({ title, children }) => (
    <Box>
      <Text fontWeight="bold" mb={2}>{title}</Text>
      {children}
    </Box>
  );

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const experience = Array.isArray(profile?.experience) ? profile.experience : [];
  const education = Array.isArray(profile?.education) ? profile.education : [];

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <HStack spacing={6} align="start">
          <Avatar
            size="2xl"
            src={profile?.photoURL}
            name={profile?.displayName}
          />
          <VStack align="start" spacing={2} flex={1}>
            <HStack>
              <Text fontSize="2xl" fontWeight="bold">
                {profile?.displayName}
              </Text>
              {profile?.isVerified && <VerifiedBadge />}
            </HStack>
            <Text color="gray.500">{profile?.title}</Text>
            <HStack spacing={4}>
              {profile?.location && (
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="gray.500" />
                  <Text>{profile.location}</Text>
                </HStack>
              )}
              {profile?.email && (
                <HStack>
                  <Icon as={FaEnvelope} color="gray.500" />
                  <Text>{profile.email}</Text>
                </HStack>
              )}
            </HStack>
            {showActions && userType === 'company' && (
              <ProfileActions
                profileId={profile?.id}
                isVerified={profile?.isVerified}
              />
            )}
          </VStack>
        </HStack>

        {!isPreview && (
          <>
            <Divider />

            {/* About Section */}
            {profile?.bio && (
              <ProfileSection title="About">
                <Text>{profile.bio}</Text>
              </ProfileSection>
            )}

            {/* Skills Section */}
            {skills.length > 0 && (
              <ProfileSection title="Skills">
                <HStack wrap="wrap" spacing={2}>
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      colorScheme="blue"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {skill}
                    </Badge>
                  ))}
                </HStack>
              </ProfileSection>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <ProfileSection title="Experience">
                <VStack align="stretch" spacing={4}>
                  {experience.map((exp, index) => (
                    <Box key={index}>
                      <Text fontWeight="medium">{exp.title}</Text>
                      <Text color="gray.500">{exp.company}</Text>
                      <Text fontSize="sm">{exp.duration}</Text>
                    </Box>
                  ))}
                </VStack>
              </ProfileSection>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <ProfileSection title="Education">
                <VStack align="stretch" spacing={4}>
                  {education.map((edu, index) => (
                    <Box key={index}>
                      <Text fontWeight="medium">{edu.degree}</Text>
                      <Text color="gray.500">{edu.school}</Text>
                      <Text fontSize="sm">{edu.year}</Text>
                    </Box>
                  ))}
                </VStack>
              </ProfileSection>
            )}

            {/* Links Section */}
            {profile?.links && (
              <ProfileSection title="Links">
                <SimpleGrid columns={3} spacing={4}>
                  {profile.links?.linkedin && (
                    <Link href={profile.links.linkedin} isExternal>
                      <HStack>
                        <Icon as={FaLinkedin} />
                        <Text>LinkedIn</Text>
                      </HStack>
                    </Link>
                  )}
                  {profile.links?.github && (
                    <Link href={profile.links.github} isExternal>
                      <HStack>
                        <Icon as={FaGithub} />
                        <Text>GitHub</Text>
                      </HStack>
                    </Link>
                  )}
                  {profile.links?.portfolio && (
                    <Link href={profile.links.portfolio} isExternal>
                      <HStack>
                        <Icon as={FaGlobe} />
                        <Text>Portfolio</Text>
                      </HStack>
                    </Link>
                  )}
                </SimpleGrid>
              </ProfileSection>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ProfileView; 