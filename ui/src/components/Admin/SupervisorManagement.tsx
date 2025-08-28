import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  People,
  Business,
  School,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Refresh,
  Visibility,
  Email,
  Phone
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SupervisorManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companyId: '',
    role: 'CompanySupervisor'
  });
  const queryClient = useQueryClient();

  // Fetch data
  const { data: companySupervisors, isLoading: companySupervisorsLoading } = useQuery(
    'company-supervisors',
    () => apiService.getCompanySupervisors(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const { data: universitySupervisors, isLoading: universitySupervisorsLoading } = useQuery(
    'university-supervisors',
    () => apiService.getUniversitySupervisors(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const { data: companies } = useQuery(
    'companies',
    () => apiService.getCompanies(),
    { refetchInterval: 10000, refetchOnWindowFocus: true }
  );

  // Mutations
  const createCompanySupervisorMutation = useMutation(
    (data: any) => apiService.createCompanySupervisor(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('company-supervisors');
        setCreateDialogOpen(false);
        setFormData({ fullName: '', email: '', password: '', companyId: '', role: 'CompanySupervisor' });
      }
    }
  );

  const createUniversitySupervisorMutation = useMutation(
    (data: any) => apiService.createUniversitySupervisor(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('university-supervisors');
        setCreateDialogOpen(false);
        setFormData({ fullName: '', email: '', password: '', companyId: '', role: 'UniversitySupervisor' });
      }
    }
  );

  const approveCompanySupervisorMutation = useMutation(
    ({ id, approve }: { id: number; approve: boolean }) => 
      apiService.approveCompanySupervisor(id, approve),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('company-supervisors');
      }
    }
  );

  const approveUniversitySupervisorMutation = useMutation(
    ({ id, approve }: { id: number; approve: boolean }) => 
      apiService.approveUniversitySupervisor(id, approve),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('university-supervisors');
      }
    }
  );

  const deleteUniversitySupervisorMutation = useMutation(
    (id: number) => apiService.deleteUniversitySupervisor(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('university-supervisors');
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateSupervisor = () => {
    if (formData.role === 'CompanySupervisor') {
      createCompanySupervisorMutation.mutate({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        companyId: parseInt(formData.companyId)
      });
    } else {
      createUniversitySupervisorMutation.mutate({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
    }
  };

  const handleViewSupervisor = (supervisor: any) => {
    setSelectedSupervisor(supervisor);
    setViewDialogOpen(true);
  };

  const handleApproveSupervisor = (id: number, approve: boolean, type: 'company' | 'university') => {
    if (type === 'company') {
      approveCompanySupervisorMutation.mutate({ id, approve });
    } else {
      approveUniversitySupervisorMutation.mutate({ id, approve });
    }
  };

  const handleDeleteSupervisor = (id: number) => {
    if (window.confirm('Are you sure you want to delete this supervisor?')) {
      deleteUniversitySupervisorMutation.mutate(id);
    }
  };

  const isLoading = companySupervisorsLoading || universitySupervisorsLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Supervisor Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {companySupervisors?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Company Supervisors
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
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
                  <Typography variant="h4" component="div" color="success.main">
                    {universitySupervisors?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    University Supervisors
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main' }}>
                  <School />
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
                    {companySupervisors?.filter((s: any) => !s.isApproved).length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
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
                  <Typography variant="h4" component="div" color="info.main">
                    {companies?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Companies
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <Business />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Supervisor
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            queryClient.invalidateQueries('company-supervisors');
            queryClient.invalidateQueries('university-supervisors');
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="supervisor tabs">
          <Tab label="Company Supervisors" />
          <Tab label="University Supervisors" />
        </Tabs>

        {/* Company Supervisors Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companySupervisors && companySupervisors.length > 0 ? companySupervisors.map((supervisor: any) => (
                  <TableRow key={supervisor.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People />
                        {supervisor.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email />
                        {supervisor.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business />
                        {supervisor.company}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supervisor.isApproved ? 'Approved' : 'Pending'}
                        color={supervisor.isApproved ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSupervisor(supervisor)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {!supervisor.isApproved ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApproveSupervisor(supervisor.id, true, 'company')}
                            disabled={approveCompanySupervisorMutation.isLoading}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<Cancel />}
                            onClick={() => handleApproveSupervisor(supervisor.id, false, 'company')}
                            disabled={approveCompanySupervisorMutation.isLoading}
                          >
                            Revoke
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No company supervisors found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* University Supervisors Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {universitySupervisors && universitySupervisors.length > 0 ? universitySupervisors.map((supervisor: any) => (
                  <TableRow key={supervisor.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School />
                        {supervisor.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email />
                        {supervisor.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supervisor.isActive ? 'Active' : 'Inactive'}
                        color={supervisor.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSupervisor(supervisor)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Button
                          size="small"
                          variant="outlined"
                          color={supervisor.isActive ? 'warning' : 'success'}
                          startIcon={supervisor.isActive ? <Cancel /> : <CheckCircle />}
                          onClick={() => handleApproveSupervisor(supervisor.id, !supervisor.isActive, 'university')}
                          disabled={approveUniversitySupervisorMutation.isLoading}
                        >
                          {supervisor.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Tooltip title="Delete Supervisor">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSupervisor(supervisor.id)}
                            disabled={deleteUniversitySupervisorMutation.isLoading}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No university supervisors found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Create Supervisor Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Supervisor</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Supervisor Type</InputLabel>
              <Select
                value={formData.role}
                label="Supervisor Type"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="CompanySupervisor">Company Supervisor</MenuItem>
                <MenuItem value="UniversitySupervisor">University Supervisor</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
            />
            {formData.role === 'CompanySupervisor' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Company</InputLabel>
                <Select
                  value={formData.companyId}
                  label="Company"
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  required
                >
                  {companies?.map((company: any) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {(createCompanySupervisorMutation.isError || createUniversitySupervisorMutation.isError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to create supervisor. Please try again.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSupervisor}
            variant="contained"
            disabled={
              !formData.fullName || 
              !formData.email || 
              !formData.password || 
              (formData.role === 'CompanySupervisor' && !formData.companyId) ||
              createCompanySupervisorMutation.isLoading ||
              createUniversitySupervisorMutation.isLoading
            }
            startIcon={
              (createCompanySupervisorMutation.isLoading || createUniversitySupervisorMutation.isLoading) 
                ? <CircularProgress size={16} /> 
                : <Add />
            }
          >
            {(createCompanySupervisorMutation.isLoading || createUniversitySupervisorMutation.isLoading) 
              ? 'Creating...' 
              : 'Create Supervisor'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Supervisor Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Supervisor Details</DialogTitle>
        <DialogContent>
          {selectedSupervisor && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedSupervisor.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedSupervisor.email}</Typography>
                </Grid>
                {selectedSupervisor.company && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                    <Typography variant="body1">{selectedSupervisor.company}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedSupervisor.isApproved !== undefined 
                      ? (selectedSupervisor.isApproved ? 'Approved' : 'Pending')
                      : (selectedSupervisor.isActive ? 'Active' : 'Inactive')
                    } 
                    color={
                      selectedSupervisor.isApproved !== undefined
                        ? (selectedSupervisor.isApproved ? 'success' : 'warning')
                        : (selectedSupervisor.isActive ? 'success' : 'error')
                    } 
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupervisorManagement;
