using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "DiscoveryService", Version = "v1" });
});
builder.Services.AddDbContext<CueDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CueDatabase"))
        .UseSnakeCaseNamingConvention());
// Discovery is a public read-only surface: browsing providers requires no JWT,
// so no authentication handler is registered (unlike Profile/Booking services).

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("CueDatabase")!);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CueDbContext>();
    await DatabaseInitializer.InitializeAsync(dbContext);
}

app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DiscoveryService API v1");
    c.RoutePrefix = "swagger";
});
app.MapControllers();
app.MapHealthChecks("/health");
app.MapHealthChecks("/ready");
app.MapHealthChecks("/health/ready");

app.MapGet("/", () => "DiscoveryService is running");

app.Run();
