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
  CircularProgress
} from '@mui/material';
import {
  CardGiftcard,
  Download,
  Visibility,
  Add,
  Refresh,
  School,
  Business,
  CalendarToday
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiService from '../../services/api';

interface CertificateData {
  id: number;
  internshipId: number;
  certificateNumber: string;
  issuedOn: string;
  studentName?: string;
  companyName?: string;
  status: string;
}

const CertificateManagement: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const queryClient = useQueryClient();

  // Fetch all internships with certificate data
  const { data: internships, isLoading: internshipsLoading } = useQuery(
    'admin-internships',
    () => apiService.getAdminInternships(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Fetch dashboard stats for certificate overview
  const { data: stats } = useQuery(
    'admin-stats',
    () => apiService.getAdminDashboardStats(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Generate certificate mutation
  const generateCertificateMutation = useMutation(
    (studentId: number) => apiService.generateAdminCertificate(studentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-internships');
        queryClient.invalidateQueries('admin-stats');
        setGenerateDialogOpen(false);
        setStudentId('');
        setCertificateNumber('');
      }
    }
  );

  // Filter completed internships that need certificates
  const completedInternships = internships?.filter((internship: any) => 
    internship.status === 'Completed' && !internship.certificate
  ) || [];

  // Internships with existing certificates
  const certifiedInternships = internships?.filter((internship: any) => 
    internship.certificate
  ) || [];

  const handleGenerateCertificate = () => {
    if (!studentId) return;
    generateCertificateMutation.mutate(parseInt(studentId));
  };

  const handleViewCertificate = (internship: any) => {
    setSelectedCertificate({
      id: internship.certificate.id,
      internshipId: internship.id,
      certificateNumber: internship.certificate.certificateNumber,
      issuedOn: internship.certificate.issuedOn,
      studentName: internship.student?.user?.fullName,
      companyName: internship.company?.name,
      status: 'Issued'
    });
  };

  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      await apiService.downloadAdminCertificate(certificateId);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (internshipsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificate Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {certifiedInternships.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Certificates Issued
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <CardGiftcard />
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
                    {completedInternships.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Certificates
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
                  <Add />
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
                    {stats?.activeInternships || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Internships
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
                  <Typography variant="h4" component="div" color="info.main">
                    {stats?.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <School />
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
          onClick={() => setGenerateDialogOpen(true)}
          disabled={completedInternships.length === 0}
        >
          Generate Certificate
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => queryClient.invalidateQueries('admin-internships')}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Pending Certificates */}
      {completedInternships.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" color="warning.main">
              Pending Certificates ({completedInternships.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Internship Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedInternships.map((internship: any) => (
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday />
                        {internship.startDate && internship.endDate 
                          ? `${new Date(internship.startDate).toLocaleDateString()} - ${new Date(internship.endDate).toLocaleDateString()}`
                          : 'Not specified'
                        }
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Completed - Certificate Pending"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CardGiftcard />}
                        onClick={() => {
                          setStudentId(internship.student?.id?.toString() || '');
                          setGenerateDialogOpen(true);
                        }}
                        disabled={generateCertificateMutation.isLoading}
                      >
                        Generate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Issued Certificates */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" color="success.main">
            Issued Certificates ({certifiedInternships.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certificate #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certifiedInternships.length > 0 ? certifiedInternships.map((internship: any) => (
                <TableRow key={internship.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {internship.certificate.certificateNumber}
                    </Typography>
                  </TableCell>
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
                    {internship.certificate.issuedOn 
                      ? new Date(internship.certificate.issuedOn).toLocaleDateString()
                      : 'Not specified'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Issued"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Certificate">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCertificate(internship)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Certificate">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadCertificate(internship.certificate.id)}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No certificates have been issued yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Generate Certificate Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              margin="normal"
              type="number"
              helperText="Enter the student ID to generate certificate"
            />
            <TextField
              fullWidth
              label="Certificate Number (Optional)"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              margin="normal"
              helperText="Leave empty for auto-generation"
            />
            {generateCertificateMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to generate certificate. Please try again.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateCertificate}
            variant="contained"
            disabled={!studentId || generateCertificateMutation.isLoading}
            startIcon={generateCertificateMutation.isLoading ? <CircularProgress size={16} /> : <CardGiftcard />}
          >
            {generateCertificateMutation.isLoading ? 'Generating...' : 'Generate Certificate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Certificate Dialog */}
      <Dialog open={!!selectedCertificate} onClose={() => setSelectedCertificate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Certificate Details</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Certificate Number</Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedCertificate.certificateNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Issue Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedCertificate.issuedOn).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Student Name</Typography>
                  <Typography variant="body1">{selectedCertificate.studentName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                  <Typography variant="body1">{selectedCertificate.companyName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedCertificate.status} color="success" />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCertificate(null)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => selectedCertificate && handleDownloadCertificate(selectedCertificate.id)}
          >
            Download Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificateManagement;
