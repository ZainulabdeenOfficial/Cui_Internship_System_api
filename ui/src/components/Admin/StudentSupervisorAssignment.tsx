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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  School,
  Person,
  Email,
  Assignment,
  CheckCircle,
  Cancel,
  Refresh,
  SupervisorAccount
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiService from '../../services/api';

const StudentSupervisorAssignment: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<number>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch students with their supervisors
  const { data: studentsWithSupervisors, isLoading: studentsLoading } = useQuery(
    'students-with-supervisors',
    () => apiService.getStudentsWithSupervisors(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Fetch university supervisors
  const { data: universitySupervisors, isLoading: supervisorsLoading } = useQuery(
    'university-supervisors',
    () => apiService.getUniversitySupervisors(),
    { refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Assign supervisor mutation
  const assignSupervisorMutation = useMutation(
    ({ studentId, supervisorId }: { studentId: number; supervisorId: number }) =>
      apiService.assignUniversitySupervisor(studentId, supervisorId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students-with-supervisors');
        setAssignDialogOpen(false);
        setSelectedStudent(null);
        setSelectedSupervisor('');
      }
    }
  );

  const handleAssignSupervisor = (student: any) => {
    setSelectedStudent(student);
    setSelectedSupervisor(student.latestInternship?.universitySupervisor?.id || '');
    setAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedStudent && selectedSupervisor) {
      assignSupervisorMutation.mutate({
        studentId: selectedStudent.id,
        supervisorId: selectedSupervisor as number
      });
    }
  };

  const handleCloseDialog = () => {
    setAssignDialogOpen(false);
    setSelectedStudent(null);
    setSelectedSupervisor('');
  };

  if (studentsLoading || supervisorsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <SupervisorAccount sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Student Supervisor Assignment
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="primary">
                {studentsWithSupervisors?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="success.main">
                {studentsWithSupervisors?.filter((s: any) => s.latestInternship?.universitySupervisor).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students with University Supervisors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="warning.main">
                {studentsWithSupervisors?.filter((s: any) => !s.latestInternship?.universitySupervisor).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students without University Supervisors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Registration Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Internship Status</TableCell>
                <TableCell>University Supervisor</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsWithSupervisors?.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {student.name}
                        </Typography>
                        <Chip 
                          label={student.isApproved ? 'Approved' : 'Pending'} 
                          size="small" 
                          color={student.isApproved ? 'success' : 'warning'}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.registrationNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {student.latestInternship ? (
                      <Chip 
                        label={student.latestInternship.status} 
                        size="small" 
                        color="primary"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No internship
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.latestInternship?.universitySupervisor ? (
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: 'success.main' }}>
                          <School sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {student.latestInternship.universitySupervisor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.latestInternship.universitySupervisor.email}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Chip 
                        label="No Supervisor" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Assignment />}
                      onClick={() => handleAssignSupervisor(student)}
                      disabled={!student.latestInternship}
                    >
                      {student.latestInternship?.universitySupervisor ? 'Reassign' : 'Assign'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Assignment sx={{ mr: 1 }} />
            Assign University Supervisor
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Assigning supervisor for: <strong>{selectedStudent.name}</strong> ({selectedStudent.registrationNumber})
              </Alert>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select University Supervisor</InputLabel>
                <Select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  label="Select University Supervisor"
                >
                  {universitySupervisors?.map((supervisor: any) => (
                    <MenuItem key={supervisor.id} value={supervisor.id}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <School />
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {supervisor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {supervisor.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedSupervisor && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Supervisor:
                  </Typography>
                  {(() => {
                    const supervisor = universitySupervisors?.find((s: any) => s.id === selectedSupervisor);
                    return supervisor ? (
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              <School />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {supervisor.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {supervisor.email}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssignment}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={!selectedSupervisor || assignSupervisorMutation.isLoading}
          >
            {assignSupervisorMutation.isLoading ? 'Assigning...' : 'Assign Supervisor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentSupervisorAssignment;
