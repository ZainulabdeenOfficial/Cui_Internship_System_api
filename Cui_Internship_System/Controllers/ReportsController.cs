using Cui_Internship_System.Data;
using Cui_Internship_System.DTOs;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) { _db = db; }
    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("weekly")]
    [Authorize(Roles="Student")]
    public async Task<IActionResult> SubmitWeekly(WeeklyReportCreateDto dto)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.UserId == UserId);
        if (student == null) return BadRequest("Student profile missing");
        if(!student.IsApproved) return Forbid();
        var internship = await _db.Internships.FirstOrDefaultAsync(i => i.Id == dto.InternshipId && i.StudentId == student.Id);
        if (internship == null) return NotFound("Internship not found");
        if(await _db.WeeklyReports.AnyAsync(r=> r.InternshipId == internship.Id && r.WeekNumber == dto.WeekNumber))
            return BadRequest("Weekly report already submitted for this week");
        var report = new WeeklyReport { InternshipId = internship.Id, WeekNumber = dto.WeekNumber, Content = dto.Content };
        _db.WeeklyReports.Add(report);
        await _db.SaveChangesAsync();
        return Ok(report.Id);
    }

    [HttpPost("weekly/{id}/review")]
    [Authorize(Roles="UniversitySupervisor,CompanySupervisor")]
    public async Task<IActionResult> ReviewWeekly(int id, WeeklyReportReviewDto dto)
    {
        var report = await _db.WeeklyReports.Include(r=> r.Internship).FirstOrDefaultAsync(r=> r.Id == id);
        if (report == null) return NotFound();
        // Optionally verify reviewer is assigned supervisor
        report.Status = dto.Status;
        report.SupervisorComments = dto.Comments;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("final")]
    [Authorize(Roles="Student")]
    public async Task<IActionResult> SubmitFinal(FinalReportCreateDto dto)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.UserId == UserId);
        if (student == null) return BadRequest("Student profile missing");
        if(!student.IsApproved) return Forbid();
        var internship = await _db.Internships.Include(i=> i.FinalReport).FirstOrDefaultAsync(i => i.Id == dto.InternshipId && i.StudentId == student.Id);
        if (internship == null) return NotFound("Internship not found");
        if (internship.FinalReport != null) return BadRequest("Final report already exists");
        var fr = new FinalReport { InternshipId = internship.Id, Content = dto.Content };
        _db.FinalReports.Add(fr);
        await _db.SaveChangesAsync();
        return Ok(fr.Id);
    }

    [HttpPost("final/{id}/review")]
    [Authorize(Roles="UniversitySupervisor")]
    public async Task<IActionResult> ReviewFinal(int id, FinalReportReviewDto dto)
    {
        var fr = await _db.FinalReports.Include(r=> r.Internship).FirstOrDefaultAsync(r=> r.Id == id);
        if (fr == null) return NotFound();
        fr.Status = dto.Status;
        fr.SupervisorComments = dto.Comments;
        await _db.SaveChangesAsync();
        return Ok();
    }
}
