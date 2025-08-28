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
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  School,
  TrendingUp,
  ExpandMore,
  Grade as GradeIcon,
  Assessment
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Grade } from '../../types';

const StudentGrades: React.FC = () => {
  const { user } = useAuth();
  const [expandedInternship, setExpandedInternship] = useState<number | null>(null);

  const { data: gradesData, isLoading, error } = useQuery(
    ['student-grades', user?.id],
    () => apiService.getMyGrades(),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  const handleAccordionChange = (internshipId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedInternship(isExpanded ? internshipId : null);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading grades. Please try again later.
      </Alert>
    );
  }

  if (!gradesData || gradesData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <GradeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Grades Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your grades will appear here once they are assigned by your supervisors.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <GradeIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          My Grades
        </Typography>
      </Box>

      {gradesData.map((internship: any) => (
        <Accordion
          key={internship.internshipId}
          expanded={expandedInternship === internship.internshipId}
          onChange={handleAccordionChange(internship.internshipId)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" width="100%">
              <Box flexGrow={1}>
                <Typography variant="h6">
                  {internship.companyName || 'Unknown Company'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Internship Status: <Chip label={internship.status} size="small" color="primary" />
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="h6" color="primary">
                  {internship.grades.length} Grade{internship.grades.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {internship.grades.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={2}>
                No grades have been assigned for this internship yet.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {internship.grades.map((grade: Grade) => (
                  <Grid item xs={12} md={6} key={grade.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" component="h3">
                            {grade.component}
                          </Typography>
                          <Chip
                            label={`${grade.percentage}%`}
                            color={getGradeColor(grade.percentage || 0) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Score: {grade.score}/{grade.maxScore}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Grade: {getGradeLetter(grade.percentage || 0)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={grade.percentage || 0}
                            color={getGradeColor(grade.percentage || 0) as any}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Graded by: {grade.gradedBy}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(grade.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>

                        {grade.comments && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Comments:
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              backgroundColor: 'grey.50', 
                              p: 1, 
                              borderRadius: 1,
                              fontStyle: 'italic'
                            }}>
                              {grade.comments}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Summary Statistics */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Grade Summary
        </Typography>
        
        <Grid container spacing={2}>
          {gradesData.map((internship: any) => {
            if (internship.grades.length === 0) return null;
            
            const averagePercentage = internship.grades.reduce((sum: number, grade: Grade) => 
              sum + (grade.percentage || 0), 0) / internship.grades.length;
            
            return (
              <Grid item xs={12} md={6} key={internship.internshipId}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {internship.companyName}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {averagePercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Grade: {getGradeLetter(averagePercentage)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {internship.grades.length} component{internship.grades.length !== 1 ? 's' : ''} graded
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentGrades;
