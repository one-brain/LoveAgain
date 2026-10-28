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
    IReadOnlyCollection<string>? ProfileImages = null,
    double? Latitude = null,
    double? Longitude = null,
    string? Gender = null,
    string? City = null,
    string? Area = null);

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
    IReadOnlyCollection<string>? ProfileImages = null,
    double? Latitude = null,
    double? Longitude = null,
    double? DistanceKm = null,
    string? Gender = null,
    string? City = null,
    string? Area = null);

public sealed record AvailabilitySlotResponse(
    Guid SlotId,
    DateTime StartTime,
    DateTime EndTime,
    bool IsBooked);

[ApiController]
[Route("api/v1/discovery")]
public sealed class DiscoveryController(CueDbContext dbContext) : ControllerBase
{
    private const int MaxPageSize = 250;

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
        [FromQuery] int pageSize = 120,
        [FromQuery] string? gender = null,
        [FromQuery] string? city = null,
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

        var rawItems = await projectQuery.ToListAsync(cancellationToken);

        // In-memory filtration for text & array fields prevents EF Core Npgsql translation failure
        if (!string.IsNullOrWhiteSpace(specialty))
        {
            var specTrim = specialty.Trim();
            rawItems = rawItems
                .Where(p => p.profile.Specialties.Any(s => s.Equals(specTrim, StringComparison.OrdinalIgnoreCase) || s.Contains(specTrim, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(skillTag))
        {
            var tagTrim = skillTag.Trim();
            rawItems = rawItems
                .Where(p => p.profile.Specialties.Any(s => s.Equals(tagTrim, StringComparison.OrdinalIgnoreCase) || s.Contains(tagTrim, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(gender) && !string.Equals(gender.Trim(), "all", StringComparison.OrdinalIgnoreCase))
        {
            var gTrim = gender.Trim();
            rawItems = rawItems
                .Where(p => string.Equals(p.profile.Gender ?? "Female", gTrim, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(city) && !string.Equals(city.Trim(), "all", StringComparison.OrdinalIgnoreCase))
        {
            var cTrim = city.Trim();
            rawItems = rawItems
                .Where(p => !string.IsNullOrWhiteSpace(p.profile.City) &&
                            p.profile.City.Contains(cTrim, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLowerInvariant();
            rawItems = rawItems
                .Where(p =>
                    (p.profile.DisplayName ?? "").ToLowerInvariant().Contains(term) ||
                    (p.user.FirstName + " " + p.user.LastName).ToLowerInvariant().Contains(term) ||
                    (p.profile.City ?? "").ToLowerInvariant().Contains(term) ||
                    (p.profile.Area ?? "").ToLowerInvariant().Contains(term) ||
                    p.profile.Bio.ToLowerInvariant().Contains(term) ||
                    p.profile.Specialties.Any(s => s.ToLowerInvariant().Contains(term)))
                .ToList();
        }

        var pagedItems = rawItems
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var cards = pagedItems
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
                    p.profile.ProfileImages,
                    p.profile.Latitude,
                    p.profile.Longitude,
                    p.profile.Gender ?? "Female",
                    p.profile.City,
                    p.profile.Area);
            })
            .ToList();

        return Ok(cards);
    }

    [HttpGet("providers/{userId:guid}")]
    [ProducesResponseType(typeof(ProviderDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderDetailResponse>> GetProvider(
        Guid userId,
        [FromQuery] double? latitude = null,
        [FromQuery] double? longitude = null,
        CancellationToken cancellationToken = default)
    {
        var result = await dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(profile => profile.UserId == userId && profile.IsActive && profile.Status == VerificationStatus.Approved)
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
                    join.profile.ProfileImages,
                    join.profile.Latitude,
                    join.profile.Longitude,
                    null,
                    join.profile.Gender ?? "Female",
                    join.profile.City,
                    join.profile.Area),
                UserId = join.profile.UserId,
                join.profile.Latitude,
                join.profile.Longitude
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            return NotFound(new { error = "Provider not found or not available." });
        }

        double? distanceKm = null;
        if (latitude.HasValue && longitude.HasValue && result.Latitude.HasValue && result.Longitude.HasValue)
        {
            var lat1 = latitude.Value * Math.PI / 180;
            var lon1 = longitude.Value * Math.PI / 180;
            var lat2 = result.Latitude.Value * Math.PI / 180;
            var lon2 = result.Longitude.Value * Math.PI / 180;
            var d = Math.Acos(
                Math.Sin(lat1) * Math.Sin(lat2) +
                Math.Cos(lat1) * Math.Cos(lat2) * Math.Cos(lon1 - lon2)
            ) * 6371;

            if (!double.IsNaN(d))
            {
                distanceKm = Math.Round(d, 1);
            }
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

        var response = result.Provider with
        {
            UpcomingSlots = upcomingSlots,
            DistanceKm = distanceKm
        };

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
