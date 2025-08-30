using Microsoft.EntityFrameworkCore;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace Cui_Internship_System.Data;

// Unified application DbContext: Identity + domain entities
public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanySupervisor> CompanySupervisors => Set<CompanySupervisor>();
    public DbSet<UniversitySupervisor> UniversitySupervisors => Set<UniversitySupervisor>();
    public DbSet<Internship> Internships => Set<Internship>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<WeeklyReport> WeeklyReports => Set<WeeklyReport>();
    public DbSet<FinalReport> FinalReports => Set<FinalReport>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<OfferLetter> OfferLetters => Set<OfferLetter>();
    public DbSet<Grade> Grades => Set<Grade>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // includes Identity schema

        // Domain relationships
        builder.Entity<Internship>()
            .HasOne(i => i.Student)
            .WithMany(s => s.Internships)
            .HasForeignKey(i => i.StudentId);

        builder.Entity<Internship>()
            .HasOne(i => i.Company)
            .WithMany(c => c.Internships)
            .HasForeignKey(i => i.CompanyId);

        builder.Entity<Internship>()
            .HasOne(i => i.CompanySupervisor)
            .WithMany(s => s.Internships)
            .HasForeignKey(i => i.CompanySupervisorId);

        builder.Entity<Internship>()
            .HasOne(i => i.UniversitySupervisor)
            .WithMany(s => s.Internships)
            .HasForeignKey(i => i.UniversitySupervisorId);

        builder.Entity<Attendance>()
            .HasIndex(a => new { a.InternshipId, a.Date })
            .IsUnique();

        builder.Entity<Grade>()
            .HasOne(g => g.Internship)
            .WithMany(i => i.Grades)
            .HasForeignKey(g => g.InternshipId);

        builder.Entity<Grade>()
            .Property(g => g.Score)
            .HasPrecision(18, 2);
        builder.Entity<Grade>()
            .Property(g => g.MaxScore)
            .HasPrecision(18, 2);
    }
}
