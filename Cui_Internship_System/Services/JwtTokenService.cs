using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Cui_Internship_System.Models;

namespace Cui_Internship_System.Services;

public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpireMinutes { get; set; } = 60;
}

public interface IJwtTokenService
{
    (string token, DateTime expires) Generate(ApplicationUser user, IList<string> roles);
}

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;
    public JwtTokenService(IOptions<JwtSettings> options)
    {
        _settings = options.Value;
    }

    public (string token, DateTime expires) Generate(ApplicationUser user, IList<string> roles)
    {
        // Added explicit NameIdentifier claim so downstream authorization always finds it (some mappings differ across versions)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("name", user.FullName ?? user.UserName ?? string.Empty)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        // Defensive: if key not configured fallback to dev key (mirrors Program.cs fallback) so generation & validation stay consistent
        var keyString = string.IsNullOrWhiteSpace(_settings.Key) ? "DEV_SUPER_SECRET_KEY_CHANGE_ME_1234567890" : _settings.Key;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_settings.ExpireMinutes <= 0 ? 60 : _settings.ExpireMinutes);

        var token = new JwtSecurityToken(
            issuer: string.IsNullOrWhiteSpace(_settings.Issuer) ? "dev" : _settings.Issuer,
            audience: string.IsNullOrWhiteSpace(_settings.Audience) ? "dev" : _settings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return (jwt, expires);
    }
}
