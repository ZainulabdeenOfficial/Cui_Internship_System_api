import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Internship, 
  Company, 
  Attendance,
  WeeklyReport,
  FinalReport,
  Certificate,
  InternshipRequest,
  CompanyRequest,
  WeeklyReportRequest,
  FinalReportRequest,
  ReportReview,
  AttendanceRequest,
  PerformanceComment,
  InternshipValidation,
  ChangePasswordRequest,
  Grade,
  GradeCreateRequest,
  GradeUpdateRequest,
  StudentSupervisors
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7115/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Seed endpoint
  async seed(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/seed');
    return response.data;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/auth/change-password', passwordData);
    return response.data;
  }

  // Internship endpoints
  async getInternships(): Promise<Internship[]> {
    const response: AxiosResponse<Internship[]> = await this.api.get('/internships');
    return response.data;
  }

  async requestInternship(internshipData: InternshipRequest): Promise<Internship> {
    const response: AxiosResponse<Internship> = await this.api.post('/internships', internshipData);
    return response.data;
  }

  async activateInternship(id: number): Promise<void> {
    await this.api.post(`/internships/${id}/activate`);
  }

  async completeInternship(id: number): Promise<void> {
    await this.api.post(`/internships/${id}/complete`);
  }

  // Company endpoints
  async getCompanies(): Promise<Company[]> {
    const response: AxiosResponse<Company[]> = await this.api.get('/companies');
    return response.data;
  }

  async getApprovedCompanies(): Promise<Company[]> {
    const response: AxiosResponse<Company[]> = await this.api.get('/companies/approved');
    return response.data;
  }

  async getPendingCompanies(): Promise<Company[]> {
    const response: AxiosResponse<Company[]> = await this.api.get('/admin/companies/pending');
    return response.data;
  }



  async approveCompany(id: number): Promise<void> {
    await this.api.put(`/admin/companies/${id}/approve`, { approve: true });
  }

  async rejectCompany(id: number): Promise<void> {
    await this.api.put(`/admin/companies/${id}/approve`, { approve: false });
  }



  async getMyInternships(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/students/me/internships');
    return response.data;
  }

  async getStudents(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/students');
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/admin/dashboard');
    return response.data;
  }

  async approveStudent(studentId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.put(`/admin/students/${studentId}/approve`, { approve: true });
    return response.data;
  }

  async generateCertificate(studentId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/admin/certificates/${studentId}`);
    return response.data;
  }

  async getCertificate(internshipId: number): Promise<Certificate> {
    const response: AxiosResponse<Certificate> = await this.api.get(`/certificates/${internshipId}`);
    return response.data;
  }

  async createStudent(studentData: any): Promise<void> {
    await this.api.post('/admin/students', studentData);
  }

  async deleteStudent(id: string): Promise<void> {
    await this.api.delete(`/admin/students/${id}`);
  }

  async createCompany(companyData: any): Promise<void> {
    await this.api.post('/admin/companies', companyData);
  }

  async deleteCompany(id: number): Promise<void> {
    await this.api.delete(`/admin/companies/${id}`);
  }

  // Supervisor management
  async getCompanySupervisors(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/supervisors/company');
    return response.data;
  }

  async approveCompanySupervisor(id: number, approve: boolean): Promise<void> {
    await this.api.put(`/admin/supervisors/company/${id}/approve`, { approve });
  }

  async createCompanySupervisor(supervisorData: any): Promise<void> {
    await this.api.post('/admin/supervisors/company', supervisorData);
  }

  async getUniversitySupervisors(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/supervisors/university');
    return response.data;
  }

  async approveUniversitySupervisor(id: number, approve: boolean): Promise<void> {
    await this.api.put(`/admin/supervisors/university/${id}/approve`, { approve });
  }

  async createUniversitySupervisor(supervisorData: any): Promise<void> {
    await this.api.post('/admin/supervisors/university', supervisorData);
  }

  async deleteUniversitySupervisor(id: number): Promise<void> {
    await this.api.delete(`/admin/supervisors/university/${id}`);
  }

  // Student endpoints
  async getStudentAttendance(internshipId: number): Promise<Attendance[]> {
    const response: AxiosResponse<Attendance[]> = await this.api.get(`/students/attendance/${internshipId}`);
    return response.data;
  }

  async getStudentCertificate(internshipId: number): Promise<Certificate> {
    const response: AxiosResponse<Certificate> = await this.api.get(`/students/certificate/${internshipId}`);
    return response.data;
  }

  async submitCompanyRequest(companyData: CompanyRequest): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/students/companies', companyData);
    return response.data;
  }

  async submitWeeklyReport(reportData: WeeklyReportRequest): Promise<WeeklyReport> {
    const response: AxiosResponse<WeeklyReport> = await this.api.post('/students/reports/weekly', reportData);
    return response.data;
  }

  async submitFinalReport(reportData: FinalReportRequest): Promise<FinalReport> {
    const response: AxiosResponse<FinalReport> = await this.api.post('/students/reports/final', reportData);
    return response.data;
  }

  // Company Supervisor endpoints
  async registerCompanySupervisor(userData: RegisterRequest): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/company-supervisors/register', userData);
    return response.data;
  }

  async getAssignedStudents(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/company-supervisors/students');
    return response.data;
  }

  async markAttendance(attendanceData: AttendanceRequest & { internshipId: number }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/company-supervisors/attendance', attendanceData);
    return response.data;
  }

  async validateInternship(validationData: InternshipValidation): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/company-supervisors/validate', validationData);
    return response.data;
  }

  async addPerformanceComments(commentData: PerformanceComment): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/company-supervisors/comments', commentData);
    return response.data;
  }

  // University Supervisor endpoints
  async getUniversityStudents(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/university-supervisors/students');
    return response.data;
  }

  async getWeeklyReports(internshipId?: number): Promise<WeeklyReport[]> {
    const url = internshipId 
      ? `/university-supervisors/reports/weekly/${internshipId}`
      : '/university-supervisors/reports/weekly';
    const response: AxiosResponse<WeeklyReport[]> = await this.api.get(url);
    return response.data;
  }

  async getFinalReports(): Promise<FinalReport[]> {
    const response: AxiosResponse<FinalReport[]> = await this.api.get('/university-supervisors/reports/final');
    return response.data;
  }

  async reviewWeeklyReport(reportId: number, reviewData: ReportReview): Promise<any> {
    const response: AxiosResponse<any> = await this.api.put(`/university-supervisors/reports/weekly/${reportId}`, reviewData);
    return response.data;
  }

  async getFinalReport(internshipId: number): Promise<FinalReport | null> {
    const response: AxiosResponse<FinalReport> = await this.api.get(`/university-supervisors/reports/final/${internshipId}`);
    return response.data;
  }

  async approveFinalReport(reportId: number, reviewData: ReportReview): Promise<any> {
    const response: AxiosResponse<any> = await this.api.put(`/university-supervisors/reports/final/${reportId}`, reviewData);
    return response.data;
  }

  async monitorAttendance(internshipId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/university-supervisors/attendance/${internshipId}`);
    return response.data;
  }

  // Attendance endpoints
  async getAttendance(): Promise<Attendance[]> {
    const response: AxiosResponse<Attendance[]> = await this.api.get('/attendance');
    return response.data;
  }

  async markAttendanceGeneral(attendanceData: AttendanceRequest): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/attendance', attendanceData);
    return response.data;
  }

  async getAttendanceForInternship(internshipId: number): Promise<Attendance[]> {
    const response: AxiosResponse<Attendance[]> = await this.api.get(`/attendance/${internshipId}`);
    return response.data;
  }

  // Reports endpoints
  async getReports(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/reports');
    return response.data;
  }

  async getWeeklyReportsGeneral(): Promise<WeeklyReport[]> {
    const response: AxiosResponse<WeeklyReport[]> = await this.api.get('/reports/weekly');
    return response.data;
  }

  async getFinalReportsGeneral(): Promise<FinalReport[]> {
    const response: AxiosResponse<FinalReport[]> = await this.api.get('/reports/final');
    return response.data;
  }

  // Admin Internship Management
  async getAdminInternships(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/internships');
    return response.data;
  }

  async createAdminInternship(internshipData: any): Promise<void> {
    await this.api.post('/admin/internships', internshipData);
  }

  async updateAdminInternshipStatus(id: number, status: string): Promise<void> {
    await this.api.put(`/admin/internships/${id}/status`, { status });
  }

  async deleteAdminInternship(id: number): Promise<void> {
    await this.api.delete(`/admin/internships/${id}`);
  }

  // Admin Certificate Management
  async generateAdminCertificate(studentId: number): Promise<void> {
    await this.api.post(`/admin/certificates/generate/${studentId}`);
  }

  async downloadAdminCertificate(certificateId: number): Promise<void> {
    await this.api.get(`/admin/certificates/${certificateId}/download`);
  }

  // Admin Report Management
  async getAdminWeeklyReports(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/reports/weekly');
    return response.data;
  }

  async getAdminFinalReports(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/reports/final');
    return response.data;
  }

  async reviewWeeklyReportAdmin(reportId: number, review: any): Promise<void> {
    await this.api.put(`/admin/reports/weekly/${reportId}/review`, review);
  }

  async reviewFinalReportAdmin(reportId: number, review: any): Promise<void> {
    await this.api.put(`/admin/reports/final/${reportId}/review`, review);
  }

  // Admin Dashboard Stats
  async getAdminDashboardStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/admin/dashboard/stats');
    return response.data;
  }

  // Student Profile Management
  async updateStudentProfile(data: any): Promise<void> {
    await this.api.put('/students/profile', data);
  }

  // Company Profile Management
  async getCompanyInfo(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/company-supervisors/company-info');
    return response.data;
  }

  async updateCompanyProfile(data: any): Promise<void> {
    await this.api.put('/company-supervisors/company-profile', data);
  }

  // Certificate Download
  async downloadCertificate(certificateId: number): Promise<void> {
    const response = await this.api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate-${certificateId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Grade endpoints
  async getGradesForInternship(internshipId: number): Promise<Grade[]> {
    const response: AxiosResponse<Grade[]> = await this.api.get(`/grades/internship/${internshipId}`);
    return response.data;
  }

  async getMyGrades(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/grades/student/my-grades');
    return response.data;
  }

  async createGrade(internshipId: number, gradeData: GradeCreateRequest): Promise<Grade> {
    const response: AxiosResponse<Grade> = await this.api.post(`/grades/internship/${internshipId}`, gradeData);
    return response.data;
  }

  async updateGrade(gradeId: number, gradeData: GradeUpdateRequest): Promise<Grade> {
    const response: AxiosResponse<Grade> = await this.api.put(`/grades/${gradeId}`, gradeData);
    return response.data;
  }

  async deleteGrade(gradeId: number): Promise<void> {
    await this.api.delete(`/grades/${gradeId}`);
  }

  async getAllGrades(): Promise<Grade[]> {
    const response: AxiosResponse<Grade[]> = await this.api.get('/grades/admin/all');
    return response.data;
  }

  // Supervisor assignment endpoints
  async assignUniversitySupervisor(studentId: number, supervisorId: number): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/admin/students/${studentId}/assign-supervisor`, { supervisorId });
    return response.data;
  }

  async getStudentsWithSupervisors(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/students/with-supervisors');
    return response.data;
  }

  // Student supervisor endpoints
  async getMySupervisors(): Promise<StudentSupervisors[]> {
    const response: AxiosResponse<StudentSupervisors[]> = await this.api.get('/students/supervisors');
    return response.data;
  }

}

export const apiService = new ApiService();
export default apiService;
