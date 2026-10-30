using Cue.Infrastructure.Storage;
using System.Security.Claims;
using Cue.Application.Profiles;
using Cue.Domain;
using Cue.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ProfileService.Controllers;

[ApiController]
[Route("api/v1/profiles/provider")]
public sealed class ProviderProfileController(CueDbContext dbContext, ISender sender, IBlobStorage blobStorage) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderProfileResponse>> GetMyProviderProfile(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }

        return Ok(ToResponse(profile));
    }

    [HttpPost("services")]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderProfileResponse>> AddService(
        [FromBody] System.Text.Json.JsonElement payload,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var specialty = payload.ValueKind == System.Text.Json.JsonValueKind.String
            ? payload.GetString()
            : (payload.ValueKind == System.Text.Json.JsonValueKind.Object && payload.TryGetProperty("specialty", out var prop)
                ? prop.GetString()
                : null);

        if (string.IsNullOrWhiteSpace(specialty))
        {
            return BadRequest(new { error = "Specialty name is required." });
        }

        var command = new AddProviderSpecialtyCommand(userId, specialty);
        try
        {
            await sender.Send(command, cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }

        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleAsync(p => p.UserId == userId, cancellationToken);
        return Ok(ToResponse(profile));
    }

    [HttpDelete("services/{specialty}")]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderProfileResponse>> RemoveService(
        string specialty,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var command = new RemoveProviderSpecialtyCommand(userId, specialty);
        try
        {
            await sender.Send(command, cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }

        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleAsync(p => p.UserId == userId, cancellationToken);
        return Ok(ToResponse(profile));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProviderProfileResponse>> CreateMyProviderProfile(
        [FromBody] SaveProviderProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var command = new CreateProviderProfileCommand(
            userId, request.HourlyRate, request.Bio ?? string.Empty, request.Specialties, request.MaxRadiusKm);

        try
        {
            var result = await sender.Send(command, cancellationToken);
            if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
                .AsNoTracking()
                .SingleAsync(p => p.Id == result.ProfileId, cancellationToken);
            return CreatedAtAction(nameof(GetMyProviderProfile), ToResponse(profile));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { error = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    [HttpPut]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderProfileResponse>> UpdateMyProviderProfile(
        [FromBody] SaveProviderProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var command = new UpdateProfileCommand(
            userId,
            request.HourlyRate,
            request.Bio ?? string.Empty,
            request.Specialties,
            request.MaxRadiusKm,
            request.IntroVideoUrl,
            request.DisplayName,
            request.ProfileImages);

        try
        {
            await sender.Send(command, cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { error = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage)) });
        }

        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleAsync(p => p.UserId == userId, cancellationToken);
        return Ok(ToResponse(profile));
    }

    [HttpPatch("status")]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderProfileResponse>> SetStatus(
        [FromBody] SetProviderProfileStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        try
        {
            await sender.Send(new SetProviderProfileStatusCommand(userId, request.Active), cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { error = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage)) });
        }

        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleAsync(p => p.UserId == userId, cancellationToken);
        return Ok(ToResponse(profile));
    }

    // --- Availability slots ---

    [HttpGet("availability")]
    [ProducesResponseType(typeof(IReadOnlyList<AvailabilitySlotSummary>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<AvailabilitySlotSummary>>> GetMySlots(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        try
        {
            var slots = await sender.Send(new GetProviderSlotsQuery(userId), cancellationToken);
            return Ok(slots);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
    }

    [HttpGet("{providerId:guid}/availability")]
    [ProducesResponseType(typeof(IReadOnlyList<AvailabilitySlotSummary>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AvailabilitySlotSummary>>> GetCompanionAvailability(
        Guid providerId,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var slots = await dbContext.AvailabilitySlots
            .AsNoTracking()
            .Where(slot => slot.ProviderId == providerId && !slot.IsBooked && slot.EndTime > now)
            .OrderBy(slot => slot.StartTime)
            .Select(slot => new AvailabilitySlotSummary(slot.Id, slot.ProviderId, slot.StartTime, slot.EndTime, slot.IsBooked))
            .ToListAsync(cancellationToken);

        return Ok(slots);
    }

    // --- Delete provider profile ---
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteMyProviderProfile(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        try
        {
            await sender.Send(new DeleteProviderProfileCommand(userId), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { error = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    [HttpPost("availability")]
    [ProducesResponseType(typeof(AvailabilitySlotSummary), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AvailabilitySlotSummary>> CreateSlot(
        [FromBody] CreateAvailabilitySlotRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        try
        {
            var slot = await sender.Send(
                new CreateAvailabilitySlotCommand(userId, request.StartTime, request.EndTime), cancellationToken);
            return CreatedAtAction(nameof(GetMySlots), slot);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { error = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    [HttpDelete("availability/{slotId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteSlot(Guid slotId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        try
        {
            await sender.Send(new DeleteAvailabilitySlotCommand(userId, slotId), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Availability slot was not found." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { error = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    private async Task<bool> IsUserAdminAsync(Guid userId, CancellationToken cancellationToken)
    {
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);
        if (string.Equals(roleClaim, "Admin", System.StringComparison.OrdinalIgnoreCase)) return true;
        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        return user != null && user.Roles.Contains(UserRole.Admin);
    }

    private bool TryGetUserId(out Guid userId)
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            userId = Guid.Empty;
            return false;
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (!string.IsNullOrWhiteSpace(userIdClaim) && Guid.TryParse(userIdClaim, out userId))
        {
            return true;
        }

        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value
            ?? User.FindFirst("email")?.Value;

        if (!string.IsNullOrWhiteSpace(emailClaim))
        {
            var normalizedEmail = emailClaim.Trim().ToLowerInvariant();
            var matched = dbContext.Users
                .AsNoTracking()
                .FirstOrDefault(u => u.Email.ToLower() == normalizedEmail && u.DeletedAt == null);
            if (matched != null)
            {
                userId = matched.Id;
                return true;
            }
        }

        userId = Guid.Empty;
        return false;
    }

    [HttpPost("apply")]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ProviderProfileResponse>> ApplyAsCompanion(
        [FromBody] CompanionApplicationRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators cannot apply or act as a companion." });

        if (request.HourlyRate <= 0)
        {
            return BadRequest(new { error = "Hourly rate must be greater than zero." });
        }

        if (await IsUserAdminAsync(userId, cancellationToken)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });

        var profile = await dbContext.ProviderProfiles
            .SingleOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            profile = new ProviderProfile(
                userId,
                request.HourlyRate,
                request.Bio,
                request.Specialties,
                request.MaxRadiusKm > 0 ? request.MaxRadiusKm : 50,
                request.IntroVideoUrl,
                request.DisplayName,
                request.ProfileImages
            );
            profile.SubmitForReview(request.IdProofUrl, request.SelfieVerificationUrl);
            await dbContext.ProviderProfiles.AddAsync(profile, cancellationToken);
        }
        else
        {
            var resolvedDisplayName = !string.IsNullOrWhiteSpace(request.DisplayName)
                ? request.DisplayName
                : profile.DisplayName;
            var resolvedProfileImages = request.ProfileImages is { Count: > 0 }
                ? request.ProfileImages
                : profile.ProfileImages;
            var resolvedIntroVideo = !string.IsNullOrWhiteSpace(request.IntroVideoUrl)
                ? request.IntroVideoUrl
                : profile.IntroVideoUrl;

            profile.Update(
                request.HourlyRate,
                request.Bio,
                request.Specialties,
                request.MaxRadiusKm > 0 ? request.MaxRadiusKm : (profile.MaxRadiusKm > 0 ? profile.MaxRadiusKm : 50),
                resolvedIntroVideo,
                resolvedDisplayName,
                resolvedProfileImages);
            profile.SubmitForReview(request.IdProofUrl, request.SelfieVerificationUrl);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(profile));
    }

    [HttpPost("upload-photo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadCompanionPhoto(IFormFile file, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        const long maxBytes = 5 * 1024 * 1024;
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { error = "An image file is required." });
        }
        if (file.Length > maxBytes)
        {
            return BadRequest(new { error = "Image must be 5MB or smaller." });
        }

        var permittedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!permittedTypes.Contains(file.ContentType))
        {
            return BadRequest(new { error = "Only JPEG, PNG or WebP images are accepted." });
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension))
        {
            extension = file.ContentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg",
            };
        }
        var objectName = $"companions/{userId}/{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms, cancellationToken);
        ms.Position = 0;

        string photoUrl;
        try
        {
            photoUrl = await blobStorage.UploadAsync(objectName, ms, file.ContentType, cancellationToken);
        }
        catch
        {
            // Resilient fallback to inline Data URI when S3/MinIO is not provisioned in cluster
            var base64 = Convert.ToBase64String(ms.ToArray());
            photoUrl = $"data:{file.ContentType};base64,{base64}";
        }

        return Ok(new { photoUrl });
    }

    [HttpPut("location")]
    [ProducesResponseType(typeof(ProviderProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProviderProfileResponse>> UpdateLocation(
        [FromBody] UpdateProviderLocationRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        if (await IsUserAdminAsync(userId, cancellationToken))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Administrators do not hold companion profiles." });
        }

        if (request.Latitude < -90 || request.Latitude > 90)
        {
            return BadRequest(new { error = "Latitude must be between -90 and 90." });
        }

        if (request.Longitude < -180 || request.Longitude > 180)
        {
            return BadRequest(new { error = "Longitude must be between -180 and 180." });
        }

        var profile = await dbContext.ProviderProfiles
            .SingleOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }

        profile.SetLocation(request.Latitude, request.Longitude);

        if (request.MaxRadiusKm.HasValue && request.MaxRadiusKm.Value > 0)
        {
            profile.Update(
                profile.HourlyRate,
                profile.Bio,
                profile.Specialties,
                request.MaxRadiusKm.Value,
                profile.IntroVideoUrl,
                profile.DisplayName,
                profile.ProfileImages);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(profile));
    }

    private static ProviderProfileResponse ToResponse(ProviderProfile profile) =>
        new(profile.Id, profile.UserId, profile.HourlyRate, profile.Bio, profile.Specialties,
            profile.MaxRadiusKm, profile.IntroVideoUrl, profile.IsActive, profile.Status,
            profile.IdProofUrl, profile.SelfieVerificationUrl, profile.RejectionReason,
            profile.AverageRating,
            profile.CreatedAt, profile.UpdatedAt, profile.DeletedAt, profile.IsDeleted,
            profile.DisplayName, profile.ProfileImages,
            profile.Latitude, profile.Longitude);
}