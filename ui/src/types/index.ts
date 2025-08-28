export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  registrationNumber?: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  FullName: string;
  email: string;
  password: string;
  role: string;
  registrationNumber?: string;
}

export interface Student {
  id: number;
  userId: string;
  registrationNumber: string;
  user?: User;
  internships: Internship[];
}

export interface Company {
  id: number;
  name: string;
  address: string;
  isApproved: boolean;
  email?: string;
  phone?: string;
  description?: string;
  isActive?: boolean;
  internships: Internship[];
}

export interface Internship {
  id: number;
  studentId: number;
  companyId: number;
  companySupervisorId?: number;
  universitySupervisorId?: number;
  status: InternshipStatus;
  startDate?: string;
  endDate?: string;
  student?: Student;
  company?: Company;
  attendances: Attendance[];
  weeklyReports: WeeklyReport[];
  finalReport?: FinalReport;
  certificate?: Certificate;
  offerLetter?: OfferLetter;
}

export interface Attendance {
  id: number;
  internshipId: number;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  remarks: string;
  status?: string;
}

export interface WeeklyReport {
  id: number;
  internshipId: number;
  weekNumber: number;
  content: string;
  status: ReportStatus;
  supervisorComments?: string;
}

export interface FinalReport {
  id: number;
  internshipId: number;
  content: string;
  status: ReportStatus;
  supervisorComments?: string;
  createdAt?: string;
}

export interface Certificate {
  id: number;
  internshipId: number;
  certificateNumber: string;
  issuedOn: string;
  studentName?: string;
  companyName?: string;
  issueDate?: string;
  isIssued?: boolean;
}

export interface OfferLetter {
  id: number;
  internshipId: number;
  fileUrl: string;
}

export enum InternshipStatus {
  Pending = 'Pending',
  Active = 'Active',
  Completed = 'Completed',
  Rejected = 'Rejected'
}

export enum ReportStatus {
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface InternshipRequest {
  companyId: number;
  companySupervisorId?: number;
  universitySupervisorId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CompanyRequest {
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export interface WeeklyReportRequest {
  weekNumber: number;
  content: string;
}

export interface FinalReportRequest {
  content: string;
}

export interface ReportReview {
  status: ReportStatus;
  supervisorComments?: string;
}

export interface AttendanceRequest {
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface PerformanceComment {
  internshipId: number;
  comments: string;
}

export interface InternshipValidation {
  internshipId: number;
  isValid: boolean;
  comments?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
