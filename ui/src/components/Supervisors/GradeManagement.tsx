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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  School,
  Person,
  Email,
  Grade as GradeIcon,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Assessment
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Grade, GradeCreateRequest, GradeUpdateRequest } from '../../types';

const GradeManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<GradeCreateRequest>({
    component: '',
    score: 0,
    maxScore: 100,
    comments: ''
  });
  const queryClient = useQueryClient();

  // Fetch assigned students
  const { data: assignedStudents, isLoading: studentsLoading } = useQuery(
    ['assigned-students', user?.id],
    () => user?.role === 'UniversitySupervisor' 
      ? apiService.getUniversityStudents()
      : apiService.getAssignedStudents(),
    { enabled: !!user?.id, refetchInterval: 5000, refetchOnWindowFocus: true }
  );

  // Create grade mutation
  const createGradeMutation = useMutation(
    ({ internshipId, gradeData }: { internshipId: number; gradeData: GradeCreateRequest }) =>
      apiService.createGrade(internshipId, gradeData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assigned-students', user?.id]);
        setGradeDialogOpen(false);
        setSelectedStudent(null);
        setSelectedGrade(null);
        setIsEditing(false);
        setFormData({ component: '', score: 0, maxScore: 100, comments: '' });
      }
    }
  );

  // Update grade mutation
  const updateGradeMutation = useMutation(
    ({ gradeId, gradeData }: { gradeId: number; gradeData: GradeUpdateRequest }) =>
      apiService.updateGrade(gradeId, gradeData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assigned-students', user?.id]);
        setGradeDialogOpen(false);
        setSelectedStudent(null);
        setSelectedGrade(null);
        setIsEditing(false);
        setFormData({ component: '', score: 0, maxScore: 100, comments: '' });
      }
    }
  );

  const handleAddGrade = (student: any) => {
    setSelectedStudent(student);
    setSelectedGrade(null);
    setIsEditing(false);
    setFormData({ component: '', score: 0, maxScore: 100, comments: '' });
    setGradeDialogOpen(true);
  };

  const handleEditGrade = (student: any, grade: Grade) => {
    setSelectedStudent(student);
    setSelectedGrade(grade);
    setIsEditing(true);
    setFormData({
      component: grade.component,
      score: grade.score,
      maxScore: grade.maxScore,
      comments: grade.comments || ''
    });
    setGradeDialogOpen(true);
  };

  const handleSubmitGrade = () => {
    if (!selectedStudent?.internshipId) return;

    if (isEditing && selectedGrade) {
      updateGradeMutation.mutate({
        gradeId: selectedGrade.id,
        gradeData: {
          score: formData.score,
          maxScore: formData.maxScore,
          comments: formData.comments
        }
      });
    } else {
      createGradeMutation.mutate({
        internshipId: selectedStudent.internshipId,
        gradeData: formData
      });
    }
  };

  const handleCloseDialog = () => {
    setGradeDialogOpen(false);
    setSelectedStudent(null);
    setSelectedGrade(null);
    setIsEditing(false);
    setFormData({ component: '', score: 0, maxScore: 100, comments: '' });
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

  if (studentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <GradeIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Grade Management
        </Typography>
      </Box>

      {!assignedStudents || assignedStudents.length === 0 ? (
        <Alert severity="info">
          No students are currently assigned to you for grading.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent textAlign="center">
                  <Typography variant="h4" color="primary">
                    {assignedStudents.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {assignedStudents.filter((s: any) => s.grades && s.grades.length > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students with Grades
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {assignedStudents.filter((s: any) => !s.grades || s.grades.length === 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students without Grades
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
                    <TableCell>Company</TableCell>
                    <TableCell>Internship Status</TableCell>
                    <TableCell>Grades</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedStudents.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {student.studentName || student.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student.registrationNumber || student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {student.companyName || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={student.status || 'Active'} 
                          size="small" 
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        {student.grades && student.grades.length > 0 ? (
                          <Box>
                            {student.grades.map((grade: Grade) => (
                              <Chip
                                key={grade.id}
                                label={`${grade.component}: ${grade.percentage}%`}
                                size="small"
                                color={getGradeColor(grade.percentage || 0) as any}
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No grades assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAddGrade(student)}
                          sx={{ mr: 1 }}
                        >
                          Add Grade
                        </Button>
                        {student.grades && student.grades.length > 0 && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditGrade(student, student.grades[0])}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <GradeIcon sx={{ mr: 1 }} />
            {isEditing ? 'Edit Grade' : 'Add Grade'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                {isEditing ? 'Editing grade for: ' : 'Adding grade for: '}
                <strong>{selectedStudent.studentName || selectedStudent.name}</strong>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Component"
                    value={formData.component}
                    onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                    disabled={isEditing}
                    helperText="e.g., Attendance, Weekly Reports, Final Report, Overall"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Score"
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: formData.maxScore, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Maximum Score"
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseFloat(e.target.value) || 100 })}
                    inputProps={{ min: 1, step: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comments"
                    multiline
                    rows={3}
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Optional comments about the grade..."
                  />
                </Grid>
              </Grid>

              {/* Grade Preview */}
              {formData.score > 0 && formData.maxScore > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Grade Preview
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body1">
                          {formData.component || 'Component'}
                        </Typography>
                        <Chip
                          label={`${((formData.score / formData.maxScore) * 100).toFixed(1)}%`}
                          color={getGradeColor((formData.score / formData.maxScore) * 100) as any}
                        />
                      </Box>
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Score: {formData.score}/{formData.maxScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Grade: {getGradeLetter((formData.score / formData.maxScore) * 100)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(formData.score / formData.maxScore) * 100}
                          color={getGradeColor((formData.score / formData.maxScore) * 100) as any}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
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
            onClick={handleSubmitGrade}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={!formData.component || formData.score <= 0 || 
                     (createGradeMutation.isLoading || updateGradeMutation.isLoading)}
          >
            {createGradeMutation.isLoading || updateGradeMutation.isLoading 
              ? 'Saving...' 
              : (isEditing ? 'Update Grade' : 'Add Grade')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradeManagement;
