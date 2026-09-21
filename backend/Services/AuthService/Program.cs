using System.Text;
using AuthService;
using Cue.Infrastructure.Data;
using Cue.Infrastructure.Email;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AuthService", Version = "v1" });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddDbContext<CueDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CueDatabase"))
        .UseSnakeCaseNamingConvention());
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
builder.Services.AddSingleton(jwtOptions);
builder.Services.AddSingleton<PasswordService>();
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddMailjetEmail();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("CueDatabase")!);

// Base URL used to build links inside emails (password reset, email verification).
builder.Services.Configure<AppOptions>(builder.Configuration.GetSection(AppOptions.SectionName));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CueDbContext>();
    await DatabaseInitializer.InitializeAsync(dbContext);

    if (app.Environment.IsDevelopment())
    {
        var passwords = scope.ServiceProvider.GetRequiredService<PasswordService>();
        await DevelopmentSeed.EnsureDemoUserAsync(dbContext, passwords);
    }
}

// Configure the HTTP request pipeline.
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint($"/swagger/v1/swagger.json", "AuthService API v1");
    c.RoutePrefix = "swagger";
});
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapHealthChecks("/ready");
app.MapHealthChecks("/health/ready");

app.MapGet("/", () => "AuthService is running");

app.Run();