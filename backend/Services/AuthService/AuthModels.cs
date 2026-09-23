using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Cue.Domain;
using Microsoft.IdentityModel.Tokens;

namespace AuthService;

public sealed class JwtOptions
{
    public string Issuer { get; init; } = "cue-auth";
    public string Audience { get; init; } = "cue-platform";
    public string SigningKey { get; init; } = string.Empty;
    public int AccessTokenMinutes { get; init; } = 15;
    public int RefreshTokenDays { get; init; } = 7;
}

public sealed class AppOptions
{
    public const string SectionName = "App";

    /// <summary>Public base URL of the web frontend, used to build email links.</summary>
    public string FrontendBaseUrl { get; init; } = "http://localhost:5173";
}

public sealed record RegisterRequest(string Email, string Password, string FirstName, string LastName, string[]? Roles = null);
public sealed record LoginRequest(string Email, string Password);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(string Token, string NewPassword);
public sealed record VerifyEmailRequest(string Token);
public sealed record TokenResponse(string AccessToken, int ExpiresIn, string TokenType = "Bearer");

public sealed class PasswordService
{
    public string Hash(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8) throw new ArgumentException("Password must be at least 8 characters.", nameof(password));
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 120_000, HashAlgorithmName.SHA256, 32);
        return $"v1:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    public bool Verify(string password, string encodedHash)
    {
        var parts = encodedHash.Split(':');
        if (parts.Length != 3 || parts[0] != "v1") return false;
        var salt = Convert.FromBase64String(parts[1]);
        var expected = Convert.FromBase64String(parts[2]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, 120_000, HashAlgorithmName.SHA256, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
}

public sealed class JwtTokenService(JwtOptions options)
{
    public TokenResponse CreateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
        };
        claims.AddRange(user.Roles.Select(role => new Claim(ClaimTypes.Role, role.ToString())));
        var expires = DateTime.UtcNow.AddMinutes(options.AccessTokenMinutes);
        var token = new JwtSecurityToken(options.Issuer, options.Audience, claims, expires: expires, signingCredentials: credentials);
        return new TokenResponse(new JwtSecurityTokenHandler().WriteToken(token), (int)(expires - DateTime.UtcNow).TotalSeconds);
    }

    public (string Raw, string Hash) GenerateRefreshToken()
    {
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
        var hash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
        return (raw, hash);
    }

    public TimeSpan RefreshTokenLifetime => TimeSpan.FromDays(options.RefreshTokenDays);
}
