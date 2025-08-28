using Cui_Internship_System.Data;
using Cui_Internship_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cui_Internship_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CertificatesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CertificatesController(AppDbContext db){_db = db;}

    [HttpPost("internship/{internshipId}")]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> Generate(int internshipId)
    {
        var internship = await _db.Internships.Include(i=> i.Certificate).FirstOrDefaultAsync(i=> i.Id == internshipId);
        if (internship == null) return NotFound();
        if (internship.Certificate != null) return BadRequest("Certificate already exists");
        var cert = new Certificate { InternshipId = internship.Id };
        _db.Certificates.Add(cert);
        await _db.SaveChangesAsync();
        return Ok(new { cert.Id, cert.CertificateNumber, cert.IssuedOn });
    }

    [HttpGet("internship/{internshipId}")]
    [Authorize(Roles="Admin,Student")]
    public async Task<IActionResult> Get(int internshipId)
    {
        var cert = await _db.Certificates.FirstOrDefaultAsync(c => c.InternshipId == internshipId);
        if (cert == null) return NotFound();
        return Ok(new { cert.Id, cert.CertificateNumber, cert.IssuedOn });
    }
}
