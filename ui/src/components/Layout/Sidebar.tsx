import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard,
  School,
  Business,
  Assignment,
  Assessment,
  CardGiftcard,
  People,
  Settings,
  Work,
  EventNote,
  Person,
  ManageAccounts,
  SupervisorAccount
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: ['Admin', 'Student', 'CompanySupervisor', 'UniversitySupervisor']
  },
  {
    text: 'Internships',
    icon: <Work />,
    path: '/internships',
    roles: ['Admin', 'Student', 'CompanySupervisor', 'UniversitySupervisor']
  },
  {
    text: 'Companies',
    icon: <Business />,
    path: '/companies',
    roles: ['Admin', 'Student', 'CompanySupervisor']
  },
  {
    text: 'Students',
    icon: <School />,
    path: '/students',
    roles: ['Admin', 'UniversitySupervisor']
  },
  {
    text: 'Attendance',
    icon: <EventNote />,
    path: '/attendance',
    roles: ['Student', 'CompanySupervisor', 'UniversitySupervisor']
  },
  {
    text: 'Weekly Reports',
    icon: <Assignment />,
    path: '/reports/weekly',
    roles: ['Student', 'CompanySupervisor', 'UniversitySupervisor']
  },
  {
    text: 'Final Reports',
    icon: <Assessment />,
    path: '/reports/final',
    roles: ['Student', 'CompanySupervisor', 'UniversitySupervisor']
  },
  {
    text: 'Certificates',
    icon: <CardGiftcard />,
    path: '/certificates',
    roles: ['Admin', 'Student', 'UniversitySupervisor']
  },
  {
    text: 'Users',
    icon: <People />,
    path: '/users',
    roles: ['Admin']
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: '/settings',
    roles: ['Admin']
  },
  {
    text: 'My Profile',
    icon: <Person />,
    path: '/student-profile',
    roles: ['Student']
  },
  {
    text: 'Company Management',
    icon: <ManageAccounts />,
    path: '/company-management',
    roles: ['CompanySupervisor']
  },
  {
    text: 'Supervisor Management',
    icon: <SupervisorAccount />,
    path: '/university-supervisor-management',
    roles: ['UniversitySupervisor']
  }
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {filteredMenuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            CUI Internship System
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
