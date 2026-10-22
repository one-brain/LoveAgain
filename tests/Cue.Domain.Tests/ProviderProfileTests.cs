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

    [Fact]
    public void ProviderProfile_AddSpecialty_WithoutDuplicate()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });
        profile.AddSpecialty("Cooking");

        Assert.Equal(2, profile.Specialties.Count);
        Assert.Contains("Cooking", profile.Specialties);
    }

    [Fact]
    public void ProviderProfile_AddSpecialty_DuplicateDetection_Tennis()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<InvalidOperationException>(() => profile.AddSpecialty("Tennis"));
        Assert.Throws<InvalidOperationException>(() => profile.AddSpecialty("tennis"));
    }

    [Fact]
    public void ProviderProfile_AddSpecialty_EmptyThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<ArgumentException>(() => profile.AddSpecialty(""));
        Assert.Throws<ArgumentException>(() => profile.AddSpecialty("   "));
    }

    [Fact]
    public void ProviderProfile_RemoveSpecialty_ValidRemoval()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis", "Cooking" });

        profile.RemoveSpecialty("Tennis");

        Assert.DoesNotContain("Tennis", profile.Specialties);
        Assert.Contains("Cooking", profile.Specialties);
    }

    [Fact]
    public void ProviderProfile_RemoveSpecialty_NotOfferedThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<InvalidOperationException>(() => profile.RemoveSpecialty("Cooking"));
    }

    [Fact]
    public void ProviderProfile_RemoveSpecialty_EmptyThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<ArgumentException>(() => profile.RemoveSpecialty(""));
        Assert.Throws<ArgumentException>(() => profile.RemoveSpecialty("   "));
    }

    [Fact]
    public void ProviderProfile_Update_CorrectFields()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        profile.Update(50m, "Updated bio", new[] { "Tennis", "Cooking" }, 60m);

        Assert.Equal(50m, profile.HourlyRate);
        Assert.Equal("Updated bio", profile.Bio);
        Assert.Equal(60m, profile.MaxRadiusKm);
        Assert.Equal(new[] { "Tennis", "Cooking" }, profile.Specialties.ToArray());
    }

    [Fact]
    public void ProviderProfile_Update_InvalidRateThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<ArgumentOutOfRangeException>(() => profile.Update(-5m, "Bio", new[] { "Tennis" }, 60m));
    }

    [Fact]
    public void ProviderProfile_Update_InvalidRadiusThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<ArgumentOutOfRangeException>(() => profile.Update(50m, "Bio", new[] { "Tennis" }, 0));
    }

    [Fact]
    public void ProviderProfile_Update_EmptySpecialtiesThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<ArgumentException>(() => profile.Update(50m, "Bio", Array.Empty<string>(), 60m));
    }

    [Fact]
    public void ProviderProfile_Delete_SetsCorrectedState()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });
        profile.Activate();

        profile.Delete();

        Assert.False(profile.IsActive);
        Assert.NotNull(profile.DeletedAt);
        Assert.True(profile.IsDeleted);
    }

    [Fact]
    public void ProviderProfile_Delete_AlreadyDeletedThrows()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });
        profile.Delete();

        Assert.Throws<InvalidOperationException>(() => profile.Delete());
    }

    [Fact]
    public void ProviderProfile_CaseInsensitiveSpecialtyHandling()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "tennis" });

        // Adding with different case should be rejected
        Assert.Throws<InvalidOperationException>(() => profile.AddSpecialty("TENNIS"));
        Assert.Throws<InvalidOperationException>(() => profile.AddSpecialty("Tennis"));

        // Removing with different case should work
        profile.RemoveSpecialty("TENNIS");
        Assert.Empty(profile.Specialties);
    }

    [Fact]
    public void ProviderProfile_SpecialtiesTrimmedWhitespace()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "  Tennis  ", " Cooking " });

        Assert.Equal(new[] { "Tennis", "Cooking" }, profile.Specialties.ToArray());
    }

    [Fact]
    public void ProviderProfile_SetLocation_ValidCoordinates()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });
        profile.SetLocation(37.7749, -122.4194);

        Assert.Equal(37.7749, profile.Latitude);
        Assert.Equal(-122.4194, profile.Longitude);
    }

    [Fact]
    public void ProviderProfile_SetLocation_InvalidCoordinatesThrow()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });

        Assert.Throws<ArgumentOutOfRangeException>(() => profile.SetLocation(95, 0));
        Assert.Throws<ArgumentOutOfRangeException>(() => profile.SetLocation(0, 190));
    }

    [Fact]
    public void ProviderProfile_Constructor_SupportsOptionalRadiusAndVideo()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 55m, "Bio", new[] { "Art" }, 75m, "https://example.com/video.mp4");

        Assert.Equal(75m, profile.MaxRadiusKm);
        Assert.Equal("https://example.com/video.mp4", profile.IntroVideoUrl);
    }

    [Fact]
    public void ProviderProfile_AddSpecialty_AdoptsCanonicalCatalogName_WhenCaseMatchesExisting()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });
        var catalog = new[] { "Badminton", "Cafe Catchup", "Board Games" };

        profile.AddSpecialty("  badminton  ", catalog);

        Assert.Equal(2, profile.Specialties.Count);
        Assert.Contains("Badminton", profile.Specialties);
        Assert.DoesNotContain("  badminton  ", profile.Specialties);
        Assert.DoesNotContain("badminton", profile.Specialties);
    }

    [Fact]
    public void ProviderProfile_AddSpecialty_AddsCustomSpecialty_WhenNotInCatalog()
    {
        var profile = new ProviderProfile(Guid.NewGuid(), 40m, "Bio", new[] { "Tennis" });
        var catalog = new[] { "Badminton", "Cafe Catchup" };

        profile.AddSpecialty("  Standup Comedy  ", catalog);

        Assert.Equal(2, profile.Specialties.Count);
        Assert.Contains("Standup Comedy", profile.Specialties);
        Assert.DoesNotContain("  Standup Comedy  ", profile.Specialties);
    }
}