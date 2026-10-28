using Cue.Domain;
using Xunit;

namespace Cue.Domain.Tests;

public sealed class UserAgeValidationTests
{
    [Fact]
    public void User_WithoutDateOfBirth_ReturnsNullAgeAndNotLegal()
    {
        var user = new User("test@cue.local", "Alex", "Rivera", new[] { UserRole.Seeker });
        Assert.Null(user.DateOfBirth);
        Assert.Null(user.CalculateAge());
        Assert.False(user.IsLegalAge());
    }

    [Fact]
    public void User_Turning18Today_IsLegalAge()
    {
        var asOf = new DateOnly(2026, 10, 28);
        var dob = new DateOnly(2008, 10, 28); // Exactly 18 today

        var user = new User("test@cue.local", "Alex", "Rivera", new[] { UserRole.Seeker });
        user.SetDateOfBirth(dob);

        Assert.Equal(18, user.CalculateAge(asOf));
        Assert.True(user.IsLegalAge(asOf));
    }

    [Fact]
    public void User_Turning18Tomorrow_IsNotLegalAge()
    {
        var asOf = new DateOnly(2026, 10, 28);
        var dob = new DateOnly(2008, 10, 29); // 18 tomorrow, 17 today

        var user = new User("test@cue.local", "Sam", "Taylor", new[] { UserRole.Seeker });
        user.SetDateOfBirth(dob);

        Assert.Equal(17, user.CalculateAge(asOf));
        Assert.False(user.IsLegalAge(asOf));
    }

    [Fact]
    public void User_Turned18Yesterday_IsLegalAge()
    {
        var asOf = new DateOnly(2026, 10, 28);
        var dob = new DateOnly(2008, 10, 27); // Turned 18 yesterday

        var user = new User("test@cue.local", "Morgan", "Lee", new[] { UserRole.Seeker });
        user.SetDateOfBirth(dob);

        Assert.Equal(18, user.CalculateAge(asOf));
        Assert.True(user.IsLegalAge(asOf));
    }

    [Fact]
    public void User_LeapYearBornOnFeb29_AgeCalculationAccurate()
    {
        var dob = new DateOnly(2004, 2, 29);
        var user = new User("test@cue.local", "Jordan", "Kim", new[] { UserRole.Seeker });
        user.SetDateOfBirth(dob);

        // In 2022 (non-leap), on Feb 28 they have not yet reached birthday anniversary
        var beforeBirthday = new DateOnly(2022, 2, 28);
        Assert.Equal(17, user.CalculateAge(beforeBirthday));
        Assert.False(user.IsLegalAge(beforeBirthday));

        // On March 1, 2022, full 18 years have elapsed
        var onAnniversary = new DateOnly(2022, 3, 1);
        Assert.Equal(18, user.CalculateAge(onAnniversary));
        Assert.True(user.IsLegalAge(onAnniversary));
    }

    [Theory]
    [InlineData(2012, 5, 15, 14, false)] // Minor (14 years old)
    [InlineData(2000, 1, 1, 26, true)]   // Adult (26 years old)
    [InlineData(1995, 12, 31, 30, true)] // Adult (30 years old)
    public void User_VariousBirthdates_CalculatesCorrectAgeAndLegality(int y, int m, int d, int expectedAge, bool expectedLegal)
    {
        var asOf = new DateOnly(2026, 10, 28);
        var dob = new DateOnly(y, m, d);

        var user = new User("test@cue.local", "Taylor", "Swift", new[] { UserRole.Seeker });
        user.SetDateOfBirth(dob);

        Assert.Equal(expectedAge, user.CalculateAge(asOf));
        Assert.Equal(expectedLegal, user.IsLegalAge(asOf));
    }
}

