import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  People,
  Business,
  Assignment,
  CardGiftcard,
  TrendingUp,
  School,
  Work,
  Description
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import CertificateManagement from '../Admin/CertificateManagement';
import SupervisorManagement from '../Admin/SupervisorManagement';
import InternshipManagement from '../Admin/InternshipManagement';
import ReportManagement from '../Admin/ReportManagement';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({ fullName: '', email: '', registrationNumber: '', password: '' });

  // Fetch data
  const { data: stats } = useQuery('admin-stats', () => apiService.getDashboardStats(), {
    refetchInterval: (data, query) => (query.state.error ? false : 5000),
    refetchOnWindowFocus: false,
    retry: 0,
  });
  const { data: students, isLoading: studentsLoading } = useQuery('students', () => apiService.getStudents(), {
    refetchInterval: (data, query) => (query.state.error ? false : 5000),
    refetchOnWindowFocus: false,
    retry: 0,
  });
  const { data: companies, isLoading: companiesLoading } = useQuery('companies', () => apiService.getCompanies(), {
    refetchInterval: (data, query) => (query.state.error ? false : 5000),
    refetchOnWindowFocus: false,
    retry: 0,
  });
  const { data: internships, isLoading: internshipsLoading } = useQuery('internships', () => apiService.getInternships(), {
    refetchInterval: (data, query) => (query.state.error ? false : 5000),
    refetchOnWindowFocus: false,
    retry: 0,
  });

  // Mutations
  const approveStudentMutation = useMutation(
    (studentId: number) => apiService.approveStudent(studentId),
    { onSuccess: () => queryClient.invalidateQueries('students') }
  );

  const generateCertificateMutation = useMutation(
    (studentId: number) => apiService.generateCertificate(studentId),
    { onSuccess: () => queryClient.invalidateQueries('admin-stats') }
  );

  const createStudentMutation = useMutation(
    (payload: any) => apiService.createStudent(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students');
        setCreateStudentOpen(false);
        setStudentForm({ fullName: '', email: '', registrationNumber: '', password: '' });
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApproveStudent = (studentId: number) => {
    approveStudentMutation.mutate(studentId);
  };

  const handleGenerateCertificate = (studentId: number) => {
    generateCertificateMutation.mutate(studentId);
  };

  const handleCreateStudent = () => {
    if (!studentForm.fullName || !studentForm.email || !studentForm.registrationNumber || !studentForm.password) return;
    createStudentMutation.mutate({
      fullName: studentForm.fullName,
      email: studentForm.email,
      registrationNumber: studentForm.registrationNumber,
      password: studentForm.password
    });
  };

  if (studentsLoading || companiesLoading || internshipsLoading) {
    return <Typography>Loading admin dashboard...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {stats?.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <People />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats?.totalCompanies || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Companies
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main' }}>
                  <Business />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="info.main">
                    {stats?.activeInternships || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Internships
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <Assignment />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats?.pendingApprovals || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
                  <TrendingUp />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Students" />
          <Tab label="Companies" />
          <Tab label="Supervisors" />
          <Tab label="Internships" />
          <Tab label="Reports" />
          <Tab label="Certificates" />
        </Tabs>

        {/* Students Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Student Management
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={() => setCreateStudentOpen(true)}>Create Student</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Registration Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students && students.length > 0 ? students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School />
                        {student.Name}
                      </Box>
                    </TableCell>
                    <TableCell>{student.Email}</TableCell>
                    <TableCell>{student.RegistrationNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.IsApproved ? 'Approved' : 'Pending'}
                        color={student.IsApproved ? 'success' : 'warning' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {!student.IsApproved && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleApproveStudent(student.Id)}
                          disabled={approveStudentMutation.isLoading}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Companies Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Company Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies && companies.length > 0 ? companies.map((company: any) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work />
                        {company.name}
                      </Box>
                    </TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.isApproved ? 'Approved' : 'Pending'}
                        color={company.isApproved ? 'success' : 'warning' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {!company.isApproved && (
                        <Button
                          size="small"
                          variant="outlined"
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No companies found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Supervisors Tab */}
        <TabPanel value={tabValue} index={2}>
          <SupervisorManagement />
        </TabPanel>

        {/* Internships Tab */}
        <TabPanel value={tabValue} index={3}>
          <InternshipManagement />
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={4}>
          <ReportManagement />
        </TabPanel>

        {/* Certificates Tab */}
        <TabPanel value={tabValue} index={5}>
          <CertificateManagement />
        </TabPanel>
      </Paper>

      {/* Create Student Dialog */}
      <Dialog open={createStudentOpen} onClose={() => setCreateStudentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Student</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            value={studentForm.fullName}
            onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Registration Number"
            value={studentForm.registrationNumber}
            onChange={(e) => setStudentForm({ ...studentForm, registrationNumber: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={studentForm.password}
            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateStudentOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateStudent}
            variant="contained"
            disabled={createStudentMutation.isLoading}
          >
            {createStudentMutation.isLoading ? 'Creating...' : 'Create Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
