using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cui_Internship_System.Data;
using Cui_Internship_System.DTOs;
using Cui_Internship_System.Models;
using System.Security.Claims;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradesController : ControllerBase
{
    private readonly AppDbContext _db;
    public GradesController(AppDbContext db) { _db = db; }

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // Get grades for a specific internship (for students)
    [HttpGet("internship/{internshipId}")]
    public async Task<IActionResult> GetGradesForInternship(int internshipId)
    {
        var grades = await _db.Grades
            .Where(g => g.InternshipId == internshipId)
            .OrderBy(g => g.Component)
            .Select(g => new
            {
                g.Id,
                g.Component,
                g.Score,
                g.MaxScore,
                g.Comments,
                g.GradedBy,
                g.CreatedAt,
                Percentage = Math.Round((g.Score / g.MaxScore) * 100, 2)
            })
            .ToListAsync();

        return Ok(grades);
    }

    // Get grades for current student (all internships)
    [HttpGet("student/my-grades")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyGrades()
    {
        var student = await _db.Students
            .Include(s => s.Internships)
            .ThenInclude(i => i.Grades)
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);

        if (student == null) return NotFound();

        var result = student.Internships.Select(internship => new
        {
            InternshipId = internship.Id,
            CompanyName = internship.Company?.Name,
            Status = internship.Status,
            Grades = internship.Grades.Select(g => new
            {
                g.Id,
                g.Component,
                g.Score,
                g.MaxScore,
                g.Comments,
                g.GradedBy,
                g.CreatedAt,
                Percentage = Math.Round((g.Score / g.MaxScore) * 100, 2)
            }).OrderBy(g => g.Component).ToList()
        }).ToList();

        return Ok(result);
    }

    // Create grade (for supervisors and admins)
    [HttpPost("internship/{internshipId}")]
    [Authorize(Roles = "UniversitySupervisor,CompanySupervisor,Admin")]
    public async Task<IActionResult> CreateGrade(int internshipId, GradeCreateDto dto)
    {
        var internship = await _db.Internships.FindAsync(internshipId);
        if (internship == null) return NotFound("Internship not found");

        // Check if grade already exists for this component
        var existingGrade = await _db.Grades
            .FirstOrDefaultAsync(g => g.InternshipId == internshipId && g.Component == dto.Component);
        
        if (existingGrade != null) return BadRequest($"Grade for component '{dto.Component}' already exists");

        var grade = new Grade
        {
            InternshipId = internshipId,
            Component = dto.Component,
            Score = dto.Score,
            MaxScore = dto.MaxScore,
            Comments = dto.Comments,
            GradedBy = User.IsInRole("UniversitySupervisor") ? "UniversitySupervisor" : 
                      User.IsInRole("CompanySupervisor") ? "CompanySupervisor" : "Admin",
            GradedById = User.IsInRole("UniversitySupervisor") ? 
                        await GetUniversitySupervisorId() : 
                        User.IsInRole("CompanySupervisor") ? 
                        await GetCompanySupervisorId() : null
        };

        _db.Grades.Add(grade);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            grade.Id,
            grade.Component,
            grade.Score,
            grade.MaxScore,
            grade.Comments,
            grade.GradedBy,
            grade.CreatedAt,
            Percentage = Math.Round((grade.Score / grade.MaxScore) * 100, 2)
        });
    }

    // Update grade (for supervisors and admins)
    [HttpPut("{gradeId}")]
    [Authorize(Roles = "UniversitySupervisor,CompanySupervisor,Admin")]
    public async Task<IActionResult> UpdateGrade(int gradeId, GradeUpdateDto dto)
    {
        var grade = await _db.Grades.FindAsync(gradeId);
        if (grade == null) return NotFound("Grade not found");

        grade.Score = dto.Score;
        grade.MaxScore = dto.MaxScore;
        grade.Comments = dto.Comments;
        grade.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            grade.Id,
            grade.Component,
            grade.Score,
            grade.MaxScore,
            grade.Comments,
            grade.GradedBy,
            grade.CreatedAt,
            grade.UpdatedAt,
            Percentage = Math.Round((grade.Score / grade.MaxScore) * 100, 2)
        });
    }

    // Delete grade (for admins only)
    [HttpDelete("{gradeId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteGrade(int gradeId)
    {
        var grade = await _db.Grades.FindAsync(gradeId);
        if (grade == null) return NotFound("Grade not found");

        _db.Grades.Remove(grade);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Get all grades (for admins)
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllGrades()
    {
        var grades = await _db.Grades
            .Include(g => g.Internship)
            .ThenInclude(i => i.Student)
            .ThenInclude(s => s.User)
            .Include(g => g.Internship)
            .ThenInclude(i => i.Company)
            .OrderByDescending(g => g.CreatedAt)
            .Select(g => new
            {
                g.Id,
                g.Component,
                g.Score,
                g.MaxScore,
                g.Comments,
                g.GradedBy,
                g.CreatedAt,
                g.UpdatedAt,
                Percentage = Math.Round((g.Score / g.MaxScore) * 100, 2),
                StudentName = g.Internship.Student.User.FullName,
                StudentRegistration = g.Internship.Student.RegistrationNumber,
                CompanyName = g.Internship.Company.Name,
                InternshipId = g.InternshipId
            })
            .ToListAsync();

        return Ok(grades);
    }

    private async Task<int?> GetUniversitySupervisorId()
    {
        var supervisor = await _db.UniversitySupervisors
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        return supervisor?.Id;
    }

    private async Task<int?> GetCompanySupervisorId()
    {
        var supervisor = await _db.CompanySupervisors
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        return supervisor?.Id;
    }
}
