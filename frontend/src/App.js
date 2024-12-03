import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/admin/Dashboard';
import ProductManagement from './components/admin/ProductManagement';
import OrderManagement from './components/admin/OrderManagement';
import UserManagement from './components/admin/UserManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import ProductBrowser from './components/products/ProductBrowser';
import ProductDetails from './components/products/ProductDetails';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import OrderDetails from './components/dashboard/OrderDetails';
import Profile from './components/auth/Profile';
import LandingPage from './components/landing/LandingPage';
import Navbar from './components/layout/Navbar';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <ChakraProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<ProductBrowser />} />
                <Route path="/products/:id" element={<ProductDetails />} />
              </Route>

              {/* Protected routes with DashboardLayout */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                {/* User routes */}
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/dashboard/orders" element={<OrderDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/admin/orders" element={<OrderManagement />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/categories" element={<CategoryManagement />} />
                </Route>
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}

export default App;
