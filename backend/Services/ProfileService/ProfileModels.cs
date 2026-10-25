using Cue.Domain;

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
    string? FirstName,
    string? LastName,
    string? Phone,
    string? DateOfBirth
);

public sealed record SaveProviderProfileRequest(
    decimal HourlyRate,
    string? Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm,
    string? IntroVideoUrl = null,
    string? DisplayName = null,
    IReadOnlyCollection<string>? ProfileImages = null
);

public sealed record CompanionApplicationRequest(
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm,
    string? IdProofUrl,
    string? SelfieVerificationUrl,
    string? UpiId = null,
    string? IntroVideoUrl = null,
    string? DisplayName = null,
    IReadOnlyCollection<string>? ProfileImages = null
);

public sealed record UpdateProviderLocationRequest(
    double Latitude,
    double Longitude,
    decimal? MaxRadiusKm = null
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
    VerificationStatus Status,
    string? IdProofUrl,
    string? SelfieVerificationUrl,
    string? RejectionReason,
    decimal AverageRating,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? DeletedAt,
    bool IsDeleted,
    string? DisplayName = null,
    IReadOnlyCollection<string>? ProfileImages = null,
    double? Latitude = null,
    double? Longitude = null
);

public sealed record AdminVerificationItemResponse(
    Guid ProfileId,
    Guid UserId,
    string FullName,
    string Email,
    string? Phone,
    string? PhotoUrl,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    VerificationStatus Status,
    string? IdProofUrl,
    string? SelfieVerificationUrl,
    string? RejectionReason,
    DateTime CreatedAt,
    DateTime? ReviewedAt,
    string? DisplayName = null,
    IReadOnlyCollection<string>? ProfileImages = null
);

public sealed record RejectApplicationRequest(string Reason);

public sealed record AdminUserItemResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    string? PhotoUrl,
    bool IsVerified,
    int TrustScore,
    IReadOnlyCollection<string> Roles,
    bool HasCompanionProfile,
    VerificationStatus? CompanionStatus,
    DateTime CreatedAt
);

public sealed record SetProviderProfileStatusRequest(bool Active);

public sealed record CreateAvailabilitySlotRequest(DateTime StartTime, DateTime EndTime);

public sealed record AdminVerificationDetailResponse(
    Guid ProfileId,
    Guid UserId,
    string FullName,
    string Email,
    string? Phone,
    string? PhotoUrl,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    VerificationStatus Status,
    string? IdProofUrl,
    string? SelfieVerificationUrl,
    string? RejectionReason,
    DateTime CreatedAt,
    DateTime? ReviewedAt,
    Guid? ReviewedByAdminId,
    string? DisplayName = null,
    IReadOnlyCollection<string>? ProfileImages = null
);

public sealed record AdminBookingLedgerItemResponse(
    Guid Id,
    Guid SeekerId,
    string SeekerName,
    Guid ProviderId,
    string ProviderName,
    string Status,
    decimal TotalAmount,
    decimal PlatformFee,
    decimal ProviderEarnings,
    DateTime StartTime,
    DateTime EndTime,
    DateTime CreatedAt
);
