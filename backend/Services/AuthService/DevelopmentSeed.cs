using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService;

public static class DevelopmentSeed
{
    public const string Email = "demo@cue.local";
    public const string Password = "CueDemo123!";

    public static async Task EnsureDemoUserAsync(CueDbContext dbContext, PasswordService passwords, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = Email.ToLowerInvariant();
        if (await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail, cancellationToken))
        {
            return;
        }

        var user = new User(normalizedEmail, "Demo", "User", new[] { UserRole.Seeker });
        user.SetPasswordHash(passwords.Hash(Password));
        user.Verify();
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
