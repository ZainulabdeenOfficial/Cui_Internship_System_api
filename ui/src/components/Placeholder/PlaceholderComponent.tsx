import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';

interface PlaceholderComponentProps {
  title: string;
  description?: string;
}

const PlaceholderComponent: React.FC<PlaceholderComponentProps> = ({ title, description }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Construction sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description || 'This feature is under development and will be available soon.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default PlaceholderComponent;
