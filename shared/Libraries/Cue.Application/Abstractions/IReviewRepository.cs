using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Review?> GetByOrderAndReviewerAsync(Guid orderId, Guid reviewerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Review>> GetByRevieweeAsync(Guid revieweeId, int offset = 0, int limit = 20, CancellationToken cancellationToken = default);
    Task<int> GetCountByRevieweeAsync(Guid revieweeId, CancellationToken cancellationToken = default);
    Task<(double AverageRating, int TotalReviews)> GetAverageRatingForRevieweeAsync(Guid revieweeId, CancellationToken cancellationToken = default);
    Task AddAsync(Review review, CancellationToken cancellationToken = default);
}

