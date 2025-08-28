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
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _db;
    public AttendanceController(AppDbContext db) { _db = db; }
    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost]
    [Authorize(Roles="CompanySupervisor")]
    public async Task<IActionResult> Mark(AttendanceMarkDto dto)
    {
        var supervisor = await _db.CompanySupervisors.FirstOrDefaultAsync(s => s.UserId == UserId);
        if (supervisor == null) return BadRequest("Supervisor profile missing");
        if(!supervisor.IsApproved) return Forbid();
        var internship = await _db.Internships.FirstOrDefaultAsync(i => i.Id == dto.InternshipId && i.CompanySupervisorId == supervisor.Id);
        if (internship == null) return NotFound("Internship not found");
        if(await _db.Attendances.AnyAsync(a=> a.InternshipId == internship.Id && a.Date.Date == dto.Date.Date))
            return BadRequest("Attendance already marked for date");
        var att = new Attendance { InternshipId = internship.Id, Date = dto.Date.Date, Remarks = dto.Remarks ?? string.Empty };
        _db.Attendances.Add(att);
        await _db.SaveChangesAsync();
        return Ok(att.Id);
    }

    [HttpGet("internship/{internshipId}")]
    [Authorize]
    public async Task<IActionResult> GetForInternship(int internshipId)
    {
        var list = await _db.Attendances.Where(a => a.InternshipId == internshipId).OrderBy(a=> a.Date).ToListAsync();
        return Ok(list.Select(a => new { a.Id, a.Date, a.Remarks }));
    }
}
