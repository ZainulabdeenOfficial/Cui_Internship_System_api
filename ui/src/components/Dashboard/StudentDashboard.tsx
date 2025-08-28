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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Download,
  Add,
  Visibility,
  TrendingUp
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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportType, setReportType] = useState<'weekly' | 'final'>('weekly');
  const [reportData, setReportData] = useState({ weekNumber: 1, content: '' });
  const queryClient = useQueryClient();

  // Fetch data
  const { data: internships, isLoading: internshipsLoading } = useQuery('student-internships', apiService.getMyInternships);
  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    ['student-attendance', user?.id],
    () => {
      if (!internships || internships.length === 0) return [];
      return apiService.getStudentAttendance(internships[0].id);
    },
    { enabled: !!internships && internships.length > 0 }
  );
  const { data: certificate, isLoading: certificateLoading } = useQuery(
    ['student-certificate', user?.id],
    () => {
      if (!internships || internships.length === 0) return null;
      return apiService.getStudentCertificate(internships[0].id);
    },
    { enabled: !!internships && internships.length > 0 }
  );

  // Mutations
  const submitWeeklyReportMutation = useMutation(
    (data: { weekNumber: number; content: string }) => apiService.submitWeeklyReport(data),
    { onSuccess: () => queryClient.invalidateQueries('student-internships') }
  );

  const submitFinalReportMutation = useMutation(
    (data: { content: string }) => apiService.submitFinalReport(data),
    { onSuccess: () => queryClient.invalidateQueries('student-internships') }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmitReport = () => {
    if (reportType === 'weekly') {
      submitWeeklyReportMutation.mutate(reportData);
    } else {
      submitFinalReportMutation.mutate({ content: reportData.content });
    }
    setOpenReportDialog(false);
    setReportData({ weekNumber: 1, content: '' });
  };

  const getInternshipStatus = (internship: any) => {
    switch (internship.status) {
      case 'Pending': return { color: 'warning', text: 'Pending Approval' };
      case 'Active': return { color: 'success', text: 'Active' };
      case 'Completed': return { color: 'info', text: 'Completed' };
      case 'Rejected': return { color: 'error', text: 'Rejected' };
      default: return { color: 'default', text: 'Unknown' };
    }
  };

  const getAttendanceStats = () => {
    if (!attendance) return { total: 0, present: 0, absent: 0, percentage: 0 };
    
    const total = attendance.length;
    const present = attendance.filter((a: any) => a.status !== 'Absent').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, percentage };
  };

  const stats = getAttendanceStats();

  if (internshipsLoading || attendanceLoading || certificateLoading) {
    return <Typography>Loading student dashboard...</Typography>;
  }

  const currentInternship = internships?.[0];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>

      {/* Internship Status */}
      {currentInternship && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">
            Current Internship: {currentInternship.company?.name}
          </Typography>
          <Typography variant="body2">
            Status: {getInternshipStatus(currentInternship).text}
          </Typography>
        </Alert>
      )}

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
                    Total Days
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <Schedule />
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
                    {stats.present}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Days
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
                    {stats.percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
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
                    {currentInternship?.weeklyReports?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Weekly Reports
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

      {/* Progress Stepper */}
      {currentInternship && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Internship Progress
            </Typography>
            <Stepper activeStep={getInternshipStep(currentInternship)} alternativeLabel>
              <Step>
                <StepLabel>Registration</StepLabel>
              </Step>
              <Step>
                <StepLabel>Approval</StepLabel>
              </Step>
              <Step>
                <StepLabel>Active</StepLabel>
              </Step>
              <Step>
                <StepLabel>Reports</StepLabel>
              </Step>
              <Step>
                <StepLabel>Certificate</StepLabel>
              </Step>
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="student tabs">
          <Tab label="Attendance" />
          <Tab label="Reports" />
          <Tab label="Certificate" />
        </Tabs>

        {/* Attendance Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Attendance Records
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance?.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.checkInTime || 'Not checked in'}</TableCell>
                    <TableCell>{record.checkOutTime || 'Not checked out'}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={record.status === 'Complete' ? 'success' : 
                               record.status === 'Checked In' ? 'warning' : 'error' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                {(!attendance || attendance.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No attendance records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Reports
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setReportType('weekly');
                  setOpenReportDialog(true);
                }}
              >
                Submit Weekly Report
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setReportType('final');
                  setOpenReportDialog(true);
                }}
              >
                Submit Final Report
              </Button>
            </Box>
          </Box>

          {/* Weekly Reports */}
          <Typography variant="h6" gutterBottom>
            Weekly Reports
          </Typography>
          <TableContainer sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted On</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentInternship?.weeklyReports?.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>Week {report.weekNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={report.status === 'Approved' ? 'success' : 
                               report.status === 'Rejected' ? 'error' : 'warning' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{report.supervisorComments || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="View Report">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Final Report */}
          <Typography variant="h6" gutterBottom>
            Final Report
          </Typography>
          {currentInternship?.finalReport ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted On</TableCell>
                    <TableCell>Comments</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Chip
                        label={currentInternship.finalReport.status}
                        color={currentInternship.finalReport.status === 'Approved' ? 'success' : 
                               currentInternship.finalReport.status === 'Rejected' ? 'error' : 'warning' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{currentInternship.finalReport.createdAt && currentInternship.finalReport.createdAt !== '' ? new Date(currentInternship.finalReport.createdAt).toLocaleDateString() : 'Not specified'}</TableCell>
                    <TableCell>{currentInternship.finalReport.supervisorComments || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="View Report">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No final report submitted yet.
            </Alert>
          )}
        </TabPanel>

        {/* Certificate Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Internship Certificate
          </Typography>
          {certificate ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">
                      Certificate #{certificate.certificateNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issued on: {new Date(certificate.issuedOn).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => {
                      // Handle certificate download
                      console.log('Download certificate');
                    }}
                  >
                    Download Certificate
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              Certificate will be available after internship completion and approval.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Submit Report Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Submit {reportType === 'weekly' ? 'Weekly' : 'Final'} Report
        </DialogTitle>
        <DialogContent>
          {reportType === 'weekly' && (
            <TextField
              fullWidth
              label="Week Number"
              type="number"
              value={reportData.weekNumber}
              onChange={(e) => setReportData({ ...reportData, weekNumber: parseInt(e.target.value) })}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Report Content"
            multiline
            rows={8}
            value={reportData.content}
            onChange={(e) => setReportData({ ...reportData, content: e.target.value })}
            margin="normal"
            placeholder="Describe your activities, achievements, and learnings for this period..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitReport} 
            variant="contained"
            disabled={submitWeeklyReportMutation.isLoading || submitFinalReportMutation.isLoading}
          >
            {submitWeeklyReportMutation.isLoading || submitFinalReportMutation.isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function to determine internship step
const getInternshipStep = (internship: any) => {
  if (!internship) return 0;
  
  switch (internship.status) {
    case 'Pending': return 1;
    case 'Active': return 2;
    case 'Completed': return 4;
    default: return 0;
  }
};

export default StudentDashboard;
