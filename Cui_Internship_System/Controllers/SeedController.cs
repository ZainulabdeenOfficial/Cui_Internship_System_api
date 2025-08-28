using Cui_Internship_System.Constants;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    public SeedController(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager){ _roleManager = roleManager; _userManager = userManager; }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Seed()
    {
        var roles = new [] { Roles.Admin, Roles.Student, Roles.CompanySupervisor, Roles.UniversitySupervisor };
        foreach(var r in roles)
            if(!await _roleManager.RoleExistsAsync(r))
                await _roleManager.CreateAsync(new IdentityRole(r));

        if(await _userManager.FindByEmailAsync("admin@local") == null)
        {
            var admin = new ApplicationUser { UserName = "admin@local", Email = "admin@local", FullName = "System Admin" };
            await _userManager.CreateAsync(admin, "Admin@123");
            await _userManager.AddToRoleAsync(admin, Roles.Admin);
        }
        return Ok("Seed complete");
    }
}
