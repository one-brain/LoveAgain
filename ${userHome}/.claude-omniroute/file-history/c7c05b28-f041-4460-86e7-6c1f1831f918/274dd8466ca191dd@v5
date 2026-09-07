using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Services.AddControllers();

builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "live", "ready" })
    .AddUrlGroup(new Uri("http://auth-service:8080/health"), "auth-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://user-service:8080/health"), "user-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://profile-service:8080/health"), "profile-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://discovery-service:8080/health"), "discovery-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://booking-service:8080/health"), "booking-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://payment-service:8080/health"), "payment-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://chat-service:8080/health"), "chat-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://notification-service:8080/health"), "notification-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://review-service:8080/health"), "review-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://support-service:8080/health"), "support-service", tags: new[] { "downstream" })
    .AddUrlGroup(new Uri("http://analytics-service:8080/health"), "analytics-service", tags: new[] { "downstream" });

builder.Services.AddOcelot();

var app = builder.Build();

app.UseRouting();
app.UseAuthorization();

app.UseSwaggerUI(c =>
{
    c.RoutePrefix = "swagger";
    c.SwaggerEndpoint("/swagger/auth/swagger.json", "Auth Service");
    c.SwaggerEndpoint("/swagger/user/swagger.json", "User Service");
    c.SwaggerEndpoint("/swagger/profile/swagger.json", "Profile Service");
    c.SwaggerEndpoint("/swagger/discovery/swagger.json", "Discovery Service");
    c.SwaggerEndpoint("/swagger/booking/swagger.json", "Booking Service");
    c.SwaggerEndpoint("/swagger/payment/swagger.json", "Payment Service");
    c.SwaggerEndpoint("/swagger/chat/swagger.json", "Chat Service");
    c.SwaggerEndpoint("/swagger/notification/swagger.json", "Notification Service");
    c.SwaggerEndpoint("/swagger/review/swagger.json", "Review Service");
    c.SwaggerEndpoint("/swagger/support/swagger.json", "Support Service");
    c.SwaggerEndpoint("/swagger/analytics/swagger.json", "Analytics Service");
});

// Proxy to downstream services — must come after Swagger UI middleware
await app.UseOcelot();

app.MapHealthChecks("/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });
app.MapHealthChecks("/health", new HealthCheckOptions { Predicate = check => check.Tags.Contains("live") });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });
app.MapHealthChecks("/health/downstream", new HealthCheckOptions { Predicate = check => check.Tags.Contains("downstream") });
app.MapGet("/", () => "APIGateway is running");
app.MapControllers();

app.Run();
