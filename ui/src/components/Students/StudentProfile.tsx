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
  Tooltip
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  School,
  Business,
  CalendarToday,
  Email,
  Phone,
  Person,
  Visibility,
  Download
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: '',
    registrationNumber: '',
    department: '',
    semester: ''
  });
  const [openCertificateDialog, setOpenCertificateDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  // Fetch student data
  const { data: studentData, isLoading } = useQuery(
    ['student-profile', user?.id],
    () => apiService.getStudents().then(students => 
      students.find((s: any) => s.userId === user?.id)
    ),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const { data: internships } = useQuery(
    ['student-internships', user?.id],
    () => apiService.getMyInternships(),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const { data: certificates } = useQuery(
    ['student-certificates', user?.id],
    async () => {
      if (!internships || internships.length === 0) return [];
      const certPromises = internships.map((internship: any) => 
        apiService.getStudentCertificate(internship.id).catch(() => null)
      );
      const certs = await Promise.all(certPromises);
      return certs.filter(cert => cert !== null);
    },
    { enabled: !!internships && internships.length > 0 }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data: any) => apiService.updateStudentProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student-profile', user?.id]);
        setIsEditing(false);
      }
    }
  );

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    setProfileData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: '',
      registrationNumber: '',
      department: '',
      semester: ''
    });
    setIsEditing(false);
  };

  const handleViewCertificate = (certificate: any) => {
    setSelectedCertificate(certificate);
    setOpenCertificateDialog(true);
  };

  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      await apiService.downloadCertificate(certificateId);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (isLoading) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Personal Information</Typography>
              <IconButton onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Cancel /> : <Edit />}
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6">{user?.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={profileData.registrationNumber}
                  disabled={true}
                  InputProps={{
                    startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Semester"
                  value={profileData.semester}
                  onChange={(e) => setProfileData({ ...profileData, semester: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
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
          </Paper>
        </Grid>

        {/* Internship History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Internship History
            </Typography>

            {internships && internships.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {internships.map((internship: any) => (
                      <TableRow key={internship.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business />
                            {internship.company?.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={internship.status}
                            color={
                              internship.status === 'Active' ? 'success' :
                              internship.status === 'Completed' ? 'info' :
                              internship.status === 'Pending' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {internship.startDate && internship.endDate ? (
                            `${new Date(internship.startDate).toLocaleDateString()} - ${new Date(internship.endDate).toLocaleDateString()}`
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
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
            ) : (
              <Alert severity="info">
                No internship history found.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Certificates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Certificates
            </Typography>

            {certificates && certificates.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Certificate Number</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Issued Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certificates.map((certificate: any) => (
                      <TableRow key={certificate.id}>
                        <TableCell>{certificate.certificateNumber}</TableCell>
                        <TableCell>{certificate.companyName}</TableCell>
                        <TableCell>
                          {certificate.issuedOn ? new Date(certificate.issuedOn).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={certificate.status}
                            color={certificate.status === 'Issued' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Certificate">
                              <IconButton
                                size="small"
                                onClick={() => handleViewCertificate(certificate)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Certificate">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadCertificate(certificate.id)}
                              >
                                <Download />
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
                No certificates available yet. Certificates will be generated after internship completion.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Certificate View Dialog */}
      <Dialog
        open={openCertificateDialog}
        onClose={() => setOpenCertificateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Certificate Details
        </DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Certificate #{selectedCertificate.certificateNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Student:</strong> {user?.fullName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Company:</strong> {selectedCertificate.companyName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Issued Date:</strong> {selectedCertificate.issuedOn ? new Date(selectedCertificate.issuedOn).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedCertificate.status}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                This certificate confirms the successful completion of the internship program.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCertificateDialog(false)}>Close</Button>
          {selectedCertificate && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleDownloadCertificate(selectedCertificate.id)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfile;
