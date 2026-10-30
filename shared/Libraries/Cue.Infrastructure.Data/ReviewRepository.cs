using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cue.Infrastructure.Data;

public sealed class ReviewRepository(CueDbContext dbContext) : IReviewRepository
{
    public Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Reviews.SingleOrDefaultAsync(r => r.Id == id, cancellationToken);

    public Task<Review?> GetByOrderAndReviewerAsync(Guid orderId, Guid reviewerId, CancellationToken cancellationToken = default) =>
        dbContext.Reviews.SingleOrDefaultAsync(r => r.OrderId == orderId && r.ReviewerId == reviewerId, cancellationToken);

    public async Task<IReadOnlyList<Review>> GetByRevieweeAsync(Guid revieweeId, int offset = 0, int limit = 20, CancellationToken cancellationToken = default)
    {
        return await dbContext.Reviews
            .Where(r => r.RevieweeId == revieweeId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public Task<int> GetCountByRevieweeAsync(Guid revieweeId, CancellationToken cancellationToken = default) =>
        dbContext.Reviews.CountAsync(r => r.RevieweeId == revieweeId, cancellationToken);

    public async Task<(double AverageRating, int TotalReviews)> GetAverageRatingForRevieweeAsync(Guid revieweeId, CancellationToken cancellationToken = default)
    {
        var ratings = await dbContext.Reviews
            .Where(r => r.RevieweeId == revieweeId)
            .Select(r => (double)r.Rating)
            .ToListAsync(cancellationToken);

        if (ratings.Count == 0) return (0.0, 0);

        var avg = Math.Round(ratings.Average(), 1);
        return (avg, ratings.Count);
    }

    public async Task AddAsync(Review review, CancellationToken cancellationToken = default)
    {
        await dbContext.Reviews.AddAsync(review, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

