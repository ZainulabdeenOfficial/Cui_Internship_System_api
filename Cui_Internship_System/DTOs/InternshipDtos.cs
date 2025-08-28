using Cui_Internship_System.Models;

namespace Cui_Internship_System.DTOs;

// Company DTOs
public record CreateCompanyDto(string Name, string Address, string? Notes = null, string? Phone = null, string? Email = null, string? Description = null);
public record CompanyDto(int Id, string Name, string Address, bool IsApproved, string? Phone, string? Email, string? Description);
public record ApprovedCompanyDto(int Id, string Name);
public record CompanyRequestDto(string Name, string Address, string? Phone = null, string? Email = null, string? Description = null);

// Internship DTOs
public record InternshipRequestDto(int CompanyId, int? CompanySupervisorId, int? UniversitySupervisorId, DateTime? StartDate, DateTime? EndDate);
public record InternshipDto(int Id, int StudentId, int CompanyId, InternshipStatus Status, DateTime? StartDate, DateTime? EndDate);
public record InternshipUpdateDto(InternshipStatus Status, DateTime? StartDate, DateTime? EndDate);
public record InternshipValidationDto(int InternshipId, bool IsValid, string? Comments);

// Simplified Weekly & Final report submission DTOs (used by StudentsController & legacy controllers)
public record WeeklyReportDto(int WeekNumber, string Content);
public record FinalReportDto(string Content);
public record ReportReviewDto(ReportStatus Status, string? SupervisorComments);

// Detailed Weekly / Final report DTOs (used by ReportsController new endpoints)
public record WeeklyReportCreateDto(int InternshipId, int WeekNumber, string Content);
public record WeeklyReportReviewDto(string? Comments, ReportStatus Status);
public record FinalReportCreateDto(int InternshipId, string Content);
public record FinalReportReviewDto(string? Comments, ReportStatus Status);

// Attendance DTOs
public record AttendanceDto(DateTime Date, string? CheckInTime, string? CheckOutTime, string? Notes);
public record AttendanceMarkDto(int InternshipId, DateTime Date, string? Remarks, string? CheckInTime = null, string? CheckOutTime = null, string? Notes = null);
public record AttendanceUpdateDto(string? CheckInTime, string? CheckOutTime, string? Notes);

// Performance / comments
public record PerformanceCommentDto(int InternshipId, string Comments);

// Grade DTOs
public record GradeDto(int InternshipId, string Component, decimal Score, decimal MaxScore, string? Comments, string GradedBy);
public record GradeCreateDto(string Component, decimal Score, decimal MaxScore = 100, string? Comments = null);
public record GradeUpdateDto(decimal Score, decimal MaxScore = 100, string? Comments = null);
