import React from 'react';
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
  Alert
} from '@mui/material';
import {
  People,
  CheckCircle,
  Assignment,
  Business,
  School,
  TrendingUp
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import apiService from '../../services/api';

const UniversitySupervisorDashboard: React.FC = () => {
  // Fetch assigned students/internships
  const { data: assignedStudents, isLoading } = useQuery(
    'university-students',
    () => apiService.getUniversityStudents(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Fetch weekly reports
  const { data: weeklyReports } = useQuery(
    'weekly-reports-university',
    () => apiService.getWeeklyReports(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const getStats = () => {
    if (!assignedStudents) return { total: 0, active: 0, completed: 0, pendingReports: 0 };
    
    const total = assignedStudents.length;
    const active = assignedStudents.filter((s: any) => s.status === 'Active').length;
    const completed = assignedStudents.filter((s: any) => s.status === 'Completed').length;
    const pendingReports = weeklyReports?.filter((r: any) => r.status === 'Submitted').length || 0;
    
    return { total, active, completed, pendingReports };
  };

  const stats = getStats();

  if (isLoading) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        University Supervisor Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Students
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
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Internships
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main' }}>
                  <CheckCircle />
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
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Internships
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <TrendingUp />
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
                    {stats.pendingReports}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reviews
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
                  <Assignment />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assigned Students Table */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Assigned Students
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Registration Number</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedStudents?.map((internship: any) => (
                <TableRow key={internship.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School />
                      {internship.student?.user?.fullName}
                    </Box>
                  </TableCell>
                  <TableCell>{internship.student?.registrationNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business />
                      {internship.company?.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={internship.status}
                      color={internship.status === 'Active' ? 'success' : 
                             internship.status === 'Completed' ? 'info' : 'warning' as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={internship.status !== 'Active'}
                    >
                      Complete Internship
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!assignedStudents || assignedStudents.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No assigned students found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Alert severity="info">
        Use the navigation menu to access attendance monitoring, report review, and certificate management features.
      </Alert>
    </Box>
  );
};

export default UniversitySupervisorDashboard;
