using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Cue.Infrastructure.Data;

/// <summary>
/// Design-time DbContext factory for EF Core migrations.
/// This allows EF Core tools to create the DbContext at design time.
/// </summary>
public class CueDbContextFactory : IDesignTimeDbContextFactory<CueDbContext>
{
    public CueDbContext CreateDbContext(string[] args)
    {
        // This is a design-time factory - in production, the DbContext
        // is created via dependency injection with proper connection string
        var optionsBuilder = new DbContextOptionsBuilder<CueDbContext>();

        // Use a default connection string for design-time
        // In practice, this should come from configuration
        var connectionString = "Host=localhost;Port=5432;Database=cue_design;Username=postgres;Password=postgres";

        optionsBuilder.UseNpgsql(connectionString);

        return new CueDbContext(optionsBuilder.Options);
    }
}