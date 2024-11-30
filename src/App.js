import theme from './theme';
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Spinner, Center, useToast } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import MainLayout from './components/MainLayout';
import { AnimatePresence } from 'framer-motion';
import { useRoleNavigation } from './hooks/useRoleNavigation';

// Lazy loaded components
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const CompanyDashboard = React.lazy(() => import('./components/CompanyDashboard'));
const JobSeekerDashboard = React.lazy(() => import('./components/JobSeekerDashboard'));
const CompanyProfile = React.lazy(() => import('./components/CompanyProfile'));
const JobDetails = React.lazy(() => import('./components/JobDetails'));
const Applications = React.lazy(() => import('./components/Applications'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const AdminJobs = React.lazy(() => import('./components/AdminJobs'));
const AdminUsers = React.lazy(() => import('./components/AdminUsers'));
const AdminApplications = React.lazy(() => import('./components/AdminApplications'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));
const SavedJobs = React.lazy(() => import('./components/SavedJobs'));
const ApplicationHistory = React.lazy(() => import('./components/ApplicationHistory'));
const DocumentViewer = React.lazy(() => import('./components/DocumentViewer'));
const ApplicationReview = React.lazy(() => import('./components/ApplicationReview'));
const JobApplicationForm = React.lazy(() => import('./components/JobApplicationForm'));

// Auth Guard Component
const AuthGuard = ({ children }) => {
  const { user, userType } = useAuth();
  const { getDefaultRoute } = useRoleNavigation();

  if (user) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return children;
};

// Protected Route Component with role-based access
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userType } = useAuth();
  const toast = useToast();
  const { navigateToDefault } = useRoleNavigation();

  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access this page.",
      status: "warning",
      duration: 3000,
    });
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(userType)) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      status: "error",
      duration: 3000,
    });
    return <Navigate to={navigateToDefault()} />;
  }

  return children;
};

// Loading Component
const LoadingScreen = () => (
  <Center h="100vh">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />
  </Center>
);

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <JobProvider>
          <Router>
            <MainLayout>
              <AnimatePresence mode="wait">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Public Route with Auth Guard */}
                    <Route 
                      path="/" 
                      element={
                        <AuthGuard>
                          <LandingPage />
                        </AuthGuard>
                      } 
                    />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="/jobs" element={<AdminJobs />} />
                            <Route path="/users" element={<AdminUsers />} />
                            <Route path="/applications" element={<AdminApplications />} />
                            <Route path="/jobs/:jobId/applications" element={<ApplicationReview />} />
                          </Routes>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Company Routes */}
                    <Route 
                      path="/company/*" 
                      element={
                        <ProtectedRoute allowedRoles={['company']}>
                          <Routes>
                            <Route path="/" element={<CompanyDashboard />} />
                            <Route path="/profile" element={<CompanyProfile />} />
                            <Route path="/jobs/:jobId/applications" element={<ApplicationReview />} />
                            <Route path="/documents" element={<DocumentViewer />} />
                          </Routes>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Job Seeker Routes */}
                    <Route 
                      path="/jobs/*" 
                      element={
                        <ProtectedRoute allowedRoles={['applicant']}>
                          <Routes>
                            <Route path="/" element={<JobSeekerDashboard />} />
                            <Route path="/:jobId" element={<JobDetails />} />
                            <Route path="/:jobId/apply" element={<JobApplicationForm />} />
                            <Route path="/saved" element={<SavedJobs />} />
                            <Route path="/applications" element={<ApplicationHistory />} />
                            <Route path="/documents" element={<DocumentViewer />} />
                          </Routes>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Shared Routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute allowedRoles={['applicant', 'company']}>
                          <UserProfile />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Document Management Routes */}
                    <Route
                      path="/documents/*"
                      element={
                        <ProtectedRoute allowedRoles={['applicant', 'company', 'admin']}>
                          <Routes>
                            <Route path="/" element={<DocumentViewer />} />
                            <Route path="/:documentId" element={<DocumentViewer />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* Application Management Routes */}
                    <Route
                      path="/applications/*"
                      element={
                        <ProtectedRoute allowedRoles={['applicant', 'company', 'admin']}>
                          <Routes>
                            <Route path="/" element={<ApplicationHistory />} />
                            <Route path="/:applicationId" element={<ApplicationReview />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </MainLayout>
          </Router>
        </JobProvider>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
