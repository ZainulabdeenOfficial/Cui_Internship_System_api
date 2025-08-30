using Cui_Internship_System.Data;
using Cui_Internship_System.Models;
using Cui_Internship_System.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

var conn = config.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(conn))
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("UnifiedDb"));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(conn));
}

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
}).AddEntityFrameworkStores<AppDbContext>()
  .AddDefaultTokenProviders();

// Strict JWT configuration
var jwtSection = config.GetSection("Jwt");
var jwt = jwtSection.Get<JwtSettings>() ?? new JwtSettings();
if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Contains("DEMO", StringComparison.OrdinalIgnoreCase) || jwt.Key.Contains("DEV_SUPER", StringComparison.OrdinalIgnoreCase) || jwt.Key.Length < 48)
    throw new InvalidOperationException("Insecure or missing JWT key. Provide a strong secret (>=48 chars) via configuration (Jwt:Key) or environment variable Jwt__Key.");
if (string.IsNullOrWhiteSpace(jwt.Issuer)) jwt.Issuer = "CuiInternshipSystem";
if (string.IsNullOrWhiteSpace(jwt.Audience)) jwt.Audience = "CuiInternshipSystemUsers";
if (jwt.ExpireMinutes <= 0) jwt.ExpireMinutes = 120;

builder.Services.Configure<JwtSettings>(opts => { opts.Key = jwt.Key; opts.Issuer = jwt.Issuer; opts.Audience = jwt.Audience; opts.ExpireMinutes = jwt.ExpireMinutes; });

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        ValidIssuer = jwt.Issuer,
        ValidAudience = jwt.Audience,
        IssuerSigningKey = key,
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CUI Internship API", Version = "v1" });
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {token}'",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { scheme, Array.Empty<string>() } });
});

var app = builder.Build();
await SeedAsync(app.Services, config);
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

static async Task SeedAsync(IServiceProvider services, IConfiguration config)
{
    using var scope = services.CreateScope();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    string[] roles = ["Admin", "Student", "CompanySupervisor", "UniversitySupervisor"];
    foreach (var r in roles)
    {
        if (!await roleManager.RoleExistsAsync(r))
            await roleManager.CreateAsync(new IdentityRole(r));
    }

    var adminEmail = config["Seed:Admin:Email"] ?? "admin@cui.local";
    var adminPassword = config["Seed:Admin:Password"] ?? "Admin#2025_Default_Strong_Password!";

    var admin = await userManager.FindByEmailAsync(adminEmail);
    if (admin == null)
    {
        admin = new ApplicationUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true, FullName = "System Administrator" };
        var createResult = await userManager.CreateAsync(admin, adminPassword);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(";", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException("Failed to create seed admin user: " + errors);
        }
    }
    if (!await userManager.IsInRoleAsync(admin, "Admin"))
        await userManager.AddToRoleAsync(admin, "Admin");
}


