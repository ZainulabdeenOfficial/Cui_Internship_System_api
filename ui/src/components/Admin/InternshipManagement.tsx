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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Work,
  School,
  Business,
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  CalendarToday,
  Person,
  CheckCircle,
  Cancel,
  Pending,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
      id={`internship-tabpanel-${index}`}
      aria-labelledby={`internship-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InternshipManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    companyId: '',
    companySupervisorId: '',
    universitySupervisorId: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const queryClient = useQueryClient();

  // Fetch data
  const { data: internships, isLoading: internshipsLoading } = useQuery(
    'admin-internships',
    () => apiService.getAdminInternships(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const { data: students } = useQuery(
    'students',
    apiService.getStudents
  );

  const { data: companies } = useQuery(
    'companies',
    () => apiService.getCompanies()
  );

  const { data: companySupervisors } = useQuery(
    'company-supervisors',
    () => apiService.getCompanySupervisors()
  );

  const { data: universitySupervisors } = useQuery(
    'university-supervisors',
    () => apiService.getUniversitySupervisors()
  );

  // Mutations
  const createInternshipMutation = useMutation(
    (data: any) => apiService.createAdminInternship(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-internships');
        setCreateDialogOpen(false);
        setFormData({
          studentId: '',
          companyId: '',
          companySupervisorId: '',
          universitySupervisorId: '',
          startDate: null,
          endDate: null
        });
      }
    }
  );

  const updateInternshipStatusMutation = useMutation(
    ({ id, status }: { id: number; status: string }) => 
      apiService.updateAdminInternshipStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-internships');
      }
    }
  );

  const deleteInternshipMutation = useMutation(
    (id: number) => apiService.deleteAdminInternship(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-internships');
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateInternship = () => {
    if (!formData.studentId || !formData.companyId) return;
    
    createInternshipMutation.mutate({
      studentId: parseInt(formData.studentId),
      companyId: parseInt(formData.companyId),
      companySupervisorId: formData.companySupervisorId ? parseInt(formData.companySupervisorId) : undefined,
      universitySupervisorId: formData.universitySupervisorId ? parseInt(formData.universitySupervisorId) : undefined,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString()
    });
  };

  const handleViewInternship = (internship: any) => {
    setSelectedInternship(internship);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateInternshipStatusMutation.mutate({ id, status });
  };

  const handleDeleteInternship = (id: number) => {
    if (window.confirm('Are you sure you want to delete this internship?')) {
      deleteInternshipMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'primary';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <TrendingUp />;
      case 'Completed': return <CheckCircle />;
      case 'Pending': return <Pending />;
      case 'Rejected': return <Cancel />;
      default: return <Work />;
    }
  };

  // Filter internships by status
  const activeInternships = internships?.filter((i: any) => i.status === 'Active') || [];
  const pendingInternships = internships?.filter((i: any) => i.status === 'Pending') || [];
  const completedInternships = internships?.filter((i: any) => i.status === 'Completed') || [];
  const rejectedInternships = internships?.filter((i: any) => i.status === 'Rejected') || [];

  if (internshipsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Internship Management
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div" color="success.main">
                      {activeInternships.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Internships
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'success.main' }}>
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
                      {pendingInternships.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Internships
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'warning.main' }}>
                    <Pending />
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
                    <Typography variant="h4" component="div" color="primary.main">
                      {completedInternships.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Internships
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'primary.main' }}>
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
                    <Typography variant="h4" component="div" color="error.main">
                      {rejectedInternships.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected Internships
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'error.main' }}>
                    <Cancel />
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
            Create Internship
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => queryClient.invalidateQueries('admin-internships')}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="internship tabs">
            <Tab label="All Internships" />
            <Tab label="Active" />
            <Tab label="Pending" />
            <Tab label="Completed" />
            <Tab label="Rejected" />
          </Tabs>

          {/* All Internships Tab */}
          <TabPanel value={tabValue} index={0}>
            <InternshipTable 
              internships={internships || []}
              onView={handleViewInternship}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteInternship}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              updateMutation={updateInternshipStatusMutation}
              deleteMutation={deleteInternshipMutation}
            />
          </TabPanel>

          {/* Active Internships Tab */}
          <TabPanel value={tabValue} index={1}>
            <InternshipTable 
              internships={activeInternships}
              onView={handleViewInternship}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteInternship}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              updateMutation={updateInternshipStatusMutation}
              deleteMutation={deleteInternshipMutation}
            />
          </TabPanel>

          {/* Pending Internships Tab */}
          <TabPanel value={tabValue} index={2}>
            <InternshipTable 
              internships={pendingInternships}
              onView={handleViewInternship}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteInternship}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              updateMutation={updateInternshipStatusMutation}
              deleteMutation={deleteInternshipMutation}
            />
          </TabPanel>

          {/* Completed Internships Tab */}
          <TabPanel value={tabValue} index={3}>
            <InternshipTable 
              internships={completedInternships}
              onView={handleViewInternship}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteInternship}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              updateMutation={updateInternshipStatusMutation}
              deleteMutation={deleteInternshipMutation}
            />
          </TabPanel>

          {/* Rejected Internships Tab */}
          <TabPanel value={tabValue} index={4}>
            <InternshipTable 
              internships={rejectedInternships}
              onView={handleViewInternship}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteInternship}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              updateMutation={updateInternshipStatusMutation}
              deleteMutation={deleteInternshipMutation}
            />
          </TabPanel>
        </Paper>

        {/* Create Internship Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Internship</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Student</InputLabel>
                    <Select
                      value={formData.studentId}
                      label="Student"
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    >
                      {students?.map((student: any) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.user?.fullName} - {student.registrationNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Company</InputLabel>
                    <Select
                      value={formData.companyId}
                      label="Company"
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    >
                      {companies?.map((company: any) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Company Supervisor</InputLabel>
                    <Select
                      value={formData.companySupervisorId}
                      label="Company Supervisor"
                      onChange={(e) => setFormData({ ...formData, companySupervisorId: e.target.value })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {companySupervisors?.map((supervisor: any) => (
                        <MenuItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name} - {supervisor.company}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>University Supervisor</InputLabel>
                    <Select
                      value={formData.universitySupervisorId}
                      label="University Supervisor"
                      onChange={(e) => setFormData({ ...formData, universitySupervisorId: e.target.value })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {universitySupervisors?.map((supervisor: any) => (
                        <MenuItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => setFormData({ ...formData, startDate: date })}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => setFormData({ ...formData, endDate: date })}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </Grid>
              </Grid>
              {createInternshipMutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to create internship. Please try again.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateInternship}
              variant="contained"
              disabled={
                !formData.studentId || 
                !formData.companyId ||
                createInternshipMutation.isLoading
              }
              startIcon={createInternshipMutation.isLoading ? <CircularProgress size={16} /> : <Add />}
            >
              {createInternshipMutation.isLoading ? 'Creating...' : 'Create Internship'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Internship Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Internship Details</DialogTitle>
          <DialogContent>
            {selectedInternship && (
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                    <Typography variant="body1">
                      {selectedInternship.student?.user?.fullName} - {selectedInternship.student?.registrationNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                    <Typography variant="body1">{selectedInternship.company?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedInternship.status} 
                      color={getStatusColor(selectedInternship.status) as any}
                                              icon={getStatusIcon(selectedInternship.status) as any}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                    <Typography variant="body1">
                      {selectedInternship.startDate && selectedInternship.endDate 
                        ? `${new Date(selectedInternship.startDate).toLocaleDateString()} - ${new Date(selectedInternship.endDate).toLocaleDateString()}`
                        : 'Not specified'
                      }
                    </Typography>
                  </Grid>
                  {selectedInternship.companySupervisor && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Company Supervisor</Typography>
                      <Typography variant="body1">{selectedInternship.companySupervisor.name}</Typography>
                    </Grid>
                  )}
                  {selectedInternship.universitySupervisor && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">University Supervisor</Typography>
                      <Typography variant="body1">{selectedInternship.universitySupervisor.name}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

// Internship Table Component
interface InternshipTableProps {
  internships: any[];
  onView: (internship: any) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  getStatusColor: (status: string) => any;
  getStatusIcon: (status: string) => React.ReactNode;
  updateMutation: any;
  deleteMutation: any;
}

const InternshipTable: React.FC<InternshipTableProps> = ({
  internships,
  onView,
  onUpdateStatus,
  onDelete,
  getStatusColor,
  getStatusIcon,
  updateMutation,
  deleteMutation
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Supervisors</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {internships.length > 0 ? internships.map((internship: any) => (
            <TableRow key={internship.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School />
                  {internship.student?.user?.fullName}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  {internship.company?.name}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={internship.status}
                  color={getStatusColor(internship.status) as any}
                  icon={getStatusIcon(internship.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday />
                  {internship.startDate && internship.endDate 
                    ? `${new Date(internship.startDate).toLocaleDateString()} - ${new Date(internship.endDate).toLocaleDateString()}`
                    : 'Not specified'
                  }
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {internship.companySupervisor && (
                    <Typography variant="caption" color="text.secondary">
                      Company: {internship.companySupervisor.name}
                    </Typography>
                  )}
                  {internship.universitySupervisor && (
                    <Typography variant="caption" color="text.secondary">
                      University: {internship.universitySupervisor.name}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onView(internship)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  {internship.status === 'Pending' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => onUpdateStatus(internship.id, 'Active')}
                        disabled={updateMutation.isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => onUpdateStatus(internship.id, 'Rejected')}
                        disabled={updateMutation.isLoading}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {internship.status === 'Active' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<CheckCircle />}
                      onClick={() => onUpdateStatus(internship.id, 'Completed')}
                      disabled={updateMutation.isLoading}
                    >
                      Complete
                    </Button>
                  )}
                  <Tooltip title="Delete Internship">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(internship.id)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  No internships found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InternshipManagement;
