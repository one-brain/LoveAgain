using Cue.Application.Abstractions;
using MediatR;

namespace Cue.Application.Reviews;

public sealed record GetProviderReviewsQuery(
    Guid ProviderId,
    int Page = 1,
    int PageSize = 10) : IRequest<ProviderReviewsPagedDto>;

public sealed class GetProviderReviewsQueryHandler(
    IReviewRepository reviewRepository,
    IUserRepository userRepository) : IRequestHandler<GetProviderReviewsQuery, ProviderReviewsPagedDto>
{
    public async Task<ProviderReviewsPagedDto> Handle(GetProviderReviewsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var offset = (page - 1) * pageSize;

        var (avgRating, totalCount) = await reviewRepository.GetAverageRatingForRevieweeAsync(request.ProviderId, cancellationToken);
        var reviews = await reviewRepository.GetByRevieweeAsync(request.ProviderId, offset, pageSize, cancellationToken);

        var reviewerIds = reviews.Select(r => r.ReviewerId).Distinct().ToList();
        var reviewers = await userRepository.GetByIdsAsync(reviewerIds, cancellationToken);

        var items = reviews.Select(r =>
        {
            reviewers.TryGetValue(r.ReviewerId, out var reviewer);
            var reviewerName = reviewer is not null
                ? $"{reviewer.FirstName} {reviewer.LastName?.FirstOrDefault()}.".Trim()
                : "Verified Client";

            return new ReviewDto(
                r.Id,
                r.OrderId,
                r.ReviewerId,
                reviewerName,
                reviewer?.PhotoUrl,
                r.RevieweeId,
                r.Rating,
                r.Comment,
                r.TimelinessScore,
                r.CommunicationScore,
                r.CreatedAt);
        }).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new ProviderReviewsPagedDto(
            items,
            avgRating,
            totalCount,
            page,
            pageSize,
            totalPages);
    }
}

