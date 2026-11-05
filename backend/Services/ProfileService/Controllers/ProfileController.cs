using System.Security.Claims;
using Cue.Domain;
using Cue.Infrastructure.Data;
using Cue.Infrastructure.Email;
using Cue.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ProfileService.Controllers;

[ApiController]
[Route("api/v1/profiles")]
public sealed class ProfileController(
    CueDbContext dbContext,
    IBlobStorage blobStorage,
    IMemoryCache cache,
    IHostEnvironment environment,
    IEmailSender emailSender) : ControllerBase
{
    private static UserProfileResponse MapUserProfile(User user) => new(
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
        user.UpdatedAt,
        user.Gender,
        user.IsEmailVerified,
        user.IsPhoneVerified
    );
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

        return Ok(MapUserProfile(user));
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
            user.UpdateProfile(firstName, request.LastName, request.Phone, parsedDob, request.Gender);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Ok(MapUserProfile(user));
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

        return Ok(MapUserProfile(user));
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

        return Ok(MapUserProfile(user));
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
    [HttpPost("me/email/send-otp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendEmailOtp(CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        var normalizedEmail = user.Email.Trim().ToLowerInvariant();

        // Invalidate prior active OTPs for this user and email
        var priorOtps = await dbContext.VerificationOtps
            .Where(o => o.Target == normalizedEmail && o.Purpose == OtpPurposes.EmailVerification && o.UsedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var old in priorOtps)
        {
            old.Invalidate();
        }

        var otp = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 999999).ToString("D6");
        var expiresAt = DateTime.UtcNow.AddMinutes(10);

        var verificationOtp = new VerificationOtp(
            user.Id,
            normalizedEmail,
            otp,
            OtpPurposes.EmailVerification,
            expiresAt);

        dbContext.VerificationOtps.Add(verificationOtp);
        await dbContext.SaveChangesAsync(cancellationToken);

        var cacheKey = $"profile_email_otp_{user.Id}";
        cache.Set(cacheKey, otp, TimeSpan.FromMinutes(10));
        Console.WriteLine($"[EMAIL-OTP] Generated and saved OTP for user {user.Email}: {otp}");

        // Send email via Mailjet
        try
        {
            var subject = $"{otp} is your Cue verification code";
            var textBody = $"""
                Hi {user.FirstName},

                Your Cue email verification code is: {otp}

                This code will expire in 10 minutes.

                If you did not request this verification code, you can safely ignore this email.

                — The Cue Team
                """;

            var htmlBody = $"""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <title>Cue Verification Code</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <tr>
                      <td style="padding: 32px 40px; background-color: #881337; text-align: left;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #FAF7F2; letter-spacing: -0.5px;">Cue</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1c1917;">Confirm your email address</h2>
                        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: #44403c;">
                          Hi {user.FirstName},<br><br>
                          Use the one-time verification code below to verify your email address. This code is valid for <strong>10 minutes</strong>.
                        </p>
                        <div style="background-color: #FAF7F2; border: 1px solid #e7e5e4; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                          <span style="font-family: 'JetBrains Mono', monospace, Courier; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #881337; display: inline-block;">
                            {otp}
                          </span>
                        </div>
                        <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.5; color: #78716c;">
                          If you did not request this verification code, please ignore this email or contact support if you suspect unauthorized activity.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 40px; background-color: #FAF7F2; border-top: 1px solid #e7e5e4; text-align: center; font-size: 12px; color: #a8a29e;">
                        &copy; {DateTime.UtcNow.Year} Cue. All rights reserved.
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """;

            await emailSender.SendAsync(new EmailMessage(user.Email, subject, textBody, htmlBody), cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL-OTP] Failed to send email to {user.Email}: {ex.Message}");
        }

        return Ok(new
        {
            message = $"Verification code sent to {user.Email}",
            expiresInSeconds = 600,
            devOtp = environment.IsDevelopment() ? otp : null
        });
    }

    [Authorize]
    [HttpPost("me/email/verify-otp")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> VerifyEmailOtp(
        [FromBody] VerifyOtpRequest request,
        CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new { error = "Verification OTP code is required." });
        }

        var normalizedEmail = user.Email.Trim().ToLowerInvariant();
        var otpRecord = await dbContext.VerificationOtps
            .Where(o => o.Target == normalizedEmail && o.Purpose == OtpPurposes.EmailVerification && o.UsedAt == null)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        bool isValid = false;
        if (otpRecord != null)
        {
            isValid = otpRecord.Verify(request.Otp);
        }

        var cacheKey = $"profile_email_otp_{user.Id}";
        if (!isValid && cache.TryGetValue<string>(cacheKey, out var expectedOtp) && expectedOtp == request.Otp.Trim())
        {
            isValid = true;
        }

        if (!isValid)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return BadRequest(new { error = "Invalid or expired verification code." });
        }

        cache.Remove(cacheKey);
        user.VerifyEmail();
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapUserProfile(user));
    }

    [Authorize]
    [HttpPost("me/phone/send-otp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendPhoneOtp(CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        if (string.IsNullOrWhiteSpace(user.Phone))
        {
            return BadRequest(new { error = "Please provide and save your mobile phone number first." });
        }

        var normalizedPhone = user.Phone.Trim();

        // Invalidate prior active OTPs
        var priorOtps = await dbContext.VerificationOtps
            .Where(o => o.Target == normalizedPhone.ToLowerInvariant() && o.Purpose == OtpPurposes.PhoneVerification && o.UsedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var old in priorOtps)
        {
            old.Invalidate();
        }

        var otp = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 999999).ToString("D6");
        var expiresAt = DateTime.UtcNow.AddMinutes(5);

        var verificationOtp = new VerificationOtp(
            user.Id,
            normalizedPhone,
            otp,
            OtpPurposes.PhoneVerification,
            expiresAt);

        dbContext.VerificationOtps.Add(verificationOtp);
        await dbContext.SaveChangesAsync(cancellationToken);

        var cacheKey = $"profile_phone_otp_{user.Id}";
        cache.Set(cacheKey, otp, TimeSpan.FromMinutes(5));
        Console.WriteLine($"[PHONE-OTP] Generated and saved OTP for phone {user.Phone}: {otp}");

        return Ok(new
        {
            message = $"SMS verification code sent to {user.Phone}",
            expiresInSeconds = 300,
            devOtp = environment.IsDevelopment() ? otp : null
        });
    }

    [Authorize]
    [HttpPost("me/phone/verify-otp")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> VerifyPhoneOtp(
        [FromBody] VerifyOtpRequest request,
        CancellationToken cancellationToken)
    {
        var user = await ResolveUserAsync(cancellationToken);
        if (user == null)
        {
            return NotFound(new { error = "User profile not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new { error = "Verification OTP code is required." });
        }

        var normalizedPhone = (user.Phone ?? string.Empty).Trim().ToLowerInvariant();
        var otpRecord = await dbContext.VerificationOtps
            .Where(o => o.Target == normalizedPhone && o.Purpose == OtpPurposes.PhoneVerification && o.UsedAt == null)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        bool isValid = false;
        if (otpRecord != null)
        {
            isValid = otpRecord.Verify(request.Otp);
        }

        var cacheKey = $"profile_phone_otp_{user.Id}";
        if (!isValid && cache.TryGetValue<string>(cacheKey, out var expectedOtp) && expectedOtp == request.Otp.Trim())
        {
            isValid = true;
        }

        if (!isValid)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return BadRequest(new { error = "Invalid or expired SMS verification code." });
        }

        cache.Remove(cacheKey);
        user.VerifyPhone();
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapUserProfile(user));
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
