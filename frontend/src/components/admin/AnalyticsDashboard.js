import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Select,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
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
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import moment from 'moment';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState({
    salesData: [],
    categoryData: [],
    userStats: {},
  });

  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/admin/analytics?range=${timeRange}`);
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const salesChartData = {
    labels: analyticsData.salesData.map(d => moment(d.date).format('MMM DD')),
    datasets: [
      {
        label: 'Sales',
        data: analyticsData.salesData.map(d => d.amount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryChartData = {
    labels: analyticsData.categoryData.map(d => d.name),
    datasets: [
      {
        data: analyticsData.categoryData.map(d => d.sales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const userStatsData = {
    labels: ['New Users', 'Returning Users'],
    datasets: [
      {
        data: [
          analyticsData.userStats.newUsers || 0,
          analyticsData.userStats.returningUsers || 0,
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading>Analytics Dashboard</Heading>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          w="200px"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </Select>
      </Stack>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Sales Trend</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Line data={salesChartData} options={chartOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Sales by Category</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Pie data={categoryChartData} options={pieOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">User Statistics</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Pie data={userStatsData} options={pieOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Key Metrics</Heading>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Box>
                <Text fontWeight="bold">Conversion Rate</Text>
                <Text fontSize="2xl">
                  {((analyticsData.userStats.conversionRate || 0) * 100).toFixed(2)}%
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Average Order Value</Text>
                <Text fontSize="2xl">
                  ${(analyticsData.userStats.averageOrderValue || 0).toFixed(2)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Customer Retention Rate</Text>
                <Text fontSize="2xl">
                  {((analyticsData.userStats.retentionRate || 0) * 100).toFixed(2)}%
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 