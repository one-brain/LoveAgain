using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Cue.Infrastructure.Data;

internal sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<CueDbContext>
{
    public CueDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<CueDbContext>();

        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? Environment.GetEnvironmentVariable("CueDatabase")
            ?? "Host=localhost;Database=cue;Username=cue;Password=cue";

        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null);
        });

        optionsBuilder.UseSnakeCaseNamingConvention();

        return new CueDbContext(optionsBuilder.Options);
    }
}
