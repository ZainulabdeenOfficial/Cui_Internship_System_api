import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { xs: 0, md: '240px' },
          minHeight: '100vh',
          bgcolor: 'grey.50',
          transition: 'margin-left 0.2s ease-in-out'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
