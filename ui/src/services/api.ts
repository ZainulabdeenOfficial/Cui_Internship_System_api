import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Internship, 
  Company, 
  Student,
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
  ChangePasswordRequest
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
    const response: AxiosResponse<Company[]> = await this.api.get('/companies/pending');
    return response.data;
  }

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    const response: AxiosResponse<Company> = await this.api.post('/companies', companyData);
    return response.data;
  }

  async updateCompany(id: number, companyData: Partial<Company>): Promise<Company> {
    const response: AxiosResponse<Company> = await this.api.put(`/companies/${id}`, companyData);
    return response.data;
  }

  async deleteCompany(id: number): Promise<void> {
    await this.api.delete(`/companies/${id}`);
  }

  async approveCompany(id: number): Promise<void> {
    await this.api.post(`/companies/${id}/approve`);
  }

  async rejectCompany(id: number): Promise<void> {
    await this.api.post(`/companies/${id}/reject`);
  }

  // Student endpoints
  async getStudents(): Promise<Student[]> {
    const response: AxiosResponse<Student[]> = await this.api.get('/students');
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
}

export const apiService = new ApiService();
export default apiService;
