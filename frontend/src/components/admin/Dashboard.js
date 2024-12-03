import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    orderGrowth: 0,
    revenueData: [],
    orderData: [],
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const revenueChartData = {
    labels: stats.revenueData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: stats.revenueData.map(d => d.amount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const orderChartData = {
    labels: stats.orderData.map(d => d.date),
    datasets: [
      {
        label: 'Orders',
        data: stats.orderData.map(d => d.count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Dashboard</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor}>
          <CardHeader>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{stats.totalOrders}</StatNumber>
              <StatHelpText>
                <StatArrow type={stats.orderGrowth >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(stats.orderGrowth)}%
              </StatHelpText>
            </Stat>
          </CardHeader>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>${stats.totalRevenue.toFixed(2)}</StatNumber>
            </Stat>
          </CardHeader>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Stat>
              <StatLabel>Average Order Value</StatLabel>
              <StatNumber>${stats.averageOrderValue.toFixed(2)}</StatNumber>
            </Stat>
          </CardHeader>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Stat>
              <StatLabel>Conversion Rate</StatLabel>
              <StatNumber>{(stats.conversionRate * 100).toFixed(1)}%</StatNumber>
            </Stat>
          </CardHeader>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Revenue Trend</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Line data={revenueChartData} options={chartOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Order Trend</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Bar data={orderChartData} options={chartOptions} />
            </Box>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Dashboard; 