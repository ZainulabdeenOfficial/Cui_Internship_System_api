import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';

// Role-specific pages
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import CompanySupervisorDashboard from './components/Dashboard/CompanySupervisorDashboard';
import UniversitySupervisorDashboard from './components/Dashboard/UniversitySupervisorDashboard';

// Feature pages
import Companies from './components/Companies/CompanyList';
import Internships from './components/Internships/InternshipList';
import Attendance from './components/Attendance/AttendanceList';
import Reports from './components/Reports/ReportList';
import Certificates from './components/Certificates/CertificateList';
import Profile from './components/Profile/Profile';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Role-based Dashboard Component
const RoleDashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Student':
      return <StudentDashboard />;
    case 'CompanySupervisor':
      return <CompanySupervisorDashboard />;
    case 'UniversitySupervisor':
      return <UniversitySupervisorDashboard />;
    default:
      return <Dashboard />;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<RoleDashboard />} />
                    
                    {/* Student Routes */}
                    <Route path="companies" element={
                      <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                        <Companies />
                      </ProtectedRoute>
                    } />
                    <Route path="internships" element={
                      <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                        <Internships />
                      </ProtectedRoute>
                    } />
                    <Route path="attendance" element={
                      <ProtectedRoute allowedRoles={['Student', 'CompanySupervisor', 'UniversitySupervisor', 'Admin']}>
                        <Attendance />
                      </ProtectedRoute>
                    } />
                    <Route path="reports" element={
                      <ProtectedRoute allowedRoles={['Student', 'CompanySupervisor', 'UniversitySupervisor', 'Admin']}>
                        <Reports />
                      </ProtectedRoute>
                    } />
                    <Route path="certificates" element={
                      <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                        <Certificates />
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Box>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
