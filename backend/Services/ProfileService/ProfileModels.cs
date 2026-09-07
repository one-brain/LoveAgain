namespace ProfileService;

public sealed record UserProfileResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    DateOnly? DateOfBirth,
    string? PhotoUrl,
    bool IsVerified,
    int TrustScore,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public sealed record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? Phone,
    DateOnly? DateOfBirth
);

public sealed record SaveProviderProfileRequest(
    decimal HourlyRate,
    string? Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm
);

public sealed record ProviderProfileResponse(
    Guid Id,
    Guid UserId,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm,
    string? IntroVideoUrl,
    bool IsActive,
    decimal AverageRating,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public sealed record SetProviderProfileStatusRequest(bool Active);

public sealed record CreateAvailabilitySlotRequest(DateTime StartTime, DateTime EndTime);
