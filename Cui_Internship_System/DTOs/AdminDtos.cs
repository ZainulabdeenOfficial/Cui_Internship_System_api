namespace Cui_Internship_System.DTOs;

public record ApprovalDto(bool Approve, string? Comments = null);
public record CreateCompanySupervisorDto(string FullName, string Email, string Password, int CompanyId);
public record CreateUniversitySupervisorDto(string FullName, string Email, string Password);
public record SupervisorAssignmentDto(int InternshipId, int? CompanySupervisorId, int? UniversitySupervisorId);
public record CertificateGenerationDto(int StudentId, string CertificateNumber);
public record CreateStudentDto(string FullName, string Email, string Password, string RegistrationNumber, bool AutoApprove = true);
