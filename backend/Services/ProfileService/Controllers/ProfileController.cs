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
[Authorize]
public sealed class ProfileController(CueDbContext dbContext, IBlobStorage blobStorage) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> GetMyProfile(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        try
        {
            user.UpdateProfile(request.FirstName, request.LastName, request.Phone, request.DateOfBirth);
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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        const long maxBytes = 5 * 1024 * 1024; // 5MB, per F-02-04 acceptance criteria
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

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
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
        var objectName = $"{userId}/{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

        await using var stream = file.OpenReadStream();
        string photoUrl;
        try
        {
            photoUrl = await blobStorage.UploadAsync(objectName, stream, file.ContentType, cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Photo upload failed for user {userId}: {ex.Message}");
            return StatusCode(StatusCodes.Status502BadGateway, new { error = "Could not store the photo. Try again." });
        }

        // Replace the old photo reference; the previous blob is orphaned rather than
        // deleted so in-flight responses holding the old URL stay renderable.
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

    [HttpDelete("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteMyProfile(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token." });
        }

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null, cancellationToken);

        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        // Active bookings block deletion so providers are not left with ghost commitments.
        var hasActiveBookings = await dbContext.ServiceOrders
            .AnyAsync(o => o.StartTime > DateTime.UtcNow && o.Status != OrderStatus.Cancelled &&
                (o.SeekerId == userId || o.ProviderId == userId), cancellationToken);

        if (hasActiveBookings)
        {
            return Conflict(new { error = "You have upcoming bookings. Cancel them before deleting your account." });
        }

        user.Delete();

        // Signing out everywhere is part of deleting: kill every live session.
        var sessions = await dbContext.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var session in sessions) session.Revoke();

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
