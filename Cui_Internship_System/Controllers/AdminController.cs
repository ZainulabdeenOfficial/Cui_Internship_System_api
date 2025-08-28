using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cui_Internship_System.Data;
using Cui_Internship_System.DTOs;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Identity;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles="Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    public AdminController(AppDbContext db, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager) { _db = db; _userManager = userManager; _roleManager = roleManager; }

    // Companies
    [HttpGet("companies/pending")] public async Task<IActionResult> PendingCompanies() => Ok(await _db.Companies.Where(c => !c.IsApproved).Select(c=> new { c.Id, c.Name, c.Address }).ToListAsync());

    [HttpPut("companies/{id}/approve")] // approve / reject
    public async Task<IActionResult> ApproveCompany(int id, ApprovalDto dto)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return NotFound();
        company.IsApproved = dto.Approve;
        await _db.SaveChangesAsync();
        return Ok(new { company.Id, company.IsApproved });
    }

    [HttpPost("companies")]
    public async Task<IActionResult> CreateCompany(CreateCompanyDto dto)
    {
        var exists = await _db.Companies.AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower());
        if (exists) return BadRequest("Company already exists");
        var company = new Company { Name = dto.Name, Address = dto.Address, IsApproved = true }; // admin-created auto approved
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();
        return Ok(new { company.Id, company.Name, company.IsApproved });
    }

    [HttpDelete("companies/{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return NotFound();
        _db.Companies.Remove(company);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Students
    [HttpGet("students")] public async Task<IActionResult> GetStudents()
    {
        var list = await _db.Students.Include(s=> s.User).ToListAsync();
        return Ok(list.Select(s => new { s.Id, s.RegistrationNumber, Name = s.User!.FullName, Email = s.User.Email, s.IsApproved }));
    }

    [HttpPut("students/{id}/approve")] public async Task<IActionResult> ApproveStudent(int id, ApprovalDto dto)
    {
        var s = await _db.Students.FindAsync(id); if (s == null) return NotFound(); s.IsApproved = dto.Approve; await _db.SaveChangesAsync(); return Ok(new { s.Id, s.IsApproved });
    }

    [HttpPost("students")] public async Task<IActionResult> CreateStudent(CreateStudentDto dto)
    {
        if(await _userManager.FindByEmailAsync(dto.Email) != null) return BadRequest("Email already exists");
        var regUpper = dto.RegistrationNumber.ToUpperInvariant();
        if(await _db.Students.AnyAsync(s => s.RegistrationNumber.ToUpper() == regUpper)) return BadRequest("RegistrationNumber already exists");
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName, MustChangePassword = true };
        var created = await _userManager.CreateAsync(user, dto.Password);
        if(!created.Succeeded) return BadRequest(created.Errors);
        if(!await _roleManager.RoleExistsAsync("Student")) await _roleManager.CreateAsync(new IdentityRole("Student"));
        await _userManager.AddToRoleAsync(user, "Student");
        _db.Students.Add(new Student { UserId = user.Id, RegistrationNumber = regUpper, IsApproved = dto.AutoApprove });
        await _db.SaveChangesAsync();
        return Ok(new { user.Id, user.Email, regUpper });
    }

    [HttpDelete("students/{id}")] public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await _db.Students.Include(s=> s.User).FirstOrDefaultAsync(s=> s.Id == id);
        if(student == null) return NotFound();
        var user = student.User;
        _db.Students.Remove(student);
        if(user != null) await _userManager.DeleteAsync(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Company Supervisors
    [HttpGet("supervisors/company")] public async Task<IActionResult> GetCompanySupervisors()
    {
        var list = await _db.CompanySupervisors.Include(s=> s.User).Include(s=> s.Company).ToListAsync();
        return Ok(list.Select(s => new { s.Id, Name = s.User!.FullName, Email = s.User.Email, Company = s.Company!.Name, s.IsApproved }));
    }

    [HttpPut("supervisors/company/{id}/approve")] public async Task<IActionResult> ApproveCompanySupervisor(int id, ApprovalDto dto)
    {
        var sup = await _db.CompanySupervisors.FindAsync(id); if (sup == null) return NotFound(); sup.IsApproved = dto.Approve; await _db.SaveChangesAsync(); return Ok(new { sup.Id, sup.IsApproved });
    }

    [HttpDelete("supervisors/university/{id}")] public async Task<IActionResult> DeleteUniversitySupervisor(int id)
    {
        var sup = await _db.UniversitySupervisors.Include(s=> s.User).FirstOrDefaultAsync(s=> s.Id == id);
        if(sup == null) return NotFound();
        var user = sup.User;
        _db.UniversitySupervisors.Remove(sup);
        if(user != null) await _userManager.DeleteAsync(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // University Supervisors (activate/deactivate)
    [HttpGet("supervisors/university")] public async Task<IActionResult> GetUniversitySupervisors()
    {
        var list = await _db.UniversitySupervisors.Include(s=> s.User).ToListAsync();
        return Ok(list.Select(s => new { s.Id, Name = s.User!.FullName, Email = s.User.Email, s.IsActive }));
    }

    [HttpPut("supervisors/university/{id}/approve")] public async Task<IActionResult> ActivateUniversitySupervisor(int id, ApprovalDto dto)
    {
        var sup = await _db.UniversitySupervisors.FindAsync(id); if (sup == null) return NotFound(); sup.IsActive = dto.Approve; await _db.SaveChangesAsync(); return Ok(new { sup.Id, sup.IsActive });
    }

    // Creation endpoints
    [HttpPost("supervisors/company")] 
    public async Task<IActionResult> CreateCompanySupervisor(CreateCompanySupervisorDto dto)
    {
        var company = await _db.Companies.FindAsync(dto.CompanyId);
        if(company == null) return BadRequest("Company not found");
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName, MustChangePassword = true };
        var create = await _userManager.CreateAsync(user, dto.Password);
        if(!create.Succeeded) return BadRequest(create.Errors);
        if(!await _roleManager.RoleExistsAsync("CompanySupervisor")) await _roleManager.CreateAsync(new IdentityRole("CompanySupervisor"));
        await _userManager.AddToRoleAsync(user, "CompanySupervisor");
        _db.CompanySupervisors.Add(new CompanySupervisor{ UserId = user.Id, CompanyId = dto.CompanyId, IsApproved = true }); // admin-created auto-approved
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("supervisors/university")] 
    public async Task<IActionResult> CreateUniversitySupervisor(CreateUniversitySupervisorDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName, MustChangePassword = true };
        var create = await _userManager.CreateAsync(user, dto.Password);
        if(!create.Succeeded) return BadRequest(create.Errors);
        if(!await _roleManager.RoleExistsAsync("UniversitySupervisor")) await _roleManager.CreateAsync(new IdentityRole("UniversitySupervisor"));
        await _userManager.AddToRoleAsync(user, "UniversitySupervisor");
        _db.UniversitySupervisors.Add(new UniversitySupervisor{ UserId = user.Id, IsActive = true });
        await _db.SaveChangesAsync();
        return Ok();
    }

    // Reports overview (weekly + final + attendance) simplified
    [HttpGet("reports")] public async Task<IActionResult> GetReports()
    {
        var weekly = await _db.WeeklyReports.Include(r=> r.Internship)!.ThenInclude(i=> i!.Student)!.ThenInclude(s=> s!.User)
            .Select(r => new { Type = "Weekly", r.Id, r.InternshipId, r.WeekNumber, r.Status }).ToListAsync();
        var final = await _db.FinalReports.Select(r => new { Type = "Final", r.Id, r.InternshipId, Status = r.Status }).ToListAsync();
        var attendance = await _db.Attendances.GroupBy(a=> a.InternshipId).Select(g=> new { Type = "Attendance", InternshipId = g.Key, Days = g.Count() }).ToListAsync();
        return Ok(new { weekly, final, attendance });
    }

    // Issue certificate by studentId (latest internship)
    [HttpPost("certificates/{studentId}")] public async Task<IActionResult> IssueCertificate(int studentId)
    {
        var internship = await _db.Internships.Include(i=> i.Certificate).Where(i=> i.StudentId == studentId).OrderByDescending(i=> i.Id).FirstOrDefaultAsync();
        if (internship == null) return NotFound("No internship found for student");
        if (internship.Certificate != null) return BadRequest("Certificate already exists");
        var cert = new Certificate { InternshipId = internship.Id };
        _db.Certificates.Add(cert); await _db.SaveChangesAsync();
        return Ok(new { cert.Id, cert.CertificateNumber, cert.IssuedOn });
    }
}
