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
[Authorize(Roles = "UniversitySupervisor")]
public class UniversitySupervisorsController : ControllerBase
{
    private readonly AppDbContext _db;

    public UniversitySupervisorsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetAssignedStudents()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.UniversitySupervisors
            .Include(s => s.Internships)
            .ThenInclude(i => i.Student)
            .ThenInclude(s => s.User)
            .Include(s => s.Internships)
            .ThenInclude(i => i.Company)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();

        var students = supervisor.Internships
            .Select(i => new
            {
                i.Id,
                StudentId = i.StudentId,
                StudentName = i.Student!.User!.FullName,
                StudentEmail = i.Student.User.Email,
                RegistrationNumber = i.Student.RegistrationNumber,
                CompanyName = i.Company!.Name,
                i.StartDate,
                i.EndDate,
                i.Status,
                WeeklyReportsCount = i.WeeklyReports.Count,
                HasFinalReport = i.FinalReport != null,
                FinalReportStatus = i.FinalReport?.Status
            });

        return Ok(students);
    }

    [HttpGet("reports/weekly/{internshipId}")]
    public async Task<IActionResult> GetWeeklyReports(int internshipId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.UniversitySupervisors
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();

        var internship = supervisor.Internships
            .FirstOrDefault(i => i.Id == internshipId);

        if (internship == null) return NotFound("Internship not found");

        var reports = await _db.WeeklyReports
            .Where(r => r.InternshipId == internshipId)
            .OrderBy(r => r.WeekNumber)
            .Select(r => new
            {
                r.Id,
                r.WeekNumber,
                r.Content,
                r.Status,
                r.SupervisorComments,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(reports);
    }

    [HttpPut("reports/weekly/{reportId}")]
    public async Task<IActionResult> ReviewWeeklyReport(int reportId, ReportReviewDto dto)
    {
        var report = await _db.WeeklyReports.FirstOrDefaultAsync(r => r.Id == reportId);
        if (report == null) return NotFound();
        report.Status = dto.Status;
        report.SupervisorComments = dto.SupervisorComments;
        report.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Weekly report reviewed" });
    }

    [HttpGet("reports/final/{internshipId}")]
    public async Task<IActionResult> GetFinalReport(int internshipId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.UniversitySupervisors
            .Include(s => s.Internships)
            .ThenInclude(i => i.FinalReport)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();

        var internship = supervisor.Internships
            .FirstOrDefault(i => i.Id == internshipId);

        if (internship == null) return NotFound("Internship not found");
        if (internship.FinalReport == null) return NotFound("Final report not submitted");

        return Ok(new
        {
            internship.FinalReport.Id,
            internship.FinalReport.Content,
            internship.FinalReport.Status,
            internship.FinalReport.SupervisorComments,
            internship.FinalReport.CreatedAt
        });
    }

    [HttpPut("reports/final/{reportId}")]
    public async Task<IActionResult> ApproveFinalReport(int reportId, ReportReviewDto dto)
    {
        var fr = await _db.FinalReports.FirstOrDefaultAsync(r => r.Id == reportId);
        if (fr == null) return NotFound();
        fr.Status = dto.Status;
        fr.SupervisorComments = dto.SupervisorComments;
        fr.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Final report reviewed" });
    }
}
