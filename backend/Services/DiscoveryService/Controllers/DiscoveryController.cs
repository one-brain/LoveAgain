using System.Collections.Generic;
using System.Security.Claims;
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
    int TrustScore,
    double? DistanceKm,
    IReadOnlyCollection<string>? ProfileImages = null);

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
    IReadOnlyCollection<AvailabilitySlotResponse> UpcomingSlots,
    IReadOnlyCollection<string>? ProfileImages = null);

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
        [FromQuery] string? skillTag,
        [FromQuery] decimal? minRate,
        [FromQuery] decimal? maxRate,
        [FromQuery] string? sortBy,
        [FromQuery] double? latitude,
        [FromQuery] double? longitude,
        [FromQuery] double? radiusKm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(profile => profile.IsActive && profile.Status == VerificationStatus.Approved)
            .Join(dbContext.Users.AsNoTracking(),
                profile => profile.UserId,
                user => user.Id,
                (profile, user) => new { profile, user })
            .Where(join => join.user.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(specialty))
        {
            query = query.Where(join => join.profile.Specialties.Contains(specialty.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(skillTag))
        {
            query = query.Where(join => join.profile.Specialties.Contains(skillTag.Trim()));
        }

        if (minRate.HasValue)
        {
            query = query.Where(join => join.profile.HourlyRate >= minRate.Value);
        }

        if (maxRate.HasValue)
        {
            query = query.Where(join => join.profile.HourlyRate <= maxRate.Value);
        }

        // Location-based filtering using Haversine formula
        bool hasLocation = latitude.HasValue && longitude.HasValue;
        double userLat = latitude ?? 0;
        double userLon = longitude ?? 0;
        double maxRadius = radiusKm ?? 50; // Default 50km radius

        if (hasLocation)
        {
            // Filter providers who have location set and are within max radius
            query = query.Where(join =>
                join.profile.Latitude != null &&
                join.profile.Longitude != null);
        }

        // Project to include distance calculation
        var projectQuery = query.Select(join => new
        {
            join.profile,
            join.user,
            // Haversine distance formula (approximation in km)
            Distance = hasLocation && join.profile.Latitude != null && join.profile.Longitude != null
                ? Math.Acos(
                    Math.Sin(userLat * Math.PI / 180) * Math.Sin(join.profile.Latitude.Value * Math.PI / 180) +
                    Math.Cos(userLat * Math.PI / 180) * Math.Cos(join.profile.Latitude.Value * Math.PI / 180) *
                    Math.Cos((userLon - join.profile.Longitude.Value) * Math.PI / 180)
                ) * 6371 // Earth radius in km
                : (double?)null
        });

        // Filter by radius if location provided
        if (hasLocation)
        {
            projectQuery = projectQuery.Where(p => p.Distance != null && p.Distance <= maxRadius);
        }

        // Sort options: rating (default), price, newest, distance
        projectQuery = sortBy?.Trim().ToLowerInvariant() switch
        {
            "price" => projectQuery.OrderBy(p => p.profile.HourlyRate).ThenByDescending(p => p.profile.AverageRating),
            "newest" => projectQuery.OrderByDescending(p => p.profile.CreatedAt),
            "distance" when hasLocation => projectQuery.OrderBy(p => p.Distance).ThenByDescending(p => p.profile.AverageRating),
            _ => projectQuery.OrderByDescending(p => p.profile.AverageRating).ThenByDescending(p => p.profile.UpdatedAt),
        };

        if (!string.IsNullOrWhiteSpace(q))
        {
            // ILIKE-style case-insensitive match over name, bio and specialties
            var term = q.Trim().ToLowerInvariant();
            projectQuery = projectQuery.Where(p =>
                (p.user.FirstName + " " + p.user.LastName).ToLower().Contains(term) ||
                p.profile.Bio.ToLower().Contains(term) ||
                p.profile.Specialties.Any(s => s.ToLower().Contains(term)));
        }

        var rawItems = await projectQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var cards = rawItems
            .Select(p =>
            {
                var displayName = !string.IsNullOrWhiteSpace(p.profile.DisplayName)
                    ? p.profile.DisplayName
                    : p.user.FirstName + " " + p.user.LastName;
                var primaryPhoto = p.profile.ProfileImages.FirstOrDefault() ?? p.user.PhotoUrl;
                return new ProviderCardResponse(
                    p.profile.UserId,
                    displayName,
                    primaryPhoto,
                    p.profile.HourlyRate,
                    p.profile.Bio,
                    p.profile.Specialties,
                    p.profile.AverageRating,
                    p.user.IsVerified,
                    p.user.TrustScore,
                    p.Distance != null ? Math.Round(p.Distance.Value, 1) : null,
                    p.profile.ProfileImages);
            })
            .ToList();

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
                    !string.IsNullOrWhiteSpace(join.profile.DisplayName)
                        ? join.profile.DisplayName
                        : join.user.FirstName + " " + join.user.LastName,
                    join.profile.ProfileImages.FirstOrDefault() ?? join.user.PhotoUrl,
                    join.profile.HourlyRate,
                    join.profile.Bio,
                    join.profile.Specialties,
                    join.profile.MaxRadiusKm,
                    join.profile.IntroVideoUrl,
                    join.profile.AverageRating,
                    join.user.IsVerified,
                    join.user.TrustScore,
                    new List<AvailabilitySlotResponse>(),
                    join.profile.ProfileImages),
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

    [HttpGet("skill-tags")]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetAllSkillTags(
        CancellationToken cancellationToken)
    {
        // Get all unique skill tags (specialties) from all active provider profiles
        var allTags = await dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(p => p.IsActive)
            .SelectMany(p => p.Specialties)
            .Distinct()
            .OrderBy(tag => tag)
            .ToListAsync(cancellationToken);

        return Ok(allTags);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out userId);
    }
}
