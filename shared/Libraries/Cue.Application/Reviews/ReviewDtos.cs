namespace Cue.Application.Reviews;

public sealed record ReviewDto(
    Guid Id,
    Guid OrderId,
    Guid ReviewerId,
    string ReviewerName,
    string? ReviewerPhotoUrl,
    Guid RevieweeId,
    int Rating,
    string Comment,
    int? TimelinessScore,
    int? CommunicationScore,
    DateTime CreatedAt);

public sealed record ProviderReviewsPagedDto(
    IReadOnlyList<ReviewDto> Items,
    double AverageRating,
    int TotalReviews,
    int Page,
    int PageSize,
    int TotalPages);

public sealed record BookingReviewStatusDto(
    bool CanReview,
    bool HasReviewed,
    ReviewDto? MyReview,
    string? IneligibleReason);

