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

public sealed record ProviderDetailResponse(
    Guid ProviderId,
    string DisplayName,
    string? PhotoUrl,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm,
    string? IntroVideoUrl,
    decimal AverageRating,
    bool IsVerified,
    int TrustScore,
    IReadOnlyCollection<AvailabilitySlotResponse> UpcomingSlots);

public sealed record AvailabilitySlotResponse(
    Guid SlotId,
    DateTime StartTime,
    DateTime EndTime,
    bool IsBooked);

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

    [HttpGet("providers/{userId:guid}")]
    [ProducesResponseType(typeof(ProviderDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderDetailResponse>> GetProvider(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var result = await dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == userId && profile.IsActive)
            .Join(dbContext.Users.AsNoTracking(),
                profile => profile.UserId,
                user => user.Id,
                (profile, user) => new { profile, user })
            .Where(join => join.user.DeletedAt == null)
            .Select(join => new
            {
                Provider = new ProviderDetailResponse(
                    join.profile.UserId,
                    join.user.FirstName + " " + join.user.LastName,
                    join.user.PhotoUrl,
                    join.profile.HourlyRate,
                    join.profile.Bio,
                    join.profile.Specialties,
                    join.profile.MaxRadiusKm,
                    join.profile.IntroVideoUrl,
                    join.profile.AverageRating,
                    join.user.IsVerified,
                    join.user.TrustScore,
                    new List<AvailabilitySlotResponse>()),
                UserId = join.profile.UserId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            return NotFound(new { error = "Provider not found or not available." });
        }

        // Fetch upcoming available slots (not booked, in the future)
        var upcomingSlots = await dbContext.AvailabilitySlots
            .AsNoTracking()
            .Where(slot => slot.ProviderId == result.UserId &&
                           slot.StartTime > DateTime.UtcNow &&
                           !slot.IsBooked)
            .OrderBy(slot => slot.StartTime)
            .Take(20) // Limit to next 20 available slots
            .Select(slot => new AvailabilitySlotResponse(
                slot.Id,
                slot.StartTime,
                slot.EndTime,
                slot.IsBooked))
            .ToListAsync(cancellationToken);

        var response = result.Provider with { UpcomingSlots = upcomingSlots };

        return Ok(response);
    }

}
