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
        if (User.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

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
            ?? User.FindFirst("email")?.Value;

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

    [Authorize]
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
        var buffer = ms.ToArray();

        string photoUrl;
        try
        {
            using var uploadStream = new MemoryStream(buffer);
            var uploadTask = blobStorage.UploadAsync(objectName, uploadStream, file.ContentType, cancellationToken);
            var completedTask = await Task.WhenAny(uploadTask, Task.Delay(1500, cancellationToken));
            if (completedTask == uploadTask)
            {
                photoUrl = await uploadTask;
            }
            else
            {
                var base64 = Convert.ToBase64String(buffer);
                photoUrl = $"data:{file.ContentType};base64,{base64}";
            }
        }
        catch
        {
            var base64 = Convert.ToBase64String(buffer);
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

    [Authorize]
    [HttpGet("me/kyc")]
    [ProducesResponseType(typeof(UserKycResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserKycResponse>> GetMyKyc(CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        var kyc = await dbContext.UserKycDocuments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.UserId == user.Id, cancellationToken);

        if (kyc == null)
        {
            return Ok(new UserKycResponse(
                null,
                user.Id,
                null,
                null,
                null,
                null,
                null,
                KycStatus.NotSubmitted.ToString(),
                null,
                null,
                null
            ));
        }

        return Ok(new UserKycResponse(
            kyc.Id,
            kyc.UserId,
            kyc.DocumentType,
            MaskDocumentNumber(kyc.DocumentNumber),
            kyc.FrontImageUrl,
            kyc.BackImageUrl,
            kyc.SelfieImageUrl,
            kyc.Status.ToString(),
            kyc.RejectionReason,
            kyc.SubmittedAt,
            kyc.ReviewedAt
        ));
    }

    [Authorize]
    [HttpPost("me/kyc")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UserKycResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserKycResponse>> SubmitMyKyc(
        [FromForm] SubmitKycRequest request,
        CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        if (string.IsNullOrWhiteSpace(request.DocumentType))
        {
            return BadRequest(new { error = "Document type is required." });
        }
        if (string.IsNullOrWhiteSpace(request.DocumentNumber))
        {
            return BadRequest(new { error = "Document number is required." });
        }

        if (request.FrontImage == null || request.FrontImage.Length == 0)
        {
            return BadRequest(new { error = "Front image of document is required." });
        }
        if (!IsValidImageFile(request.FrontImage))
        {
            return BadRequest(new { error = "Front image must be a JPEG, PNG, or WebP image under 5MB." });
        }

        if (request.BackImage == null || request.BackImage.Length == 0)
        {
            return BadRequest(new { error = "Back image of document is required." });
        }
        if (!IsValidImageFile(request.BackImage))
        {
            return BadRequest(new { error = "Back image must be a JPEG, PNG, or WebP image under 5MB." });
        }

        if (request.SelfieImage == null || request.SelfieImage.Length == 0)
        {
            return BadRequest(new { error = "Selfie image is required." });
        }
        if (!IsValidImageFile(request.SelfieImage))
        {
            return BadRequest(new { error = "Selfie image must be a JPEG, PNG, or WebP image under 5MB." });
        }

        var existing = await dbContext.UserKycDocuments
            .FirstOrDefaultAsync(d => d.UserId == user.Id, cancellationToken);

        if (existing != null && existing.Status == KycStatus.Approved)
        {
            return BadRequest(new { error = "Your identity verification has already been approved." });
        }

        var frontTask = UploadKycFileAsync(user.Id, request.FrontImage!, "front", cancellationToken);
        var backTask = UploadKycFileAsync(user.Id, request.BackImage!, "back", cancellationToken);
        var selfieTask = UploadKycFileAsync(user.Id, request.SelfieImage!, "selfie", cancellationToken);

        await Task.WhenAll(frontTask, backTask, selfieTask);

        var frontUrl = await frontTask;
        var backUrl = await backTask;
        var selfieUrl = await selfieTask;

        if (existing != null)
        {
            existing.Resubmit(request.DocumentType, request.DocumentNumber, frontUrl, backUrl, selfieUrl);
        }
        else
        {
            existing = new UserKycDocument(
                user.Id,
                request.DocumentType,
                request.DocumentNumber,
                frontUrl,
                backUrl,
                selfieUrl);
            dbContext.UserKycDocuments.Add(existing);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new UserKycResponse(
            existing.Id,
            existing.UserId,
            existing.DocumentType,
            MaskDocumentNumber(existing.DocumentNumber),
            existing.FrontImageUrl,
            existing.BackImageUrl,
            existing.SelfieImageUrl,
            existing.Status.ToString(),
            existing.RejectionReason,
            existing.SubmittedAt,
            existing.ReviewedAt
        ));
    }

    private static bool IsValidImageFile(IFormFile? file)
    {
        if (file == null || file.Length == 0 || file.Length > 5 * 1024 * 1024) return false;
        var permittedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (permittedTypes.Contains(file.ContentType)) return true;
        var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        return ext is ".jpg" or ".jpeg" or ".png" or ".webp";
    }

    private static string MaskDocumentNumber(string documentNumber)
    {
        if (string.IsNullOrWhiteSpace(documentNumber)) return string.Empty;
        var trimmed = documentNumber.Trim();
        if (trimmed.Length <= 4) return trimmed;
        var visible = trimmed[^4..];
        var maskedPrefix = new string('•', trimmed.Length - 4);
        return $"{maskedPrefix}{visible}";
    }

    private async Task<string> UploadKycFileAsync(Guid userId, IFormFile file, string filePrefix, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        if (string.IsNullOrEmpty(extension))
        {
            extension = file.ContentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".jpg"
            };
        }
        var contentType = file.ContentType;
        if (contentType == "application/octet-stream" || string.IsNullOrWhiteSpace(contentType))
        {
            contentType = extension switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };
        }
        var objectName = $"kyc/{userId}/{filePrefix}_{Guid.NewGuid():N}{extension}";

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms, cancellationToken);
        var buffer = ms.ToArray();

        try
        {
            using var uploadStream = new MemoryStream(buffer);
            var uploadTask = blobStorage.UploadAsync(objectName, uploadStream, contentType, cancellationToken);
            var completedTask = await Task.WhenAny(uploadTask, Task.Delay(1500, cancellationToken));
            if (completedTask == uploadTask)
            {
                return await uploadTask;
            }
        }
        catch
        {
            // S3 upload failed or timed out; fall back to base64 Data URL
        }

        var base64 = Convert.ToBase64String(buffer);
        return $"data:{contentType};base64,{base64}";
    }
}

public sealed class SubmitKycRequest
{
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public IFormFile? FrontImage { get; set; }
    public IFormFile? BackImage { get; set; }
    public IFormFile? SelfieImage { get; set; }
}
