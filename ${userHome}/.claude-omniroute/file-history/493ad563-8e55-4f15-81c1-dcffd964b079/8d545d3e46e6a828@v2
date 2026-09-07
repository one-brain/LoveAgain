using Cue.Domain;

namespace Cue.Domain.Tests;

public sealed class UserTests
{
    [Fact]
    public void User_WithMultipleRoles_NormalizesEmailAndTrustAndRoles()
    {
        var roles = new[] { UserRole.Provider, UserRole.Seeker };
        var user = new User(" PERSON@Example.COM ", "Ada", "Lovelace", roles);

        user.ApplyTrustDelta(100);

        Assert.Equal("person@example.com", user.Email);
        Assert.Equal(100, user.TrustScore);
        foreach (var role in roles)
        {
            Assert.Contains(role, user.Roles);
        }
    }

    [Fact]
    public void User_AddRole_DuplicateNotAdded()
    {
        var user = new User("example@example.com", "Bob", "Smith", new[] { UserRole.Seeker });
        user.AddRole(UserRole.Seeker);
        Assert.Equal(1, user.Roles.Count);
    }
}
