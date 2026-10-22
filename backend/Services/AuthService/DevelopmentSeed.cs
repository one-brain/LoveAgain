using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService;

public static class DevelopmentSeed
{
    public const string Email = "demo@cue.local";
    public const string Password = "CueDemo123!";

    public const string AdminEmail = "admin@cue.local";
    public const string AdminPassword = "CueAdmin123!";

    public static async Task EnsureDemoUserAsync(CueDbContext dbContext, PasswordService passwords, CancellationToken cancellationToken = default)
    {
        // 1. Ensure Client demo user
        var normalizedEmail = Email.ToLowerInvariant();
        if (!await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail, cancellationToken))
        {
            var user = new User(normalizedEmail, "Demo", "Client", new[] { UserRole.Seeker });
            user.SetPasswordHash(passwords.Hash(Password));
            user.Verify();
            dbContext.Users.Add(user);
        }

        // 2. Ensure Admin user
        var normalizedAdminEmail = AdminEmail.ToLowerInvariant();
        var adminUser = await dbContext.Users.SingleOrDefaultAsync(user => user.Email == normalizedAdminEmail, cancellationToken);
        if (adminUser == null)
        {
            adminUser = new User(normalizedAdminEmail, "Cue", "Admin", new[] { UserRole.Admin, UserRole.Seeker });
            adminUser.SetPasswordHash(passwords.Hash(AdminPassword));
            adminUser.Verify();
            dbContext.Users.Add(adminUser);
        }
        else if (!adminUser.Roles.Contains(UserRole.Admin))
        {
            adminUser.AddRole(UserRole.Admin);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
