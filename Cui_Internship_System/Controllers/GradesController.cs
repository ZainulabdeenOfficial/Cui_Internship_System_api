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
public class GradesController : ControllerBase
{
    private readonly AppDbContext _db;
    public GradesController(AppDbContext db){ _db = db; }
    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // Create grade (for supervisors and admins)
    [HttpPost]
    [Authorize(Roles="UniversitySupervisor,CompanySupervisor,Admin")]
    public async Task<IActionResult> Create(CreateGradeDto dto)
    {
        var internship = await _db.Internships.Include(i=> i.Student).FirstOrDefaultAsync(i=> i.Id == dto.InternshipId);
        if(internship == null) return NotFound("Internship not found");
        var role = User.IsInRole("UniversitySupervisor") ? "UniversitySupervisor" : User.IsInRole("CompanySupervisor") ? "CompanySupervisor" : "Admin";
        var grade = new Grade { InternshipId = internship.Id, Component = dto.Component, Score = dto.Score, MaxScore = dto.MaxScore, Comments = dto.Comments, GradedBy = role };
        _db.Grades.Add(grade);
        await _db.SaveChangesAsync();
        return Ok(new { grade.Id });
    }

    // Update grade (for supervisors and admins)
    [HttpPut("{id}")]
    [Authorize(Roles="UniversitySupervisor,CompanySupervisor,Admin")]
    public async Task<IActionResult> Update(int id, UpdateGradeDto dto)
    {
        var grade = await _db.Grades.FindAsync(id);
        if(grade == null) return NotFound();
        grade.Score = dto.Score;
        grade.MaxScore = dto.MaxScore;
        grade.Comments = dto.Comments;
        grade.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // Get grades for a specific internship (for students)
    [HttpGet("internship/{internshipId}")]
    [Authorize]
    public async Task<IActionResult> GetForInternship(int internshipId)
    {
        var internship = await _db.Internships.Include(i=> i.Student).FirstOrDefaultAsync(i=> i.Id == internshipId);
        if(internship == null) return NotFound();
        if(User.IsInRole("Student"))
        {
            var student = await _db.Students.FirstOrDefaultAsync(s=> s.UserId == UserId);
            if(student == null || internship.StudentId != student.Id) return Forbid();
        }
        var list = await _db.Grades.Where(g=> g.InternshipId == internshipId).OrderBy(g=> g.Component).ToListAsync();
        return Ok(list.Select(g=> new { g.Id, g.Component, g.Score, g.MaxScore, g.Comments, g.GradedBy }));
    }
}
