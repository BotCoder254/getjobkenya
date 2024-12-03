import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  Input,
  Stack,
  Heading,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMoreVertical, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import axios from 'axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/admin/orders?status=${filter}`);
      setOrders(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching orders',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status });
      toast({
        title: 'Order updated',
        description: 'Order status has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Error updating order',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const exportOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Error exporting orders',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={4}>
      <Stack spacing={4}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
        >
          <Heading size="lg">Order Management</Heading>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="brand"
            onClick={exportOrders}
          >
            Export Orders
          </Button>
        </Stack>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          align={{ base: 'stretch', md: 'center' }}
        >
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
        </Stack>

        <Box overflowX="auto">
          <Table variant="simple" bg={bgColor}>
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.map((order) => (
                <Tr key={order._id}>
                  <Td>{order.orderNumber}</Td>
                  <Td>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</Td>
                  <Td>{order.customer.name}</Td>
                  <Td>${order.total.toFixed(2)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem onClick={() => updateOrderStatus(order._id, 'processing')}>
                          Mark as Processing
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order._id, 'shipped')}>
                          Mark as Shipped
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order._id, 'delivered')}>
                          Mark as Delivered
                        </MenuItem>
                        <MenuItem onClick={() => updateOrderStatus(order._id, 'cancelled')}>
                          Cancel Order
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Stack>
    </Box>
  );
};

export default OrderManagement; 