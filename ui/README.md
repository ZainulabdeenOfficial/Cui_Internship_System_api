# CUI Internship System - Frontend

A modern React TypeScript frontend for the CUI Internship Management System.

## Features

- **Modern UI**: Built with Material-UI (MUI) for a beautiful and responsive design
- **Role-based Access**: Different interfaces for Students, Company Supervisors, University Supervisors, and Admins
- **Authentication**: JWT-based authentication with protected routes
- **Real-time Data**: React Query for efficient data fetching and caching
- **Form Validation**: React Hook Form for robust form handling
- **TypeScript**: Full type safety throughout the application

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- The .NET backend API running on `https://localhost:7000`

## Installation

1. Navigate to the UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start the development server
- `npm build` - Build the app for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (not recommended)

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── Internships/    # Internship management
│   └── Layout/         # Layout components
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript type definitions
├── App.tsx            # Main application component
└── index.tsx          # Application entry point
```

## User Roles

### Student
- Request internships
- Submit weekly and final reports
- Mark attendance
- View certificates

### Company Supervisor
- Supervise student internships
- Review reports
- Mark attendance
- Provide feedback

### University Supervisor
- Supervise student internships
- Review reports
- Approve final reports
- Generate certificates

### Admin
- Manage all users
- Approve companies
- Activate/complete internships
- View system statistics

## API Integration

The frontend communicates with the .NET backend API through the `apiService` in `src/services/api.ts`. The API base URL is configured to `https://localhost:7000/api`.

## Environment Variables

Create a `.env` file in the root directory to configure:

```
REACT_APP_API_URL=https://localhost:7000/api
```

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `build/` directory

## Troubleshooting

### CORS Issues
Make sure the .NET backend has CORS properly configured to allow requests from `http://localhost:3000`.

### API Connection Issues
- Verify the backend is running on `https://localhost:7000`
- Check that the API endpoints match the frontend service calls
- Ensure JWT authentication is properly configured

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types for all new components
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the CUI Internship System.
