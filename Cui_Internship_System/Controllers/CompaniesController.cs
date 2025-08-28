using Cui_Internship_System.Data;
using Cui_Internship_System.DTOs;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CompaniesController(AppDbContext db) { _db = db; }

    [HttpPost]
    [Authorize(Roles="Student,Admin")]
    public async Task<ActionResult<CompanyDto>> Create(CreateCompanyDto dto)
    {
        var exists = await _db.Companies.AnyAsync(c=> c.Name.ToLower() == dto.Name.ToLower());
        if(exists) return BadRequest("Company already exists");
        var company = new Company { Name = dto.Name, Address = dto.Address, Phone = dto.Phone, Email = dto.Email, Description = dto.Description, IsApproved = false };
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = company.Id }, new CompanyDto(company.Id, company.Name, company.Address, company.IsApproved, company.Phone, company.Email, company.Description));
    }

    [HttpGet]
    public async Task<IEnumerable<CompanyDto>> GetAll()
        => await _db.Companies.Select(c => new CompanyDto(c.Id, c.Name, c.Address, c.IsApproved, c.Phone, c.Email, c.Description)).ToListAsync();

    [HttpGet("approved")]
    [Authorize(Roles="Student,Admin,UniversitySupervisor,CompanySupervisor")]
    public async Task<IEnumerable<ApprovedCompanyDto>> GetApproved()
        => await _db.Companies.Where(c => c.IsApproved).OrderBy(c=> c.Name).Select(c => new ApprovedCompanyDto(c.Id, c.Name)).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> GetById(int id)
    {
        var c = await _db.Companies.FindAsync(id);
        if (c == null) return NotFound();
        return new CompanyDto(c.Id, c.Name, c.Address, c.IsApproved, c.Phone, c.Email, c.Description);
    }
}
