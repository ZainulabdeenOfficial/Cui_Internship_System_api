# CUI Internship Management System

A comprehensive web-based internship management system for universities, built with ASP.NET Core Web API backend and React.js frontend.

## 🚀 Features

### 👥 User Roles & Permissions

#### 1. Student
- **Self-registration** with admin approval requirement
- **Company selection** or submit new company requests
- **Download offer letters** once approved
- **Upload weekly reports** and final reports
- **View attendance records** and track progress
- **Download internship completion certificates**

#### 2. Company Supervisor
- **Self-registration** with admin approval
- **Account creation** by admin with temporary passwords
- **Validate student internship participation**
- **Mark daily attendance** for students
- **Add performance comments** and feedback

#### 3. University Supervisor
- **Admin-created accounts** (internal staff)
- **View assigned students** and their progress
- **Review & grade weekly reports**
- **Approve final reports**
- **Monitor student attendance**

#### 4. Admin
- **Approve/Reject** student and company supervisor accounts
- **Create/Manage** university supervisor accounts
- **Approve new company requests**
- **View all reports** and attendance data
- **Generate and issue certificates**

## 🛠 Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT with ASP.NET Core Identity
- **Authorization**: Role-based access control (RBAC)

### Frontend
- **Framework**: React.js 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query for server state
- **HTTP Client**: Axios
- **Routing**: React Router

### Database
- **ORM**: Entity Framework Core
- **Database**: SQL Server / PostgreSQL
- **Migrations**: Code-first approach

## 📋 Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server or PostgreSQL
- Visual Studio 2022 or VS Code

## 🚀 Quick Start

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cui_Internship_System
   ```

2. **Configure database connection**
   - Update `appsettings.json` with your database connection string
   - For SQL Server:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CuiInternshipDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
     ```

3. **Run database migrations**
   ```bash
   cd Cui_Internship_System
   dotnet ef database update
   ```

4. **Seed initial data**
   ```bash
   dotnet run --project Cui_Internship_System
   ```
   Then visit: `https://localhost:7115/api/seed`

5. **Start the backend**
   ```bash
   dotnet run
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd ui
   npm install
   ```

2. **Configure API URL**
   - Create `.env` file in the `ui` directory:
     ```
     REACT_APP_API_URL=https://localhost:7115/api
     ```

3. **Start the frontend**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "Student",
  "registrationNumber": "FA22-BCS-090"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Admin Endpoints

#### Approve Student
```http
PUT /api/admin/students/{id}/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "approve": true,
  "comments": "Approved after document verification"
}
```

#### Approve Company
```http
PUT /api/admin/companies/{id}/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "approve": true,
  "comments": "Company verified and approved"
}
```

#### Create University Supervisor
```http
POST /api/admin/supervisors/university
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "Dr. Jane Smith",
  "email": "jane.smith@university.edu",
  "password": "TempPassword123!"
}
```

#### Generate Certificate
```http
POST /api/admin/certificates/{studentId}
Authorization: Bearer <admin-token>
```

### Student Endpoints

#### Submit Weekly Report
```http
POST /api/students/reports/weekly
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "weekNumber": 1,
  "content": "This week I worked on..."
}
```

#### Submit Final Report
```http
POST /api/students/reports/final
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "content": "Final report content..."
}
```

#### Submit Company Request
```http
POST /api/students/companies
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "name": "Tech Corp",
  "address": "123 Tech Street, City",
  "contactPerson": "John Manager",
  "contactEmail": "john@techcorp.com",
  "contactPhone": "+1234567890"
}
```

### Company Supervisor Endpoints

#### Self Register
```http
POST /api/company-supervisors/register
Content-Type: application/json

{
  "fullName": "Manager Name",
  "email": "manager@company.com",
  "password": "Password123!",
  "role": "CompanySupervisor"
}
```

#### Mark Attendance
```http
POST /api/company-supervisors/attendance
Authorization: Bearer <supervisor-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "checkInTime": "09:00",
  "checkOutTime": "17:00",
  "notes": "Student performed well today"
}
```

### University Supervisor Endpoints

#### Review Weekly Report
```http
PUT /api/university-supervisors/reports/weekly/{reportId}
Authorization: Bearer <supervisor-token>
Content-Type: application/json

{
  "status": "Approved",
  "supervisorComments": "Excellent work on this report"
}
```

#### Monitor Attendance
```http
GET /api/university-supervisors/attendance/{internshipId}
Authorization: Bearer <supervisor-token>
```

## 🗄️ Database Schema

### Core Entities

#### Users & Authentication
- `ApplicationUser` - Base user entity with Identity
- `Student` - Student-specific data with registration numbers
- `CompanySupervisor` - Company supervisor profiles
- `UniversitySupervisor` - University supervisor profiles

#### Internship Management
- `Company` - Company information and approval status
- `Internship` - Main internship entity linking students, companies, and supervisors
- `Attendance` - Daily attendance records with check-in/out times
- `WeeklyReport` - Weekly progress reports from students
- `FinalReport` - Final internship reports
- `Certificate` - Internship completion certificates
- `OfferLetter` - Internship offer letters

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Authorization** (RBAC)
- **Password Policy Enforcement**
- **First Login Password Change** requirement
- **Audit Logging** for critical operations
- **Input Validation** and sanitization
- **CORS Configuration** for frontend integration

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Material Design principles
- Dark/Light theme support

### Dashboard Features
- **Real-time statistics** and metrics
- **Interactive charts** and progress indicators
- **Tabbed interfaces** for organized content
- **Search and filtering** capabilities
- **Export functionality** for reports

### User Experience
- **Intuitive navigation** with breadcrumbs
- **Loading states** and error handling
- **Form validation** with helpful messages
- **Confirmation dialogs** for critical actions
- **Toast notifications** for user feedback

## 🚀 Deployment

### Backend Deployment
1. **Build the application**
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. **Deploy to Azure/AWS/GCP**
   - Use Azure App Service, AWS Elastic Beanstalk, or Google Cloud Run
   - Configure environment variables for production
   - Set up SSL certificates

### Frontend Deployment
1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service**
   - Netlify, Vercel, or AWS S3 + CloudFront
   - Configure environment variables
   - Set up custom domain with SSL

## 🔧 Configuration

### Environment Variables

#### Backend (.NET)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your-database-connection-string"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key",
    "Issuer": "your-issuer",
    "Audience": "your-audience",
    "ExpirationHours": 24
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

#### Frontend (React)
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## 🧪 Testing

### Backend Testing
```bash
# Run unit tests
dotnet test

# Run integration tests
dotnet test --filter Category=Integration
```

### Frontend Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added certificate generation and advanced reporting
- **v1.2.0** - Enhanced UI/UX and mobile responsiveness
- **v1.3.0** - Added real-time notifications and audit logging

---

**Built with ❤️ for CUI Internship Management**
