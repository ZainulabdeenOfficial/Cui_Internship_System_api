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
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("AppDb"));
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

// Initial bind from configuration
var jwt = config.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
// Unified fallbacks so BOTH generation (IOptions) and validation use identical values
if (string.IsNullOrWhiteSpace(jwt.Key)) jwt.Key = "DEV_SUPER_SECRET_KEY_CHANGE_ME_1234567890";
if (string.IsNullOrWhiteSpace(jwt.Issuer)) jwt.Issuer = "dev";
if (string.IsNullOrWhiteSpace(jwt.Audience)) jwt.Audience = "dev";
if (jwt.ExpireMinutes <= 0) jwt.ExpireMinutes = 60;

// Re-register strongly typed options with resolved defaults (overrides plain section binding)
builder.Services.Configure<JwtSettings>(opts =>
{
    opts.Key = jwt.Key;
    opts.Issuer = jwt.Issuer;
    opts.Audience = jwt.Audience;
    opts.ExpireMinutes = jwt.ExpireMinutes;
});

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
    o.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx =>
        {
            var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("JWT");
            logger.LogWarning(ctx.Exception, "JWT auth failed");
            return Task.CompletedTask;
        },
        OnChallenge = ctx =>
        {
            var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("JWT");
            logger.LogInformation("JWT challenge: {Error} {Description}", ctx.Error, ctx.ErrorDescription);
            return Task.CompletedTask;
        },
        OnTokenValidated = ctx =>
        {
            var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("JWT");
            var sub = ctx.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ctx.Principal?.Identity?.Name;
            logger.LogInformation("JWT token validated for {Sub}", sub);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// DEV-OPEN CORS: allow any origin (dynamic) with credentials for easier local testing.
// NOTE: For production tighten this to explicit origins.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true) // allow all origins dynamically
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // required if frontend sends credentials (cookies) or you later add them
    });
    options.AddPolicy("Open", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
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
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { scheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
