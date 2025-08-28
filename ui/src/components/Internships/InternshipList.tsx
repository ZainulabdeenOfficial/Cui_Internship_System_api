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
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Visibility,
  CheckCircle,
  Work
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { InternshipStatus, InternshipRequest } from '../../types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const InternshipList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState<InternshipRequest>({
    companyId: 0,
    startDate: undefined,
    endDate: undefined
  });

  const { data: internships, isLoading } = useQuery('internships', apiService.getInternships);
  const { data: companies } = useQuery('companies', apiService.getCompanies);

  const requestInternshipMutation = useMutation(apiService.requestInternship, {
    onSuccess: () => {
      queryClient.invalidateQueries('internships');
      setOpenDialog(false);
      setFormData({ companyId: 0, startDate: undefined, endDate: undefined });
    }
  });

  const activateInternshipMutation = useMutation(apiService.activateInternship, {
    onSuccess: () => {
      queryClient.invalidateQueries('internships');
    }
  });

  const completeInternshipMutation = useMutation(apiService.completeInternship, {
    onSuccess: () => {
      queryClient.invalidateQueries('internships');
    }
  });

  const getStatusColor = (status: InternshipStatus) => {
    switch (status) {
      case InternshipStatus.Active:
        return 'success';
      case InternshipStatus.Completed:
        return 'primary';
      case InternshipStatus.Pending:
        return 'warning';
      case InternshipStatus.Rejected:
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRequestInternship = () => {
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    requestInternshipMutation.mutate(formData);
  };

  const handleActivate = (id: number) => {
    activateInternshipMutation.mutate(id);
  };

  const handleComplete = (id: number) => {
    completeInternshipMutation.mutate(id);
  };

  const filteredInternships = internships?.filter(internship => {
    if (user?.role === 'Student') {
      return internship.student?.user?.id === user.id;
    }
    if (user?.role === 'CompanySupervisor') {
      return internship.companySupervisorId;
    }
    if (user?.role === 'UniversitySupervisor') {
      return internship.universitySupervisorId;
    }
    return true; // Admin sees all
  });

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Internships
        </Typography>
        {user?.role === 'Student' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleRequestInternship}
          >
            Request Internship
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInternships?.map((internship) => (
              <TableRow key={internship.id}>
                <TableCell>
                  {internship.student?.user?.fullName || 'N/A'}
                </TableCell>
                <TableCell>
                  {internship.company?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={internship.status}
                    color={getStatusColor(internship.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'Not set'}
                </TableCell>
                <TableCell>
                  {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Not set'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    {user?.role === 'Admin' && internship.status === InternshipStatus.Pending && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleActivate(internship.id)}
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    {(user?.role === 'Admin' || user?.role === 'UniversitySupervisor') && 
                     internship.status === InternshipStatus.Active && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleComplete(internship.id)}
                      >
                        <Work />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Request Internship Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request New Internship</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Company</InputLabel>
            <Select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value as number })}
              label="Company"
            >
              {companies?.filter(c => c.isApproved).map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={(date) => setFormData({ 
                ...formData, 
                startDate: date ? date.toISOString() : undefined 
              })}
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />

            <DatePicker
              label="End Date"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={(date) => setFormData({ 
                ...formData, 
                endDate: date instanceof Date && !isNaN(date.getTime()) ? date.toISOString() : undefined
              })}
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={requestInternshipMutation.isLoading}
          >
            {requestInternshipMutation.isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InternshipList;
