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
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  School,
  People,
  CheckCircle,
  Schedule,
  Assignment,
  Visibility,
  Add,
  TrendingUp,
  ExpandMore,
  Person,
  Business,
  CalendarToday,
  Star,
  Download,
  ThumbUp,
  ThumbDown
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
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UniversitySupervisorManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reviewData, setReviewData] = useState({
    status: 'Approved',
    comments: '',
    rating: 5
  });
  const [completionData, setCompletionData] = useState({
    internshipId: 0,
    isCompleted: true,
    finalComments: '',
    finalRating: 5
  });

  // Fetch university supervisor data
  const { data: assignedStudents, isLoading: studentsLoading } = useQuery(
    ['university-students', user?.id],
    apiService.getUniversityStudents,
    { enabled: !!user?.id }
  );

  // Fetch weekly reports
  const { data: weeklyReports, isLoading: reportsLoading } = useQuery(
    ['weekly-reports-university', user?.id],
    () => apiService.getWeeklyReports(),
    { enabled: !!user?.id }
  );

  // Fetch final reports
  const { data: finalReports, isLoading: finalReportsLoading } = useQuery(
    ['final-reports-university', user?.id],
    () => apiService.getFinalReports(),
    { enabled: !!user?.id }
  );

  // Mutations
  const reviewWeeklyReportMutation = useMutation(
    (data: { reportId: number; review: any }) => 
      apiService.reviewWeeklyReport(data.reportId, data.review),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['weekly-reports-university', user?.id]);
        setOpenReportDialog(false);
        setReviewData({ status: 'Approved', comments: '', rating: 5 });
      }
    }
  );

  const approveFinalReportMutation = useMutation(
    (data: { reportId: number; review: any }) => 
      apiService.approveFinalReport(data.reportId, data.review),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['final-reports-university', user?.id]);
        setOpenReportDialog(false);
        setReviewData({ status: 'Approved', comments: '', rating: 5 });
      }
    }
  );

  const completeInternshipMutation = useMutation(
    (data: any) => apiService.completeInternship(data.internshipId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['university-students', user?.id]);
        setOpenCompletionDialog(false);
        setCompletionData({
          internshipId: 0,
          isCompleted: true,
          finalComments: '',
          finalRating: 5
        });
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReviewReport = (report: any, type: 'weekly' | 'final') => {
    setSelectedReport({ ...report, type });
    setReviewData({
      status: report.status === 'Submitted' ? 'Approved' : report.status,
      comments: report.supervisorComments || '',
      rating: report.rating || 5
    });
    setOpenReportDialog(true);
  };

  const handleSubmitReview = () => {
    if (selectedReport.type === 'weekly') {
      reviewWeeklyReportMutation.mutate({
        reportId: selectedReport.id,
        review: reviewData
      });
    } else {
      approveFinalReportMutation.mutate({
        reportId: selectedReport.id,
        review: reviewData
      });
    }
  };

  const handleCompleteInternship = (student: any) => {
    setSelectedStudent(student);
    setCompletionData({
      ...completionData,
      internshipId: student.internshipId
    });
    setOpenCompletionDialog(true);
  };

  const handleSubmitCompletion = () => {
    completeInternshipMutation.mutate(completionData);
  };

  const handleViewAttendance = (student: any) => {
    setSelectedStudent(student);
    setOpenAttendanceDialog(true);
  };

  const getStats = () => {
    if (!assignedStudents) return { total: 0, active: 0, completed: 0, pendingReviews: 0 };
    
    const total = assignedStudents.length;
    const active = assignedStudents.filter((s: any) => s.status === 'Active').length;
    const completed = assignedStudents.filter((s: any) => s.status === 'Completed').length;
    const pendingReviews = weeklyReports?.filter((r: any) => r.status === 'Submitted').length || 0;
    
    return { total, active, completed, pendingReviews };
  };

  const stats = getStats();

  if (studentsLoading || reportsLoading || finalReportsLoading) {
    return <Typography>Loading university supervisor management...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        University Supervisor Management
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
                    {stats.pendingReviews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reviews
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="supervisor tabs">
          <Tab label="Assigned Students" />
          <Tab label="Weekly Reports" />
          <Tab label="Final Reports" />
          <Tab label="Attendance Monitoring" />
        </Tabs>

        {/* Assigned Students Tab */}
        <TabPanel value={tabValue} index={0}>
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
                    <TableCell>Company</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business />
                          {student.company?.name}
                        </Box>
                      </TableCell>
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
                        {student.startDate && student.endDate ? (
                          `${new Date(student.startDate).toLocaleDateString()} - ${new Date(student.endDate).toLocaleDateString()}`
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Attendance">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAttendance(student)}
                            >
                              <Schedule />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Complete Internship">
                            <IconButton
                              size="small"
                              onClick={() => handleCompleteInternship(student)}
                              disabled={student.status !== 'Active'}
                            >
                              <CheckCircle />
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

        {/* Weekly Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Weekly Reports
          </Typography>

          {weeklyReports && weeklyReports.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Week</TableCell>
                    <TableCell>Submitted On</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weeklyReports.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.studentName}</TableCell>
                      <TableCell>Week {report.weekNumber}</TableCell>
                      <TableCell>
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={
                            report.status === 'Approved' ? 'success' :
                            report.status === 'Rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Rating value={report.rating || 0} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Report">
                            <IconButton
                              size="small"
                              onClick={() => handleReviewReport(report, 'weekly')}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {report.status === 'Submitted' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setReviewData({ ...reviewData, status: 'Approved' });
                                    handleReviewReport(report, 'weekly');
                                  }}
                                >
                                  <ThumbUp />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setReviewData({ ...reviewData, status: 'Rejected' });
                                    handleReviewReport(report, 'weekly');
                                  }}
                                >
                                  <ThumbDown />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No weekly reports found.
            </Alert>
          )}
        </TabPanel>

        {/* Final Reports Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Final Reports
          </Typography>

          {finalReports && finalReports.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Submitted On</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalReports.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.studentName}</TableCell>
                      <TableCell>
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={
                            report.status === 'Approved' ? 'success' :
                            report.status === 'Rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Rating value={report.rating || 0} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Report">
                            <IconButton
                              size="small"
                              onClick={() => handleReviewReport(report, 'final')}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {report.status === 'Submitted' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setReviewData({ ...reviewData, status: 'Approved' });
                                    handleReviewReport(report, 'final');
                                  }}
                                >
                                  <ThumbUp />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setReviewData({ ...reviewData, status: 'Rejected' });
                                    handleReviewReport(report, 'final');
                                  }}
                                >
                                  <ThumbDown />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No final reports found.
            </Alert>
          )}
        </TabPanel>

        {/* Attendance Monitoring Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Attendance Monitoring
          </Typography>

          {assignedStudents && assignedStudents.length > 0 ? (
            <Box>
              {assignedStudents.map((student: any) => (
                <Accordion key={student.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Person />
                      <Typography variant="subtitle1">
                        {student.student?.user?.fullName}
                      </Typography>
                      <Chip
                        label={student.status}
                        color={
                          student.status === 'Active' ? 'success' :
                          student.status === 'Completed' ? 'info' : 'warning'
                        }
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                        {student.company?.name}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      Click "View Attendance" to see detailed attendance records for this student.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Schedule />}
                      onClick={() => handleViewAttendance(student)}
                      sx={{ mt: 2 }}
                    >
                      View Attendance
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No assigned students found for attendance monitoring.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Report Review Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Review {selectedReport?.type === 'weekly' ? 'Weekly' : 'Final'} Report
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedReport.type === 'weekly' ? `Week ${selectedReport.weekNumber}` : 'Final Report'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Student:</strong> {selectedReport.studentName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Submitted:</strong> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Report Content:</strong>
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="body2">
                  {selectedReport.content}
                </Typography>
              </Paper>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={reviewData.status}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                      <MenuItem value="Needs Revision">Needs Revision</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={reviewData.rating}
                    onChange={(event, newValue) => {
                      setReviewData({ ...reviewData, rating: newValue || 0 });
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comments"
                    multiline
                    rows={4}
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={reviewWeeklyReportMutation.isLoading || approveFinalReportMutation.isLoading}
          >
            {reviewWeeklyReportMutation.isLoading || approveFinalReportMutation.isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={openAttendanceDialog} onClose={() => setOpenAttendanceDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Attendance Records - {selectedStudent?.student?.user?.fullName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Company: {selectedStudent?.company?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Attendance monitoring data will be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendanceDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={openCompletionDialog} onClose={() => setOpenCompletionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Internship</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Student: {selectedStudent?.student?.user?.fullName}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography component="legend">Final Rating</Typography>
              <Rating
                value={completionData.finalRating}
                onChange={(event, newValue) => {
                  setCompletionData({ ...completionData, finalRating: newValue || 0 });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Final Comments"
                multiline
                rows={4}
                value={completionData.finalComments}
                onChange={(e) => setCompletionData({ ...completionData, finalComments: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompletionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitCompletion}
            variant="contained"
            disabled={completeInternshipMutation.isLoading}
          >
            {completeInternshipMutation.isLoading ? 'Completing...' : 'Complete Internship'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UniversitySupervisorManagement;
