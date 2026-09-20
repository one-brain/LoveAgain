using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscoveryService.Controllers;

public sealed record ProviderCardResponse(
    Guid ProviderId,
    string DisplayName,
    string? PhotoUrl,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    decimal AverageRating,
    bool IsVerified,
    int TrustScore);

[ApiController]
[Route("api/v1/discovery")]
public sealed class DiscoveryController(CueDbContext dbContext) : ControllerBase
{
    private const int MaxPageSize = 50;

    [HttpGet("providers")]
    [ProducesResponseType(typeof(IReadOnlyList<ProviderCardResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ProviderCardResponse>>> ListProviders(
        [FromQuery] string? q,
        [FromQuery] string? specialty,
        [FromQuery] decimal? minRate,
        [FromQuery] decimal? maxRate,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(profile => profile.IsActive)
            .Join(dbContext.Users.AsNoTracking(),
                profile => profile.UserId,
                user => user.Id,
                (profile, user) => new { profile, user })
            .Where(join => join.user.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(specialty))
        {
            query = query.Where(join => join.profile.Specialties.Contains(specialty.Trim()));
        }

        if (minRate.HasValue)
        {
            query = query.Where(join => join.profile.HourlyRate >= minRate.Value);
        }

        if (maxRate.HasValue)
        {
            query = query.Where(join => join.profile.HourlyRate <= maxRate.Value);
        }

        // Sort options: rating (default), price, newest. Distance sort waits on
        // geo data (see F-04-03 notes in the project plan).
        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "price" => query.OrderBy(join => join.profile.HourlyRate).ThenByDescending(join => join.profile.AverageRating),
            "newest" => query.OrderByDescending(join => join.profile.CreatedAt),
            _ => query.OrderByDescending(join => join.profile.AverageRating).ThenByDescending(join => join.profile.UpdatedAt),
        };

        if (!string.IsNullOrWhiteSpace(q))
        {
            // ILIKE-style case-insensitive match over name, bio and specialties —
            // sufficient for MVP search volumes; full-text index can come later.
            var term = q.Trim().ToLowerInvariant();
            query = query.Where(join =>
                (join.user.FirstName + " " + join.user.LastName).ToLower().Contains(term) ||
                join.profile.Bio.ToLower().Contains(term) ||
                join.profile.Specialties.Any(s => s.ToLower().Contains(term)));
        }

        var cards = await query
            .Skip((page - 1) * pageSize)            .Take(pageSize)
            .Select(join => new ProviderCardResponse(
                join.profile.UserId,
                join.user.FirstName + " " + join.user.LastName,
                join.user.PhotoUrl,
                join.profile.HourlyRate,
                join.profile.Bio,
                join.profile.Specialties,
                join.profile.AverageRating,
                join.user.IsVerified,
                join.user.TrustScore))
            .ToListAsync(cancellationToken);

        return Ok(cards);
    }

}
