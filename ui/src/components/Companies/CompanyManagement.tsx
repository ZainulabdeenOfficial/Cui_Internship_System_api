import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Business,
  People,
  CheckCircle,
  Schedule,
  Assignment,
  Visibility,
  Add,
  TrendingUp,
  LocationOn,
  Phone,
  Email,
  Person
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
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CompanyManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    website: '',
    description: ''
  });
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState({
    date: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'Present',
    notes: ''
  });
  const [validationData, setValidationData] = useState({
    internshipId: 0,
    isValid: true,
    comments: ''
  });
  const [commentData, setCommentData] = useState({
    internshipId: 0,
    comments: '',
    rating: 5
  });

  // Fetch company data
  const { data: companyInfo, isLoading: companyLoading } = useQuery(
    ['company-info', user?.id],
    () => apiService.getCompanyInfo(),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Fetch assigned students
  const { data: assignedStudents, isLoading: studentsLoading } = useQuery(
    ['assigned-students', user?.id],
    apiService.getAssignedStudents,
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Fetch attendance data
  const { data: attendanceRecords } = useQuery(
    ['attendance-records', user?.id],
    () => apiService.getAttendance(),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Mutations
  const updateCompanyMutation = useMutation(
    (data: any) => apiService.updateCompanyProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['company-info', user?.id]);
        setIsEditing(false);
      }
    }
  );

  const markAttendanceMutation = useMutation(
    (data: any) => apiService.markAttendance(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['attendance-records', user?.id]);
        setOpenAttendanceDialog(false);
        setAttendanceData({
          date: '',
          checkInTime: '',
          checkOutTime: '',
          status: 'Present',
          notes: ''
        });
      }
    }
  );

  const validateInternshipMutation = useMutation(
    (data: any) => apiService.validateInternship(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assigned-students', user?.id]);
        setOpenValidationDialog(false);
        setValidationData({
          internshipId: 0,
          isValid: true,
          comments: ''
        });
      }
    }
  );

  const addCommentMutation = useMutation(
    (data: any) => apiService.addPerformanceComments(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assigned-students', user?.id]);
        setOpenCommentDialog(false);
        setCommentData({
          internshipId: 0,
          comments: '',
          rating: 5
        });
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveCompany = () => {
    updateCompanyMutation.mutate(companyData);
  };

  const handleCancelEdit = () => {
    setCompanyData({
      name: companyInfo?.name || '',
      address: companyInfo?.address || '',
      phoneNumber: companyInfo?.phoneNumber || '',
      email: companyInfo?.email || '',
      website: companyInfo?.website || '',
      description: companyInfo?.description || ''
    });
    setIsEditing(false);
  };

  const handleMarkAttendance = (student: any) => {
    setSelectedStudent(student);
    setAttendanceData({
      date: '',
      checkInTime: '',
      checkOutTime: '',
      status: 'Present',
      notes: ''
    });
    setOpenAttendanceDialog(true);
  };

  const handleSubmitAttendance = () => {
    markAttendanceMutation.mutate({
      ...attendanceData,
      internshipId: selectedStudent.internshipId
    });
  };

  const handleValidateInternship = (student: any) => {
    setSelectedStudent(student);
    setValidationData({
      ...validationData,
      internshipId: student.internshipId
    });
    setOpenValidationDialog(true);
  };

  const handleSubmitValidation = () => {
    validateInternshipMutation.mutate(validationData);
  };

  const handleAddComment = (student: any) => {
    setSelectedStudent(student);
    setCommentData({
      ...commentData,
      internshipId: student.internshipId
    });
    setOpenCommentDialog(true);
  };

  const handleSubmitComment = () => {
    addCommentMutation.mutate(commentData);
  };

  const getStats = () => {
    if (!assignedStudents) return { total: 0, active: 0, completed: 0, presentToday: 0 };
    
    const total = assignedStudents.length;
    const active = assignedStudents.filter((s: any) => s.status === 'Active').length;
    const completed = assignedStudents.filter((s: any) => s.status === 'Completed').length;
    const presentToday = attendanceRecords?.filter((a: any) => 
      new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'Present'
    ).length || 0;
    
    return { total, active, completed, presentToday };
  };

  const stats = getStats();

  if (companyLoading || studentsLoading) {
    return <Typography>Loading company management...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Company Management
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
                    Completed
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
                    {stats.presentToday}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Today
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="company tabs">
          <Tab label="Company Profile" />
          <Tab label="Assigned Students" />
          <Tab label="Attendance" />
        </Tabs>

        {/* Company Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Company Information</Typography>
            <IconButton onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Cancel /> : <Edit />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
              <Business />
            </Avatar>
            <Box>
              <Typography variant="h6">{companyInfo?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {companyInfo?.email}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={companyData.phoneNumber}
                onChange={(e) => setCompanyData({ ...companyData, phoneNumber: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={companyData.description}
                onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveCompany}
                disabled={updateCompanyMutation.isLoading}
              >
                {updateCompanyMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Assigned Students Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Assigned Students
          </Typography>

          {assignedStudents && assignedStudents.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Registration Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedStudents.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person />
                          {student.student?.user?.fullName}
                        </Box>
                      </TableCell>
                      <TableCell>{student.student?.registrationNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.status}
                          color={
                            student.status === 'Active' ? 'success' :
                            student.status === 'Completed' ? 'info' :
                            student.status === 'Pending' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {student.endDate ? new Date(student.endDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Mark Attendance">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAttendance(student)}
                              disabled={student.status !== 'Active'}
                            >
                              <Schedule />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Validate Internship">
                            <IconButton
                              size="small"
                              onClick={() => handleValidateInternship(student)}
                              disabled={student.status !== 'Active'}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add Comments">
                            <IconButton
                              size="small"
                              onClick={() => handleAddComment(student)}
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No assigned students found.
            </Alert>
          )}
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Attendance Records
          </Typography>

          {attendanceRecords && attendanceRecords.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.checkInTime || 'Not checked in'}</TableCell>
                      <TableCell>{record.checkOutTime || 'Not checked out'}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'Present' ? 'success' :
                            record.status === 'Absent' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No attendance records found.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Attendance Dialog */}
      <Dialog open={openAttendanceDialog} onClose={() => setOpenAttendanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Student: {selectedStudent?.student?.user?.fullName}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={attendanceData.date}
                onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Check In Time"
                type="time"
                value={attendanceData.checkInTime}
                onChange={(e) => setAttendanceData({ ...attendanceData, checkInTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Check Out Time"
                type="time"
                value={attendanceData.checkOutTime}
                onChange={(e) => setAttendanceData({ ...attendanceData, checkOutTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={attendanceData.status}
                  onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={attendanceData.notes}
                onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendanceDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitAttendance}
            variant="contained"
            disabled={markAttendanceMutation.isLoading}
          >
            {markAttendanceMutation.isLoading ? 'Saving...' : 'Save Attendance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={openValidationDialog} onClose={() => setOpenValidationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Validate Internship</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Student: {selectedStudent?.student?.user?.fullName}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Validation Status</InputLabel>
                <Select
                  value={validationData.isValid ? 'true' : 'false'}
                  onChange={(e) => setValidationData({ ...validationData, isValid: e.target.value === 'true' })}
                  label="Validation Status"
                >
                  <MenuItem value={'true'}>Valid</MenuItem>
                  <MenuItem value={'false'}>Invalid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                value={validationData.comments}
                onChange={(e) => setValidationData({ ...validationData, comments: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenValidationDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitValidation}
            variant="contained"
            disabled={validateInternshipMutation.isLoading}
          >
            {validateInternshipMutation.isLoading ? 'Saving...' : 'Submit Validation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={openCommentDialog} onClose={() => setOpenCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Performance Comments</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Student: {selectedStudent?.student?.user?.fullName}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={commentData.rating}
                  onChange={(e) => setCommentData({ ...commentData, rating: Number(e.target.value) })}
                  label="Rating"
                >
                  <MenuItem value={1}>1 - Poor</MenuItem>
                  <MenuItem value={2}>2 - Below Average</MenuItem>
                  <MenuItem value={3}>3 - Average</MenuItem>
                  <MenuItem value={4}>4 - Good</MenuItem>
                  <MenuItem value={5}>5 - Excellent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                value={commentData.comments}
                onChange={(e) => setCommentData({ ...commentData, comments: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitComment}
            variant="contained"
            disabled={addCommentMutation.isLoading}
          >
            {addCommentMutation.isLoading ? 'Saving...' : 'Submit Comments'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyManagement;
