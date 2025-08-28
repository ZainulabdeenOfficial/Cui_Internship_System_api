using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Cui_Internship_System.Models;
using Cui_Internship_System.DTOs;
using Cui_Internship_System.Services;
using Cui_Internship_System.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtTokenService _jwt;
    private readonly AppDbContext _db;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, RoleManager<IdentityRole> roleManager, IJwtTokenService jwt, AppDbContext db)
    {
        _userManager = userManager; _signInManager = signInManager; _roleManager = roleManager; _jwt = jwt; _db = db;
    }

    [HttpPost("register")] 
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if(!await _roleManager.RoleExistsAsync(dto.Role))
            await _roleManager.CreateAsync(new IdentityRole(dto.Role));

        var isEmail = !string.IsNullOrWhiteSpace(dto.Email) && dto.Email.Contains('@');
        var userName = isEmail ? dto.Email : dto.Email;
        var emailValue = isEmail ? dto.Email : null;

        if(dto.Role == "Student")
        {
            if(string.IsNullOrWhiteSpace(dto.RegistrationNumber))
                return BadRequest("RegistrationNumber required for Student");
            var pattern = "^[A-Z]{2}[0-9]{2}-[A-Z]{3,}-[0-9]{3}$"; // e.g., FA22-BCS-090
            if(!Regex.IsMatch(dto.RegistrationNumber, pattern, RegexOptions.IgnoreCase))
                return BadRequest("RegistrationNumber format invalid (e.g., FA22-BCS-090)");
            if(await _db.Students.AnyAsync(s => s.RegistrationNumber == dto.RegistrationNumber))
                return BadRequest("RegistrationNumber already exists");
        }

        var user = new ApplicationUser { UserName = userName, Email = emailValue, FullName = dto.FullName, MustChangePassword = false };
        // Self-registered company supervisors & students need approval so must change password not required until admin-created
        if(dto.Role == "CompanySupervisor") user.MustChangePassword = false;

        var result = await _userManager.CreateAsync(user, dto.Password);
        if(!result.Succeeded) return BadRequest(result.Errors);
        await _userManager.AddToRoleAsync(user, dto.Role);

        if(dto.Role == "Student")
        {
            _db.Students.Add(new Student{ UserId = user.Id, RegistrationNumber = dto.RegistrationNumber!.ToUpperInvariant(), IsApproved = false });
        }
        else if(dto.Role == "CompanySupervisor")
        {
            _db.CompanySupervisors.Add(new CompanySupervisor{ UserId = user.Id, IsApproved = false, CompanyId = 0 }); // company assignment later
        }
        else if(dto.Role == "UniversitySupervisor")
        {
            _db.UniversitySupervisors.Add(new UniversitySupervisor{ UserId = user.Id, IsActive = true });
        }
        await _db.SaveChangesAsync();

        var roles = await _userManager.GetRolesAsync(user);
        var (token, exp) = _jwt.Generate(user, roles);
        return Ok(new AuthResponse(token, exp, user.Email ?? user.UserName ?? "", roles.First()));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        ApplicationUser? user = null;
        if(!string.IsNullOrWhiteSpace(dto.Email))
        {
            if(dto.Email.Contains('@')) user = await _userManager.FindByEmailAsync(dto.Email);
            if(user == null) user = await _userManager.FindByNameAsync(dto.Email);
        }
        if(user == null) return Unauthorized();

        // Enforce approval / activation
        var roles = await _userManager.GetRolesAsync(user);
        var student = await _db.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if(student != null && !student.IsApproved) return Forbid();
        var compSup = await _db.CompanySupervisors.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if(compSup != null && !compSup.IsApproved) return Forbid();
        var uniSup = await _db.UniversitySupervisors.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if(uniSup != null && !uniSup.IsActive) return Forbid();

        var pw = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if(!pw.Succeeded) return Unauthorized();
        var (token, exp) = _jwt.Generate(user, roles);
        return Ok(new AuthResponse(token, exp, user.Email ?? user.UserName ?? "", roles.FirstOrDefault() ?? ""));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded) return BadRequest(result.Errors);

        // If this was the first login and password change was required, clear the flag
        if (user.MustChangePassword)
        {
            user.MustChangePassword = false;
            await _userManager.UpdateAsync(user);
        }

        return Ok(new { message = "Password changed successfully" });
    }
}
