import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button
} from '@mui/material';
import {
  Work,
  Assignment,
  Assessment,
  EventNote,
  TrendingUp,
  People
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { InternshipStatus } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: internships } = useQuery('internships', apiService.getInternships, {
    enabled: !!user
  });



  const getStatusColor = (status: InternshipStatus) => {
    switch (status) {
      case InternshipStatus.Active:
        return 'success';
      case InternshipStatus.Completed:
        return 'primary';
      case InternshipStatus.Pending:
        return 'warning';
      case InternshipStatus.Rejected:
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleSpecificStats = () => {
    if (!internships) return [];

    switch (user?.role) {
      case 'Admin':
        return [
          {
            title: 'Total Internships',
            value: internships.length,
            icon: <Work />,
            color: 'primary'
          },
          {
            title: 'Active Internships',
            value: internships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <TrendingUp />,
            color: 'success'
          },
          {
            title: 'Pending Approvals',
            value: internships.filter(i => i.status === InternshipStatus.Pending).length,
            icon: <Assignment />,
            color: 'warning'
          },
          {
            title: 'Completed',
            value: internships.filter(i => i.status === InternshipStatus.Completed).length,
            icon: <Assessment />,
            color: 'info'
          }
        ];
      case 'Student':
        const studentInternships = internships.filter(i => i.student?.user?.id === user.id);
        return [
          {
            title: 'My Internships',
            value: studentInternships.length,
            icon: <Work />,
            color: 'primary'
          },
          {
            title: 'Active Internships',
            value: studentInternships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <TrendingUp />,
            color: 'success'
          },
          {
            title: 'Pending Reports',
            value: studentInternships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <Assignment />,
            color: 'warning'
          }
        ];
      case 'CompanySupervisor':
        const companyInternships = internships.filter(i => i.companySupervisorId);
        return [
          {
            title: 'Supervised Internships',
            value: companyInternships.length,
            icon: <Work />,
            color: 'primary'
          },
          {
            title: 'Active Internships',
            value: companyInternships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <TrendingUp />,
            color: 'success'
          },
          {
            title: 'Reports to Review',
            value: companyInternships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <Assessment />,
            color: 'warning'
          }
        ];
      case 'UniversitySupervisor':
        const uniInternships = internships.filter(i => i.universitySupervisorId);
        return [
          {
            title: 'Supervised Internships',
            value: uniInternships.length,
            icon: <Work />,
            color: 'primary'
          },
          {
            title: 'Active Internships',
            value: uniInternships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <TrendingUp />,
            color: 'success'
          },
          {
            title: 'Reports to Review',
            value: uniInternships.filter(i => i.status === InternshipStatus.Active).length,
            icon: <Assessment />,
            color: 'warning'
          }
        ];
      default:
        return [];
    }
  };

  const getRecentInternships = () => {
    if (!internships) return [];
    
    const userInternships = user?.role === 'Student' 
      ? internships.filter(i => i.student?.user?.id === user.id)
      : user?.role === 'CompanySupervisor'
      ? internships.filter(i => i.companySupervisorId)
      : user?.role === 'UniversitySupervisor'
      ? internships.filter(i => i.universitySupervisorId)
      : internships;

    return userInternships.slice(0, 5);
  };

  const stats = getRoleSpecificStats();
  const recentInternships = getRecentInternships();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your internships
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Internships */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Internships
            </Typography>
            {recentInternships.length > 0 ? (
              <List>
                {recentInternships.map((internship) => (
                  <ListItem key={internship.id} divider>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${internship.student?.user?.fullName || 'Student'} - ${internship.company?.name || 'Company'}`}
                      secondary={`Started: ${internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'Not started'}`}
                    />
                    <Chip
                      label={internship.status}
                      color={getStatusColor(internship.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No internships found.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {user?.role === 'Student' && (
                <Button variant="contained" startIcon={<Work />}>
                  Request New Internship
                </Button>
              )}
              {user?.role === 'Student' && (
                <Button variant="outlined" startIcon={<Assignment />}>
                  Submit Weekly Report
                </Button>
              )}
              {user?.role === 'Admin' && (
                <Button variant="contained" startIcon={<People />}>
                  Manage Users
                </Button>
              )}
              <Button variant="outlined" startIcon={<EventNote />}>
                View Attendance
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
