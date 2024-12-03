import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';
import BulkOperations from './BulkOperations';
import ProductSearch from './ProductSearch';
import AnalyticsDashboard from './AnalyticsDashboard';
import Settings from './Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const toast = useToast();

  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size="xl"
        />
      </Box>
    );
  }

  if (!user || user.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You need admin privileges to access this area.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="bulk-operations" element={<BulkOperations />} />
                <Route path="product-search" element={<ProductSearch />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes; 