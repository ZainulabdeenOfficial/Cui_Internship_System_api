using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Cui_Internship_System.Data;

public class UnifiedDesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var cfg = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets(typeof(UnifiedDesignTimeFactory).Assembly, optional: true)
            .AddEnvironmentVariables()
            .Build();
        var optsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        var conn = cfg.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(conn))
            optsBuilder.UseInMemoryDatabase("UnifiedDb");
        else
            optsBuilder.UseSqlServer(conn);
        return new AppDbContext(optsBuilder.Options);
    }
}
