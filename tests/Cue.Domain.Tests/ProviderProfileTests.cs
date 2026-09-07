using Cue.Domain;

namespace Cue.Domain.Tests;

public sealed class ProviderProfileTests
{
    [Fact]
    public void ProviderProfile_NormalizesSpecialties()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Walks", new[] { " Tennis ", "tennis", "" });

        Assert.Equal(new[] { "Tennis" }, profile.Specialties);
        Assert.False(profile.IsActive);
        Assert.Equal(50, profile.MaxRadiusKm);
    }

    [Fact]
    public void ProviderProfile_RejectsNonPositiveRate()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            new ProviderProfile(Guid.NewGuid(), 0m, "Bio", new[] { "Tennis" }));
    }

    [Fact]
    public void ProviderProfile_RequiresAtLeastOneSpecialty()
    {
        Assert.Throws<ArgumentException>(() =>
            new ProviderProfile(Guid.NewGuid(), 40m, "Bio", Array.Empty<string>()));
    }

    [Fact]
    public void Activate_Deactivate_TogglesVisibility()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        profile.Activate();
        Assert.True(profile.IsActive);

        profile.Deactivate();
        Assert.False(profile.IsActive);
    }
}
