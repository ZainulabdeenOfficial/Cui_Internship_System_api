import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  Download,
  Visibility,
  CardGiftcard,
  CheckCircle,
  Pending,
  School,
  Work
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Certificate, Internship } from '../../types';

const CertificateList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Get user's internships
  const { data: internships } = useQuery('internships', apiService.getInternships);
  
  // Get certificates for the user's internships
  const { data: certificates, isLoading } = useQuery(
    ['certificates', user?.id],
    async () => {
      if (!internships) return [];
      
      const userInternships = user?.role === 'Student' 
        ? internships.filter(i => i.student?.user?.id === user.id)
        : user?.role === 'UniversitySupervisor'
        ? internships.filter(i => i.universitySupervisorId)
        : internships;
      
      const allCertificates: Certificate[] = [];
      for (const internship of userInternships) {
        try {
          const certificate = await apiService.getCertificate(internship.id);
          if (certificate) {
            allCertificates.push(certificate);
          }
        } catch (error) {
          console.log(`No certificate for internship ${internship.id}`);
        }
      }
      return allCertificates;
    },
    { enabled: !!internships && !!user }
  );

  const generateCertificateMutation = useMutation(
    (internshipId: number) => apiService.generateCertificate(internshipId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['certificates', user?.id]);
        setOpenDialog(false);
      }
    }
  );

  const handleGenerateCertificate = (internshipId: number) => {
    generateCertificateMutation.mutate(internshipId);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setOpenDialog(true);
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // In a real app, this would download the actual certificate file
    const link = document.createElement('a');
    const issueDate = certificate.issueDate && certificate.issueDate !== '' ? new Date(certificate.issueDate).toLocaleDateString() : 'Not specified';
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
      `Certificate of Completion\n\nThis is to certify that ${certificate.studentName || 'Student'} has successfully completed their internship at ${certificate.companyName || 'Company'}.\n\nCertificate ID: ${certificate.id}\nIssue Date: ${issueDate}`
    )}`;
    link.download = `certificate-${certificate.id}.txt`;
    link.click();
  };

  const getCertificateStats = () => {
    if (!certificates) return { total: 0, issued: 0, pending: 0 };
    
    const total = certificates.length;
    const issued = certificates.filter(c => c.isIssued).length;
    const pending = total - issued;
    
    return { total, issued, pending };
  };

  const getCompletedInternships = () => {
    if (!internships) return [];
    
    const userInternships = user?.role === 'Student' 
      ? internships.filter(i => i.student?.user?.id === user.id)
      : user?.role === 'UniversitySupervisor'
      ? internships.filter(i => i.universitySupervisorId)
      : internships;
    
    return userInternships.filter(i => i.status === 'Completed');
  };

  const stats = getCertificateStats();
  const completedInternships = getCompletedInternships();

  if (isLoading) {
    return <Typography>Loading certificates...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Certificates
        </Typography>
        {(user?.role === 'Admin' || user?.role === 'UniversitySupervisor') && (
          <Button
            variant="contained"
            startIcon={<CardGiftcard />}
            onClick={() => setOpenDialog(true)}
          >
            Generate Certificate
          </Button>
        )}
      </Box>

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
                    Total Certificates
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
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.issued}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issued Certificates
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
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Certificates
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
                  <Typography variant="h4" component="div" color="info.main">
                    {completedInternships.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Internships
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main' }}>
                  <Work />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificates Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Certificate ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates?.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School />
                    {certificate.studentName}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work />
                    {certificate.companyName}
                  </Box>
                </TableCell>
                <TableCell>
                  {certificate.issueDate && certificate.issueDate !== '' ? new Date(certificate.issueDate).toLocaleDateString() : 'Not issued'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={certificate.isIssued ? 'Issued' : 'Pending'}
                    color={certificate.isIssued ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {certificate.id}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewCertificate(certificate)}
                    >
                      <Visibility />
                    </IconButton>
                    {certificate.isIssued && (
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadCertificate(certificate)}
                      >
                        <Download />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!certificates || certificates.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No certificates found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Certificate Dialog */}
      <Dialog open={openDialog && !selectedCertificate} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Certificate</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a completed internship to generate a certificate:
          </Typography>
          
          {completedInternships.length === 0 ? (
            <Alert severity="info">
              No completed internships found. Certificates can only be generated for completed internships.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Completion Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedInternships.map((internship) => (
                    <TableRow key={internship.id}>
                      <TableCell>{internship.student?.user?.fullName}</TableCell>
                      <TableCell>{internship.company?.name}</TableCell>
                      <TableCell>
                        {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleGenerateCertificate(internship.id)}
                          disabled={generateCertificateMutation.isLoading}
                        >
                          Generate Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* View Certificate Dialog */}
      <Dialog open={openDialog && !!selectedCertificate} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Certificate Details</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box sx={{ p: 2, border: '2px solid #1976d2', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
                Certificate of Completion
              </Typography>
              <Typography variant="h6" gutterBottom>
                This is to certify that
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {selectedCertificate.studentName}
              </Typography>
              <Typography variant="h6" gutterBottom>
                has successfully completed their internship at
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {selectedCertificate.companyName}
              </Typography>
              <Typography variant="body1" sx={{ mt: 3 }}>
                Certificate ID: {selectedCertificate.id}
              </Typography>
              <Typography variant="body1">
                Issue Date: {selectedCertificate.issueDate && selectedCertificate.issueDate !== '' ? new Date(selectedCertificate.issueDate).toLocaleDateString() : 'Pending'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Status: {selectedCertificate.isIssued ? 'Issued' : 'Pending'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedCertificate?.isIssued && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => selectedCertificate && handleDownloadCertificate(selectedCertificate)}
            >
              Download Certificate
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificateList;
