import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaChartLine,
  FaUserCheck,
  FaBuilding,
} from 'react-icons/fa';
import { db } from '../config/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './common/DashboardCard';
import JobCard from './common/JobCard';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    verifiedUsers: 0,
    activeCompanies: 0,
    jobSuccess: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const bgColor = useColorModeValue('white', 'gray.800');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const companiesSnapshot = await getDocs(
        query(collection(db, 'users'), where('userType', '==', 'company'))
      );

      // Calculate stats
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const companies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalApplications: jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0),
        verifiedUsers: users.filter(user => user.isVerified).length,
        activeCompanies: companies.filter(company => company.status === 'active').length,
        jobSuccess: Math.round((jobs.filter(job => job.status === 'filled').length / jobs.length) * 100),
      });

      // Set recent jobs
      setRecentJobs(jobs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      change: '+12%',
      accentColor: 'blue',
    },
    {
      title: 'Active Jobs',
      value: stats.totalJobs,
      icon: FaBriefcase,
      change: '+8%',
      accentColor: 'green',
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      icon: FaFileAlt,
      change: '+15%',
      accentColor: 'purple',
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers,
      icon: FaUserCheck,
      change: '+5%',
      accentColor: 'cyan',
    },
    {
      title: 'Active Companies',
      value: stats.activeCompanies,
      icon: FaBuilding,
      change: '+10%',
      accentColor: 'orange',
    },
    {
      title: 'Job Success Rate',
      value: `${stats.jobSuccess}%`,
      icon: FaChartLine,
      change: '+3%',
      accentColor: 'pink',
    },
  ];

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Text>Loading dashboard data...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {dashboardCards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </SimpleGrid>

        {/* Tabs Section */}
        <Box bg={bgColor} rounded="lg" shadow="base" p={6}>
          <Tabs colorScheme="blue">
            <TabList>
              <Tab>Recent Jobs</Tab>
              <Tab>Recent Applications</Tab>
              <Tab>User Activity</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {recentJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isCompact
                      onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    />
                  ))}
                </SimpleGrid>
              </TabPanel>
              <TabPanel>
                <Text>Recent applications will be displayed here</Text>
              </TabPanel>
              <TabPanel>
                <Text>User activity will be displayed here</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default AdminDashboard; 