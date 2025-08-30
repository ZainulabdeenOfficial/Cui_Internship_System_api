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
        if(string.IsNullOrWhiteSpace(dto.Email)) return BadRequest("Email required");
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if(existingUser != null) return BadRequest("Email already exists");

        if(!await _roleManager.RoleExistsAsync(dto.Role))
            await _roleManager.CreateAsync(new IdentityRole(dto.Role));

        if(dto.Role == "Student")
        {
            if(string.IsNullOrWhiteSpace(dto.RegistrationNumber))
                return BadRequest("RegistrationNumber required for Student");
            var pattern = "^[A-Z]{2}[0-9]{2}-[A-Z]{3,}-[0-9]{3}$"; // FA22-BCS-090
            if(!Regex.IsMatch(dto.RegistrationNumber, pattern, RegexOptions.IgnoreCase))
                return BadRequest("RegistrationNumber format invalid (e.g., FA22-BCS-090)");
            var regUpper = dto.RegistrationNumber.ToUpperInvariant();
            if(await _db.Students.AnyAsync(s => s.RegistrationNumber.ToUpper() == regUpper))
                return BadRequest("RegistrationNumber already exists");
        }

        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName, MustChangePassword = false };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if(!result.Succeeded) return BadRequest(result.Errors);
        await _userManager.AddToRoleAsync(user, dto.Role);

        if(dto.Role == "Student")
        {
            var student = new Student { UserId = user.Id, RegistrationNumber = dto.RegistrationNumber!, IsApproved = false };
            _db.Students.Add(student);
            await _db.SaveChangesAsync();
        }

        return Ok("Registered");
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginDto dto)
    {
        if(string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email and password required");
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized("Invalid credentials");
        var pwdValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!pwdValid)
            return Unauthorized("Invalid credentials");
        var roles = await _userManager.GetRolesAsync(user);
        var (token, expires) = _jwt.Generate(user, roles);
        return Ok(new AuthResponse(token, expires, user.Email!, roles.FirstOrDefault() ?? ""));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok("Password changed");
    }
}
