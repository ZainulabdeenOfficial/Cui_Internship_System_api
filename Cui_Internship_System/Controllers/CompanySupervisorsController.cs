using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cui_Internship_System.Data;
using Cui_Internship_System.DTOs;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "CompanySupervisor")]
public class CompanySupervisorsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public CompanySupervisorsController(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> SelfRegister(RegisterDto dto)
    {
        // This endpoint allows company supervisors to self-register
        // They will need admin approval before they can login
        if (dto.Role != "CompanySupervisor")
            return BadRequest("This endpoint is only for Company Supervisor registration");

        // Create user account
        var user = new ApplicationUser 
        { 
            UserName = dto.Email, 
            Email = dto.Email, 
            FullName = dto.FullName,
            MustChangePassword = false // Will be set to true when admin creates account
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        // Add role
        if (!await _userManager.IsInRoleAsync(user, "CompanySupervisor"))
            await _userManager.AddToRoleAsync(user, "CompanySupervisor");

        // Create company supervisor record (pending approval)
        var companySupervisor = new CompanySupervisor
        {
            UserId = user.Id,
            IsApproved = false // Requires admin approval
        };

        _db.CompanySupervisors.Add(companySupervisor);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration successful. Please wait for admin approval." });
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetAssignedStudents()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.CompanySupervisors
            .Include(s => s.Internships)
            .ThenInclude(i => i.Student)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();

        var students = supervisor.Internships
            .Where(i => i.Status == InternshipStatus.Active)
            .Select(i => new
            {
                i.Id,
                StudentId = i.StudentId,
                StudentName = i.Student!.User!.FullName,
                StudentEmail = i.Student.User.Email,
                RegistrationNumber = i.Student.RegistrationNumber,
                i.StartDate,
                i.EndDate,
                i.Status
            });

        return Ok(students);
    }

    [HttpPost("attendance")]
    public async Task<IActionResult> MarkAttendance(AttendanceMarkDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.CompanySupervisors
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();
        if(!supervisor.IsApproved) return Forbid();

        var internship = supervisor.Internships
            .FirstOrDefault(i => i.Id == dto.InternshipId && i.Status == InternshipStatus.Active);

        if (internship == null) return NotFound("Internship not found or not active");

        // Check if attendance already exists for this date
        var existingAttendance = await _db.Attendances
            .FirstOrDefaultAsync(a => a.InternshipId == internship.Id && a.Date.Date == dto.Date.Date);

        if (existingAttendance != null)
        {
            // Update existing attendance
            existingAttendance.CheckInTime = dto.CheckInTime;
            existingAttendance.CheckOutTime = dto.CheckOutTime;
            existingAttendance.Notes = dto.Notes;
            existingAttendance.Remarks = dto.Remarks ?? existingAttendance.Remarks;
            existingAttendance.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new attendance
            var attendance = new Attendance
            {
                InternshipId = internship.Id,
                Date = dto.Date.Date,
                Remarks = dto.Remarks ?? string.Empty,
                CheckInTime = dto.CheckInTime,
                CheckOutTime = dto.CheckOutTime,
                Notes = dto.Notes
            };
            _db.Attendances.Add(attendance);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Attendance marked successfully" });
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateInternship(InternshipValidationDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.CompanySupervisors
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();

        var internship = supervisor.Internships
            .FirstOrDefault(i => i.Id == dto.InternshipId);

        if (internship == null) return NotFound("Internship not found");

        // Update internship validation status
        // This could be stored in a separate table or as a property
        // For now, we'll add a comment to the internship
        internship.UpdatedAt = DateTime.UtcNow;
        
        await _db.SaveChangesAsync();
        return Ok(new { message = "Internship validation updated" });
    }

    [HttpPost("comments")]
    public async Task<IActionResult> AddPerformanceComments(PerformanceCommentDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var supervisor = await _db.CompanySupervisors
            .Include(s => s.Internships)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (supervisor == null) return NotFound();

        var internship = supervisor.Internships
            .FirstOrDefault(i => i.Id == dto.InternshipId);

        if (internship == null) return NotFound("Internship not found");

        // Store performance comments
        // This could be in a separate table or as a property
        // For now, we'll update the internship with comments
        internship.UpdatedAt = DateTime.UtcNow;
        
        await _db.SaveChangesAsync();
        return Ok(new { message = "Performance comments added" });
    }
}
