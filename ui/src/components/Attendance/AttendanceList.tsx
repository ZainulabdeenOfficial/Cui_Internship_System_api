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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add,
  Edit,
  CheckCircle,
  Cancel,
  EventNote,
  TrendingUp
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Attendance } from '../../types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AttendanceList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    checkInTime: '',
    checkOutTime: '',
    notes: ''
  });

  // Get user's internships first
  const { data: internships } = useQuery('internships', apiService.getInternships);
  
  // Get attendance for the user's internships
  const { data: attendanceRecords, isLoading } = useQuery(
    ['attendance', user?.id],
    async () => {
      if (!internships) return [];
      
      const userInternships = user?.role === 'Student' 
        ? internships.filter(i => i.student?.user?.id === user.id)
        : user?.role === 'CompanySupervisor'
        ? internships.filter(i => i.companySupervisorId)
        : internships.filter(i => i.universitySupervisorId);
      
      const allAttendance: Attendance[] = [];
      for (const internship of userInternships) {
        try {
          const attendance = await apiService.getStudentAttendance(internship.id);
          allAttendance.push(...attendance);
        } catch (error) {
          console.log(`No attendance data for internship ${internship.id}`);
        }
      }
      return allAttendance;
    },
    { enabled: !!internships && !!user }
  );

  const markAttendanceMutation = useMutation(apiService.markAttendance, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance', user?.id]);
      setOpenDialog(false);
      setFormData({ date: new Date(), checkInTime: '', checkOutTime: '', notes: '' });
      setEditingAttendance(null);
    }
  });

  const handleAddAttendance = () => {
    setEditingAttendance(null);
    setFormData({ date: new Date(), checkInTime: '', checkOutTime: '', notes: '' });
    setOpenDialog(true);
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      date: new Date(attendance.date),
      checkInTime: attendance.checkInTime || '',
      checkOutTime: attendance.checkOutTime || '',
      notes: attendance.notes || ''
    });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (!internships) return;
    
    const userInternships = user?.role === 'Student' 
      ? internships.filter(i => i.student?.user?.id === user.id)
      : internships.filter(i => i.companySupervisorId);
    
    if (userInternships.length === 0) return;
    
    const attendanceData = {
      internshipId: userInternships[0].id,
      date: formData.date.toISOString(),
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      notes: formData.notes
    };

    markAttendanceMutation.mutate(attendanceData);
  };

  const getStatusColor = (attendance: Attendance) => {
    if (attendance.checkInTime && attendance.checkOutTime) return 'success';
    if (attendance.checkInTime) return 'warning';
    return 'error';
  };

  const getStatusText = (attendance: Attendance) => {
    if (attendance.checkInTime && attendance.checkOutTime) return 'Complete';
    if (attendance.checkInTime) return 'Checked In';
    return 'Absent';
  };

  const getAttendanceStats = () => {
    if (!attendanceRecords) return { total: 0, present: 0, absent: 0, percentage: 0 };
    
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.checkInTime).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, percentage };
  };

  const stats = getAttendanceStats();

  if (isLoading) {
    return <Typography>Loading attendance data...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Attendance Tracking
        </Typography>
        {user?.role === 'Student' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddAttendance}
          >
            Mark Attendance
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
                    Total Days
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <EventNote />
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
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.absent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent Days
                  </Typography>
                </Box>
                <Box sx={{ color: 'error.main' }}>
                  <Cancel />
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
      </Grid>

      {/* Attendance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords?.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell>
                  {new Date(attendance.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {attendance.checkInTime || 'Not checked in'}
                </TableCell>
                <TableCell>
                  {attendance.checkOutTime || 'Not checked out'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(attendance)}
                    color={getStatusColor(attendance) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {attendance.notes || '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditAttendance(attendance)}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!attendanceRecords || attendanceRecords.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No attendance records found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Attendance Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
          </LocalizationProvider>
          
          <TextField
            fullWidth
            label="Check In Time"
            type="time"
            value={formData.checkInTime}
            onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="Check Out Time"
            type="time"
            value={formData.checkOutTime}
            onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={markAttendanceMutation.isLoading}
          >
            {markAttendanceMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceList;
