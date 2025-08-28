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
public class InternshipsController : ControllerBase
{
    private readonly AppDbContext _db;
    public InternshipsController(AppDbContext db) { _db = db; }
    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost]
    [Authorize(Roles="Student")]
    public async Task<ActionResult<InternshipDto>> RequestInternship(InternshipRequestDto dto)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.UserId == UserId);
        if (student == null) return BadRequest("Student profile missing");
        if(!student.IsApproved) return Forbid();
        var company = await _db.Companies.FindAsync(dto.CompanyId);
        if (company == null) return NotFound("Company not found");
        if (!company.IsApproved) return BadRequest("Company not approved yet");
        var internship = new Internship
        {
            StudentId = student.Id,
            CompanyId = dto.CompanyId,
            CompanySupervisorId = dto.CompanySupervisorId,
            UniversitySupervisorId = dto.UniversitySupervisorId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = InternshipStatus.Pending
        };
        _db.Internships.Add(internship);
        await _db.SaveChangesAsync();
        return new InternshipDto(internship.Id, internship.StudentId, internship.CompanyId, internship.Status, internship.StartDate, internship.EndDate);
    }

    [HttpPost("{id}/activate")]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> Activate(int id)
    {
        var i = await _db.Internships.FindAsync(id);
        if (i == null) return NotFound();
        i.Status = InternshipStatus.Active;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{id}/complete")]
    [Authorize(Roles="Admin,UniversitySupervisor")]
    public async Task<IActionResult> Complete(int id)
    {
        var i = await _db.Internships.FindAsync(id);
        if (i == null) return NotFound();
        i.Status = InternshipStatus.Completed;
        await _db.SaveChangesAsync();
        return Ok();
    }
}
