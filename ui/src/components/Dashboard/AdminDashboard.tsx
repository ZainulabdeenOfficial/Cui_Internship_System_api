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
  Tab,
  Alert
} from '@mui/material';
import {
  People,
  Business,
  Assignment,
  CardGiftcard,
  TrendingUp,
  School,
  Work
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

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
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // Fetch data
  const { data: stats } = useQuery('admin-stats', apiService.getDashboardStats);
  const { data: students, isLoading: studentsLoading } = useQuery('students', apiService.getStudents);
  const { data: companies, isLoading: companiesLoading } = useQuery('companies', apiService.getCompanies);
  const { data: internships, isLoading: internshipsLoading } = useQuery('internships', apiService.getInternships);

  // Mutations
  const approveStudentMutation = useMutation(
    (studentId: number) => apiService.approveStudent(studentId),
    { onSuccess: () => queryClient.invalidateQueries('students') }
  );

  const generateCertificateMutation = useMutation(
    (studentId: number) => apiService.generateCertificate(studentId),
    { onSuccess: () => queryClient.invalidateQueries('admin-stats') }
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
          <Tab label="Reports" />
          <Tab label="Certificates" />
        </Tabs>

        {/* Students Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Student Management
          </Typography>
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
                {students?.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School />
                        {student.user?.fullName}
                      </Box>
                    </TableCell>
                    <TableCell>{student.user?.email}</TableCell>
                    <TableCell>{student.registrationNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.isApproved ? 'Approved' : 'Pending'}
                        color={student.isApproved ? 'success' : 'warning' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {!student.isApproved && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleApproveStudent(student.id)}
                          disabled={approveStudentMutation.isLoading}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
                {companies?.map((company: any) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Reports Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekly Reports
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.weeklyReports || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Final Reports
                  </Typography>
                  <Typography variant="h4" color="success">
                    {stats?.finalReports || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Records
                  </Typography>
                  <Typography variant="h4" color="info">
                    {stats?.attendanceRecords || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Certificates Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Certificate Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {internships?.filter((i: any) => i.status === 'Completed').map((internship: any) => (
                  <TableRow key={internship.id}>
                    <TableCell>{internship.student?.user?.fullName}</TableCell>
                    <TableCell>{internship.company?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={internship.certificate ? 'Issued' : 'Pending'}
                        color={internship.certificate ? 'success' : 'warning' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {!internship.certificate && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CardGiftcard />}
                          onClick={() => handleGenerateCertificate(internship.student?.id)}
                          disabled={generateCertificateMutation.isLoading}
                        >
                          Generate Certificate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
