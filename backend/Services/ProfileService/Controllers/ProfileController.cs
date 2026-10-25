using System.Security.Claims;
using Cue.Domain;
using Cue.Infrastructure.Data;
using Cue.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ProfileService.Controllers;

[ApiController]
[Route("api/v1/profiles")]
public sealed class ProfileController(CueDbContext dbContext, IBlobStorage blobStorage) : ControllerBase
{
    private async Task<User?> ResolveUserAsync(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? Request.Headers["X-User-Id"].FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
        {
            var byId = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null, cancellationToken);
            if (byId != null)
            {
                return byId;
            }
        }

        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value
            ?? User.FindFirst("email")?.Value
            ?? Request.Headers["X-User-Email"].FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(emailClaim))
        {
            var normalizedEmail = emailClaim.Trim().ToLowerInvariant();
            var byEmail = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail && u.DeletedAt == null, cancellationToken);
            if (byEmail != null)
            {
                return byEmail;
            }
        }

        return null;
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> GetMyProfile(CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        var response = new UserProfileResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Phone,
            user.DateOfBirth,
            user.PhotoUrl,
            user.IsVerified,
            user.TrustScore,
            user.CreatedAt,
            user.UpdatedAt
        );

        return Ok(response);
    }

    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> UpdateMyProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found. Please sign in again." });
        }

        try
        {
            DateOnly? parsedDob = null;
            if (!string.IsNullOrWhiteSpace(request.DateOfBirth))
            {
                var rawDob = request.DateOfBirth.Trim();
                if (rawDob.Contains('T'))
                {
                    rawDob = rawDob.Split('T')[0];
                }
                if (DateOnly.TryParse(rawDob, out var d))
                {
                    parsedDob = d;
                }
                else if (DateTime.TryParse(request.DateOfBirth, out var dt))
                {
                    parsedDob = DateOnly.FromDateTime(dt);
                }
            }

            var firstName = string.IsNullOrWhiteSpace(request.FirstName) ? user.FirstName : request.FirstName;
            user.UpdateProfile(firstName, request.LastName, request.Phone, parsedDob);
            await dbContext.SaveChangesAsync(cancellationToken);

            var response = new UserProfileResponse(
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Phone,
                user.DateOfBirth,
                user.PhotoUrl,
                user.IsVerified,
                user.TrustScore,
                user.CreatedAt,
                user.UpdatedAt
            );

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("me/photo")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> UploadMyPhoto(IFormFile file, CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        const long maxBytes = 5 * 1024 * 1024;
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { error = "A photo file is required." });
        }
        if (file.Length > maxBytes)
        {
            return BadRequest(new { error = "Photo must be 5MB or smaller." });
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
        var objectName = $"{user.Id}/{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

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
            var base64 = Convert.ToBase64String(ms.ToArray());
            photoUrl = $"data:{file.ContentType};base64,{base64}";
        }

        user.SetPhotoUrl(photoUrl);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new UserProfileResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Phone,
            user.DateOfBirth,
            user.PhotoUrl,
            user.IsVerified,
            user.TrustScore,
            user.CreatedAt,
            user.UpdatedAt
        );

        return Ok(response);
    }

    [HttpDelete("me/photo")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> DeleteMyPhoto(CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        user.SetPhotoUrl(null);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new UserProfileResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Phone,
            user.DateOfBirth,
            user.PhotoUrl,
            user.IsVerified,
            user.TrustScore,
            user.CreatedAt,
            user.UpdatedAt
        );

        return Ok(response);
    }

    [HttpDelete("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteMyProfile(CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        var hasActiveBookings = await dbContext.ServiceOrders
            .AnyAsync(o => o.StartTime > DateTime.UtcNow && o.Status != OrderStatus.Cancelled &&
                (o.SeekerId == user.Id || o.ProviderId == user.Id), cancellationToken);

        if (hasActiveBookings)
        {
            return Conflict(new { error = "You have upcoming bookings. Cancel them before deleting your account." });
        }

        user.Delete();

        var sessions = await dbContext.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var session in sessions) session.Revoke();

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
