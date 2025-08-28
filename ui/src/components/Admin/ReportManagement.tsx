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
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Description,
  School,
  Business,
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Refresh,
  ExpandMore,
  Assessment,
  TrendingUp,
  TrendingDown,
  Schedule,
  Done,
  Pending
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'Approved',
    supervisorComments: ''
  });
  const queryClient = useQueryClient();

  // Fetch data
  const { data: weeklyReports, isLoading: weeklyReportsLoading } = useQuery(
    'admin-weekly-reports',
    apiService.getAdminWeeklyReports
  );

  const { data: finalReports, isLoading: finalReportsLoading } = useQuery(
    'admin-final-reports',
    apiService.getAdminFinalReports
  );

  const { data: internships } = useQuery(
    'admin-internships',
    apiService.getInternships
  );

  // Mutations
  const reviewWeeklyReportMutation = useMutation(
    ({ reportId, review }: { reportId: number; review: any }) => 
      apiService.reviewWeeklyReportAdmin(reportId, review),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-weekly-reports');
        setReviewDialogOpen(false);
        setReviewData({ status: 'Approved', supervisorComments: '' });
      }
    }
  );

  const reviewFinalReportMutation = useMutation(
    ({ reportId, review }: { reportId: number; review: any }) => 
      apiService.reviewFinalReportAdmin(reportId, review),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-final-reports');
        setReviewDialogOpen(false);
        setReviewData({ status: 'Approved', supervisorComments: '' });
      }
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleReviewReport = (report: any) => {
    setSelectedReport(report);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedReport) return;

    const review = {
      status: reviewData.status,
      supervisorComments: reviewData.supervisorComments
    };

    if (selectedReport.weekNumber) {
      // Weekly report
      reviewWeeklyReportMutation.mutate({ reportId: selectedReport.id, review });
    } else {
      // Final report
      reviewFinalReportMutation.mutate({ reportId: selectedReport.id, review });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Reviewed': return 'warning';
      case 'Submitted': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle />;
      case 'Rejected': return <Cancel />;
      case 'Reviewed': return <Assessment />;
      case 'Submitted': return <Pending />;
      default: return <Description />;
    }
  };

  // Filter reports by status
  const submittedWeeklyReports = weeklyReports?.filter((r: any) => r.status === 'Submitted') || [];
  const reviewedWeeklyReports = weeklyReports?.filter((r: any) => r.status === 'Reviewed') || [];
  const approvedWeeklyReports = weeklyReports?.filter((r: any) => r.status === 'Approved') || [];
  const rejectedWeeklyReports = weeklyReports?.filter((r: any) => r.status === 'Rejected') || [];

  const submittedFinalReports = finalReports?.filter((r: any) => r.status === 'Submitted') || [];
  const reviewedFinalReports = finalReports?.filter((r: any) => r.status === 'Reviewed') || [];
  const approvedFinalReports = finalReports?.filter((r: any) => r.status === 'Approved') || [];
  const rejectedFinalReports = finalReports?.filter((r: any) => r.status === 'Rejected') || [];

  const isLoading = weeklyReportsLoading || finalReportsLoading;

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
        Report Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {weeklyReports?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Weekly Reports
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <Description />
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
                    {finalReports?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Final Reports
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main' }}>
                  <Assessment />
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
                    {submittedWeeklyReports.length + submittedFinalReports.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reviews
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
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
                  <Typography variant="h4" component="div" color="info.main">
                    {approvedWeeklyReports.length + approvedFinalReports.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Reports
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <Done />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            queryClient.invalidateQueries('admin-weekly-reports');
            queryClient.invalidateQueries('admin-final-reports');
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Weekly Reports" />
          <Tab label="Final Reports" />
        </Tabs>

        {/* Weekly Reports Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Reports Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Submitted: ${submittedWeeklyReports.length}`} 
                  color="info" 
                  variant="outlined" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Reviewed: ${reviewedWeeklyReports.length}`} 
                  color="warning" 
                  variant="outlined" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Approved: ${approvedWeeklyReports.length}`} 
                  color="success" 
                  variant="outlined" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Rejected: ${rejectedWeeklyReports.length}`} 
                  color="error" 
                  variant="outlined" 
                />
              </Grid>
            </Grid>
          </Box>
          <WeeklyReportsTable 
            reports={weeklyReports || []}
            onView={handleViewReport}
            onReview={handleReviewReport}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>

        {/* Final Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Final Reports Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Submitted: ${submittedFinalReports.length}`} 
                  color="info" 
                  variant="outlined" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Reviewed: ${reviewedFinalReports.length}`} 
                  color="warning" 
                  variant="outlined" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Approved: ${approvedFinalReports.length}`} 
                  color="success" 
                  variant="outlined" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Chip 
                  label={`Rejected: ${rejectedFinalReports.length}`} 
                  color="error" 
                  variant="outlined" 
                />
              </Grid>
            </Grid>
          </Box>
          <FinalReportsTable 
            reports={finalReports || []}
            onView={handleViewReport}
            onReview={handleReviewReport}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </TabPanel>
      </Paper>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReport?.weekNumber ? 'Weekly Report Details' : 'Final Report Details'}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                  <Typography variant="body1">
                    {selectedReport.internship?.student?.user?.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                  <Typography variant="body1">
                    {selectedReport.internship?.company?.name}
                  </Typography>
                </Grid>
                {selectedReport.weekNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Week Number</Typography>
                    <Typography variant="body1">Week {selectedReport.weekNumber}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedReport.status} 
                    color={getStatusColor(selectedReport.status)}
                    icon={getStatusIcon(selectedReport.status)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Content</Typography>
                  <Paper sx={{ p: 2, mt: 1, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body2" whiteSpace="pre-wrap">
                      {selectedReport.content}
                    </Typography>
                  </Paper>
                </Grid>
                {selectedReport.supervisorComments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Supervisor Comments</Typography>
                    <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" whiteSpace="pre-wrap">
                        {selectedReport.supervisorComments}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedReport && selectedReport.status === 'Submitted' && (
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleReviewReport(selectedReport);
              }}
            >
              Review Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Report Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Review {selectedReport?.weekNumber ? 'Weekly Report' : 'Final Report'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Review Status</InputLabel>
              <Select
                value={reviewData.status}
                label="Review Status"
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
              >
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Reviewed">Reviewed (Needs Revision)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Supervisor Comments"
              value={reviewData.supervisorComments}
              onChange={(e) => setReviewData({ ...reviewData, supervisorComments: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder="Provide feedback and comments for the student..."
            />
            {(reviewWeeklyReportMutation.isError || reviewFinalReportMutation.isError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to submit review. Please try again.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={
              reviewWeeklyReportMutation.isLoading || 
              reviewFinalReportMutation.isLoading
            }
            startIcon={
              (reviewWeeklyReportMutation.isLoading || reviewFinalReportMutation.isLoading) 
                ? <CircularProgress size={16} /> 
                : <Assessment />
            }
          >
            {(reviewWeeklyReportMutation.isLoading || reviewFinalReportMutation.isLoading) 
              ? 'Submitting...' 
              : 'Submit Review'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Weekly Reports Table Component
interface WeeklyReportsTableProps {
  reports: any[];
  onView: (report: any) => void;
  onReview: (report: any) => void;
  getStatusColor: (status: string) => any;
  getStatusIcon: (status: string) => React.ReactNode;
}

const WeeklyReportsTable: React.FC<WeeklyReportsTableProps> = ({
  reports,
  onView,
  onReview,
  getStatusColor,
  getStatusIcon
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Week</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Submitted Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.length > 0 ? reports.map((report: any) => (
            <TableRow key={report.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School />
                  {report.internship?.student?.user?.fullName}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  {report.internship?.company?.name}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  Week {report.weekNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={report.status}
                  color={getStatusColor(report.status) as any}
                  icon={getStatusIcon(report.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {report.createdAt 
                  ? new Date(report.createdAt).toLocaleDateString()
                  : 'Not specified'
                }
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Report">
                    <IconButton
                      size="small"
                      onClick={() => onView(report)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  {report.status === 'Submitted' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Assessment />}
                      onClick={() => onReview(report)}
                    >
                      Review
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  No weekly reports found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Final Reports Table Component
interface FinalReportsTableProps {
  reports: any[];
  onView: (report: any) => void;
  onReview: (report: any) => void;
  getStatusColor: (status: string) => any;
  getStatusIcon: (status: string) => React.ReactNode;
}

const FinalReportsTable: React.FC<FinalReportsTableProps> = ({
  reports,
  onView,
  onReview,
  getStatusColor,
  getStatusIcon
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Submitted Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.length > 0 ? reports.map((report: any) => (
            <TableRow key={report.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School />
                  {report.internship?.student?.user?.fullName}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  {report.internship?.company?.name}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={report.status}
                  color={getStatusColor(report.status) as any}
                  icon={getStatusIcon(report.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {report.createdAt 
                  ? new Date(report.createdAt).toLocaleDateString()
                  : 'Not specified'
                }
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Report">
                    <IconButton
                      size="small"
                      onClick={() => onView(report)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  {report.status === 'Submitted' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Assessment />}
                      onClick={() => onReview(report)}
                    >
                      Review
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  No final reports found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportManagement;
