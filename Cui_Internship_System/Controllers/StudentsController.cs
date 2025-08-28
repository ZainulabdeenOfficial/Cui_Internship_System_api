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
[Authorize(Roles="Student")] 
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StudentsController(AppDbContext db) { _db = db; }

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> GetAll()
    {
        var students = await _db.Students
            .Include(s => s.User)
            .Select(s => new
            {
                s.Id,
                s.RegistrationNumber,
                Name = s.User!.FullName,
                Email = s.User.Email,
                s.IsApproved
            })
            .ToListAsync();
        
        return Ok(students);
    }

    [HttpGet("me/internships")]
    public async Task<IActionResult> MyInternships()
    {
        var student = await _db.Students.Include(s => s.Internships).ThenInclude(i=> i.Company)
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        if(student == null) return NotFound();
        return Ok(student.Internships.Select(i => new { i.Id, Company = i.Company!.Name, i.Status, i.StartDate, i.EndDate }));
    }

    [HttpGet("attendance/{internshipId}")]
    public async Task<IActionResult> GetAttendance(int internshipId)
    {
        var student = await _db.Students
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        
        if (student == null) return NotFound();

        var internship = student.Internships.FirstOrDefault(i => i.Id == internshipId);
        if (internship == null) return NotFound("Internship not found");

        var attendance = await _db.Attendances
            .Where(a => a.InternshipId == internshipId)
            .OrderByDescending(a => a.Date)
            .Select(a => new
            {
                a.Id,
                a.Date,
                a.CheckInTime,
                a.CheckOutTime,
                a.Notes,
                Status = !string.IsNullOrEmpty(a.CheckInTime) && !string.IsNullOrEmpty(a.CheckOutTime) ? "Complete" :
                        !string.IsNullOrEmpty(a.CheckInTime) ? "Checked In" : "Absent"
            })
            .ToListAsync();

        return Ok(attendance);
    }

    [HttpGet("certificate/{internshipId}")]
    public async Task<IActionResult> GetCertificate(int internshipId)
    {
        var student = await _db.Students
            .Include(s => s.Internships)
            .ThenInclude(i => i.Certificate)
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        
        if (student == null) return NotFound();

        var internship = student.Internships.FirstOrDefault(i => i.Id == internshipId);
        if (internship == null) return NotFound("Internship not found");

        if (internship.Certificate == null) return NotFound("Certificate not found");

        return Ok(internship.Certificate);
    }

    [HttpPost("companies")]
    public async Task<IActionResult> SubmitCompanyRequest(CompanyRequestDto dto)
    {
        var student = await _db.Students
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        
        if (student == null) return NotFound();

        // Check if company already exists
        var existingCompany = await _db.Companies
            .FirstOrDefaultAsync(c => c.Name.ToLower() == dto.Name.ToLower());
        
        if (existingCompany != null) return BadRequest("Company already exists");

        var company = new Company
        {
            Name = dto.Name,
            Address = dto.Address,
            IsApproved = false // Requires admin approval
        };

        _db.Companies.Add(company);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Company request submitted successfully. Please wait for admin approval.", companyId = company.Id });
    }

    [HttpPost("reports/weekly")]
    public async Task<IActionResult> SubmitWeeklyReport(WeeklyReportDto dto)
    {
        var student = await _db.Students
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        
        if (student == null) return NotFound();

        var activeInternship = student.Internships
            .FirstOrDefault(i => i.Status == InternshipStatus.Active);
        
        if (activeInternship == null) return BadRequest("No active internship found");

        // Check if weekly report already exists for this week
        var existingReport = await _db.WeeklyReports
            .FirstOrDefaultAsync(r => r.InternshipId == activeInternship.Id && r.WeekNumber == dto.WeekNumber);
        
        if (existingReport != null) return BadRequest($"Weekly report for week {dto.WeekNumber} already exists");

        var report = new WeeklyReport
        {
            InternshipId = activeInternship.Id,
            WeekNumber = dto.WeekNumber,
            Content = dto.Content,
            Status = ReportStatus.Submitted
        };

        _db.WeeklyReports.Add(report);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Weekly report submitted successfully", reportId = report.Id });
    }

    [HttpPost("reports/final")]
    public async Task<IActionResult> SubmitFinalReport(FinalReportDto dto)
    {
        var student = await _db.Students
            .Include(s => s.Internships)
            .ThenInclude(i => i.FinalReport)
            .FirstOrDefaultAsync(s => s.UserId == CurrentUserId);
        
        if (student == null) return NotFound();

        var activeInternship = student.Internships
            .FirstOrDefault(i => i.Status == InternshipStatus.Active);
        
        if (activeInternship == null) return BadRequest("No active internship found");

        if (activeInternship.FinalReport != null) return BadRequest("Final report already submitted");

        var report = new FinalReport
        {
            InternshipId = activeInternship.Id,
            Content = dto.Content,
            Status = ReportStatus.Submitted
        };

        _db.FinalReports.Add(report);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Final report submitted successfully", reportId = report.Id });
    }
}
