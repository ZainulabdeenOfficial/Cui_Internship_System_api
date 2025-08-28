namespace Cui_Internship_System.Models;

public enum InternshipStatus { Pending, Active, Completed, Rejected }
public enum ReportStatus { Submitted, Reviewed, Approved, Rejected }

public class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class ApplicationUser : Microsoft.AspNetCore.Identity.IdentityUser
{
    public string? FullName { get; set; }
    // Indicates whether user must change password on first login (for admin-created accounts)
    public bool MustChangePassword { get; set; }
}

public class Student : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public bool IsApproved { get; set; } // Admin approval required
    public ICollection<Internship> Internships { get; set; } = new List<Internship>();
}

public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public ICollection<Internship> Internships { get; set; } = new List<Internship>();
}

public class CompanySupervisor : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public int CompanyId { get; set; }
    public Company? Company { get; set; }
    public bool IsApproved { get; set; } // Admin approval required
    public ICollection<Internship> Internships { get; set; } = new List<Internship>();
}

public class UniversitySupervisor : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }
    public bool IsActive { get; set; } = true; // Admin can activate/deactivate
    public ICollection<Internship> Internships { get; set; } = new List<Internship>();
}

public class Internship : BaseEntity
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int CompanyId { get; set; }
    public Company? Company { get; set; }
    public int? CompanySupervisorId { get; set; }
    public CompanySupervisor? CompanySupervisor { get; set; }
    public int? UniversitySupervisorId { get; set; }
    public UniversitySupervisor? UniversitySupervisor { get; set; }
    public InternshipStatus Status { get; set; } = InternshipStatus.Pending;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<WeeklyReport> WeeklyReports { get; set; } = new List<WeeklyReport>();
    public FinalReport? FinalReport { get; set; }
    public OfferLetter? OfferLetter { get; set; }
    public Certificate? Certificate { get; set; }
}

public class Attendance : BaseEntity
{
    public int InternshipId { get; set; }
    public Internship? Internship { get; set; }
    public DateTime Date { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public string? Notes { get; set; }
    public string Remarks { get; set; } = string.Empty;
}

public class WeeklyReport : BaseEntity
{
    public int InternshipId { get; set; }
    public Internship? Internship { get; set; }
    public int WeekNumber { get; set; }
    public string Content { get; set; } = string.Empty;
    public ReportStatus Status { get; set; } = ReportStatus.Submitted;
    public string? SupervisorComments { get; set; }
}

public class FinalReport : BaseEntity
{
    public int InternshipId { get; set; }
    public Internship? Internship { get; set; }
    public string Content { get; set; } = string.Empty;
    public ReportStatus Status { get; set; } = ReportStatus.Submitted;
    public string? SupervisorComments { get; set; }
}

public class Certificate : BaseEntity
{
    public int InternshipId { get; set; }
    public Internship? Internship { get; set; }
    public string CertificateNumber { get; set; } = Guid.NewGuid().ToString();
    public DateTime IssuedOn { get; set; } = DateTime.UtcNow;
}

public class OfferLetter : BaseEntity
{
    public int InternshipId { get; set; }
    public Internship? Internship { get; set; }
    public string FileUrl { get; set; } = string.Empty;
}
