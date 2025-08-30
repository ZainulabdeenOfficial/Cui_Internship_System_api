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

        if(await _userManager.FindByEmailAsync("zu4425@gmail.com") == null)
        {
            var admin = new ApplicationUser { UserName = "zu4425@gmail.com", Email = "zu4425@gmail.com", FullName = "Super Admin" };
            var create = await _userManager.CreateAsync(admin, "@17Dec2003");
            if(create.Succeeded)
                await _userManager.AddToRoleAsync(admin, Roles.Admin);
            else
                return BadRequest(create.Errors);
        }
        return Ok("Seed complete");
    }
}
