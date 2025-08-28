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
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  CheckCircle,
  Cancel,
  LocationOn,
  Phone,
  Email,
  TrendingUp
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Company } from '../../types';

const CompanyList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    isApproved: true
  });

  const { data: companies, isLoading } = useQuery('companies', () => apiService.getCompanies());

  const createCompanyMutation = useMutation((companyData: any) => apiService.createCompany(companyData), {
    onSuccess: () => {
      queryClient.invalidateQueries('companies');
      setOpenDialog(false);
      setFormData({ name: '', address: '', phone: '', email: '', description: '', isApproved: true });
      setEditingCompany(null);
    }
  });

  const deleteCompanyMutation = useMutation(
    (companyId: number) => apiService.deleteCompany(companyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('companies');
      }
    }
  );

  const handleAddCompany = () => {
    setEditingCompany(null);
    setFormData({ name: '', address: '', phone: '', email: '', description: '', isApproved: true });
    setOpenDialog(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      description: company.description || '',
      isApproved: company.isApproved
    });
    setOpenDialog(true);
  };

  const handleDeleteCompany = (companyId: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      deleteCompanyMutation.mutate(companyId);
    }
  };

  const handleSubmit = () => {
    const companyData = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      description: formData.description,
      isApproved: formData.isApproved
    };

    createCompanyMutation.mutate(companyData);
  };

  const getCompanyStats = () => {
    if (!companies) return { total: 0, approved: 0, pending: 0, active: 0 };
    
    const total = companies.length;
    const approved = companies.filter(c => c.isApproved).length;
    const pending = total - approved;
    const active = companies.filter(c => c.isApproved && c.isActive).length;
    
    return { total, approved, pending, active };
  };

  const stats = getCompanyStats();

  if (isLoading) {
    return <Typography>Loading companies...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Companies Management
        </Typography>
        {user?.role === 'Admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCompany}
          >
            Add Company
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
                    Total Companies
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main' }}>
                  <Business />
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
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Companies
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
                    Pending Approval
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main' }}>
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
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Companies
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

      {/* Companies Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              {user?.role === 'Admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {companies?.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {company.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {company.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Email fontSize="small" />
                        <Typography variant="body2">{company.email}</Typography>
                      </Box>
                    )}
                    {company.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" />
                        <Typography variant="body2">{company.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {company.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{company.address}</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip
                      label={company.isApproved ? 'Approved' : 'Pending'}
                      color={company.isApproved ? 'success' : 'warning'}
                      size="small"
                    />
                    {company.isActive && (
                      <Chip
                        label="Active"
                        color="info"
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {company.description || 'No description available'}
                  </Typography>
                </TableCell>
                {user?.role === 'Admin' && (
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCompany(company)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCompany(company.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {(!companies || companies.length === 0) && (
              <TableRow>
                <TableCell colSpan={user?.role === 'Admin' ? 6 : 5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No companies found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Company Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Approval Status</InputLabel>
                <Select
                  value={formData.isApproved}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.value as boolean })}
                  label="Approval Status"
                >
                  <MenuItem value="true">Approved</MenuItem>
                  <MenuItem value="false">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createCompanyMutation.isLoading || !formData.name}
          >
            {createCompanyMutation.isLoading ? 'Saving...' : 'Save Company'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyList;
