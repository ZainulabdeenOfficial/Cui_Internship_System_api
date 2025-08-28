import React from 'react';
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
  Chip,
  Alert
} from '@mui/material';
import { useQuery } from 'react-query';
import apiService from '../../services/api';

const ReportList: React.FC = () => {
  // Fetch reports based on user role
  const { data: weeklyReports, isLoading: weeklyLoading } = useQuery(
    'weekly-reports',
    () => apiService.getWeeklyReports()
  );

  const { data: finalReports, isLoading: finalLoading } = useQuery(
    'final-reports',
    () => apiService.getFinalReports()
  );

  if (weeklyLoading || finalLoading) {
    return <Typography>Loading reports...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      {/* Weekly Reports */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Reports
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Week</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeklyReports?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>{report.internship?.student?.user?.fullName}</TableCell>
                  <TableCell>Week {report.weekNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'Approved' ? 'success' : 
                             report.status === 'Rejected' ? 'error' : 'warning' as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{report.supervisorComments || '-'}</TableCell>
                </TableRow>
              ))}
              {(!weeklyReports || weeklyReports.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No weekly reports found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Final Reports */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Final Reports
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {finalReports?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>{report.internship?.student?.user?.fullName}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'Approved' ? 'success' : 
                             report.status === 'Rejected' ? 'error' : 'warning' as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{report.supervisorComments || '-'}</TableCell>
                </TableRow>
              ))}
              {(!finalReports || finalReports.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No final reports found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        Use the navigation menu to access specific report management features based on your role.
      </Alert>
    </Box>
  );
};

export default ReportList;
