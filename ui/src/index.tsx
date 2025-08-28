import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#6d28d9' },
    background: { default: '#f7f9fc' }
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(16,24,40,0.08)',
          border: '1px solid #eef2f7'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: { root: { borderRadius: 10, border: '1px solid #eef2f7' } }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f3f6fb'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#344054'
        }
      }
    },
    MuiButton: {
      defaultProps: { variant: 'contained' },
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: 0.15
        }
      }
    }
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
