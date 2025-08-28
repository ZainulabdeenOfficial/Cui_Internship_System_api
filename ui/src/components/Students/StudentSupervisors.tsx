import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  School,
  Business,
  Person,
  Email,
  ExpandMore,
  SupervisorAccount
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { StudentSupervisors } from '../../types';

const StudentSupervisors: React.FC = () => {
  const { user } = useAuth();
  const [expandedInternship, setExpandedInternship] = React.useState<number | null>(null);

  const { data: supervisorsData, isLoading, error } = useQuery(
    ['student-supervisors', user?.id],
    () => apiService.getMySupervisors(),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const handleAccordionChange = (internshipId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedInternship(isExpanded ? internshipId : null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading supervisor information. Please try again later.
      </Alert>
    );
  }

  if (!supervisorsData || supervisorsData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <SupervisorAccount sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Supervisors Assigned
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your supervisors will appear here once they are assigned to your internship.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <SupervisorAccount sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          My Supervisors
        </Typography>
      </Box>

      {supervisorsData.map((internship: StudentSupervisors) => (
        <Accordion
          key={internship.internshipId}
          expanded={expandedInternship === internship.internshipId}
          onChange={handleAccordionChange(internship.internshipId)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" width="100%">
              <Box flexGrow={1}>
                <Typography variant="h6">
                  {internship.companyName || 'Unknown Company'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: <Chip label={internship.status} size="small" color="primary" />
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  {internship.universitySupervisor ? 'University Supervisor Assigned' : 'No University Supervisor'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {internship.companySupervisor ? 'Company Supervisor Assigned' : 'No Company Supervisor'}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* University Supervisor */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <School sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">
                        University Supervisor
                      </Typography>
                    </Box>
                    
                    {internship.universitySupervisor ? (
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={internship.universitySupervisor.name}
                            secondary={
                              <Box>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <Email sx={{ fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2">
                                    {internship.universitySupervisor.email}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label="University Supervisor" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <School sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No university supervisor assigned yet.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Contact your admin to assign a university supervisor.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Company Supervisor */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Business sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6">
                        Company Supervisor
                      </Typography>
                    </Box>
                    
                    {internship.companySupervisor ? (
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={internship.companySupervisor.name}
                            secondary={
                              <Box>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <Email sx={{ fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2">
                                    {internship.companySupervisor.email}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label="Company Supervisor" 
                                  size="small" 
                                  color="secondary" 
                                  variant="outlined"
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No company supervisor assigned yet.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This will be assigned by your internship company.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Contact Information */}
            {(internship.universitySupervisor || internship.companySupervisor) && (
              <Box mt={3}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  {internship.universitySupervisor && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          University Supervisor Contact
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Name:</strong> {internship.universitySupervisor.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {internship.universitySupervisor.email}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {internship.companySupervisor && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="secondary" gutterBottom>
                          Company Supervisor Contact
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Name:</strong> {internship.companySupervisor.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {internship.companySupervisor.email}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Summary */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Supervisor Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent textAlign="center">
                <Typography variant="h4" color="primary">
                  {supervisorsData.filter((s: StudentSupervisors) => s.universitySupervisor).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  University Supervisors Assigned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent textAlign="center">
                <Typography variant="h4" color="secondary">
                  {supervisorsData.filter((s: StudentSupervisors) => s.companySupervisor).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Company Supervisors Assigned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent textAlign="center">
                <Typography variant="h4" color="info.main">
                  {supervisorsData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Internships
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentSupervisors;
