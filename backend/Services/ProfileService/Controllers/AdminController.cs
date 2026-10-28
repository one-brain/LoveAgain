using System.Security.Claims;
using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ProfileService.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize]
public sealed class AdminController(CueDbContext dbContext) : ControllerBase
{
    private async Task<bool> IsAdminAsync(CancellationToken cancellationToken = default)
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return false;
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
            User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin"))
        {
            return true;
        }

        if (TryGetUserId(out var userId))
        {
            var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user != null && user.Roles.Contains(UserRole.Admin)) return true;
        }

        var email = User.FindFirstValue(ClaimTypes.Email);
        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalized = email.Trim().ToLowerInvariant();
            var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email.ToLower() == normalized, cancellationToken);
            if (user != null && user.Roles.Contains(UserRole.Admin)) return true;
        }

        return false;
    }

    private bool TryGetUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(userIdClaim, out userId);
    }

    [HttpGet("verifications")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminVerificationItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminVerificationItemResponse>>> GetVerifications(
        [FromQuery] VerificationStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 200,
        CancellationToken cancellationToken = default)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();

        var query = dbContext.ProviderProfiles
            .AsNoTracking()
            .Join(dbContext.Users.AsNoTracking(),
                p => p.UserId,
                u => u.Id,
                (p, u) => new { p, u });

        if (status.HasValue)
        {
            query = query.Where(x => x.p.Status == status.Value);
        }

        var items = await query
            .OrderByDescending(x => x.p.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 500))
            .Take(Math.Clamp(pageSize, 1, 500))
            .Select(x => new AdminVerificationItemResponse(
                x.p.Id,
                x.u.Id,
                $"{x.u.FirstName} {x.u.LastName}".Trim(),
                x.u.Email,
                x.u.Phone,
                x.u.PhotoUrl,
                x.p.HourlyRate,
                x.p.Bio,
                x.p.Specialties,
                x.p.Status,
                x.p.IdProofUrl,
                x.p.SelfieVerificationUrl,
                x.p.RejectionReason,
                x.p.CreatedAt,
                x.p.ReviewedAt,
                x.p.DisplayName,
                x.p.ProfileImages
            ))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpPost("verifications/{profileId:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveApplication(
        Guid profileId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();
        TryGetUserId(out var adminId);

        var profile = await dbContext.ProviderProfiles
            .SingleOrDefaultAsync(p => p.Id == profileId, cancellationToken);
        if (profile == null) return NotFound(new { error = "Companion profile not found." });

        profile.Approve(adminId);

        var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Id == profile.UserId, cancellationToken);
        if (user != null)
        {
            user.PromoteToVerifiedCompanion();
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Companion profile successfully verified and published.", status = "Approved" });
    }

    [HttpPost("verifications/{profileId:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectApplication(
        Guid profileId,
        [FromBody] RejectApplicationRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();
        TryGetUserId(out var adminId);

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new { error = "A rejection reason is required." });
        }

        var profile = await dbContext.ProviderProfiles
            .SingleOrDefaultAsync(p => p.Id == profileId, cancellationToken);
        if (profile == null) return NotFound(new { error = "Companion profile not found." });

        profile.Reject(adminId, request.Reason);

        var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Id == profile.UserId, cancellationToken);
        if (user != null)
        {
            user.RevokeCompanionRole();
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Companion application rejected.", reason = request.Reason, status = "Rejected" });
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminUserItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminUserItemResponse>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 200,
        CancellationToken cancellationToken = default)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();

        var query = dbContext.Users.AsNoTracking().Where(u => u.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u => u.FirstName.ToLower().Contains(s) || u.LastName.ToLower().Contains(s) || u.Email.ToLower().Contains(s));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 500))
            .Take(Math.Clamp(pageSize, 1, 500))
            .ToListAsync(cancellationToken);

        var userIds = users.Select(u => u.Id).ToList();
        var profiles = await dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(p => userIds.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId, cancellationToken);

        var result = users.Select(u =>
        {
            var hasProfile = profiles.TryGetValue(u.Id, out var prof);
            return new AdminUserItemResponse(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Phone,
                u.PhotoUrl,
                u.IsVerified,
                u.TrustScore,
                u.Roles.Select(r => r.ToString()).ToList(),
                hasProfile,
                hasProfile ? prof!.Status : null,
                u.CreatedAt
            );
        }).ToList();

        return Ok(result);
    }

    [HttpGet("verifications/{profileId:guid}")]
    [ProducesResponseType(typeof(AdminVerificationDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminVerificationDetailResponse>> GetVerificationDetail(
        Guid profileId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.Id == profileId, cancellationToken);
        if (profile == null) return NotFound(new { error = "Verification application not found." });

        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == profile.UserId, cancellationToken);

        return Ok(new AdminVerificationDetailResponse(
            profile.Id,
            profile.UserId,
            user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Applicant",
            user?.Email ?? "N/A",
            user?.Phone,
            user?.PhotoUrl,
            profile.HourlyRate,
            profile.Bio,
            profile.Specialties,
            profile.Status,
            profile.IdProofUrl,
            profile.SelfieVerificationUrl,
            profile.RejectionReason,
            profile.CreatedAt,
            profile.ReviewedAt,
            profile.ReviewedByAdminId,
            profile.DisplayName,
            profile.ProfileImages
        ));
    }

    [HttpGet("bookings")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminBookingLedgerItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminBookingLedgerItemResponse>>> GetBookings(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 200,
        CancellationToken cancellationToken = default)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();

        var query = dbContext.ServiceOrders.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
        {
            query = query.Where(o => o.Status == orderStatus);
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 500))
            .Take(Math.Clamp(pageSize, 1, 500))
            .ToListAsync(cancellationToken);

        var userIds = orders.Select(o => o.SeekerId).Concat(orders.Select(o => o.ProviderId)).Distinct().ToList();
        var users = await dbContext.Users.AsNoTracking().Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, cancellationToken);

        var result = orders.Select(o =>
        {
            users.TryGetValue(o.SeekerId, out var seeker);
            users.TryGetValue(o.ProviderId, out var provider);
            return new AdminBookingLedgerItemResponse(
                o.Id,
                o.SeekerId,
                seeker != null ? $"{seeker.FirstName} {seeker.LastName}".Trim() : "Seeker",
                o.ProviderId,
                provider != null ? $"{provider.FirstName} {provider.LastName}".Trim() : "Provider",
                o.Status.ToString(),
                o.TotalAmount,
                o.PlatformFee,
                o.ProviderEarnings,
                o.StartTime,
                o.EndTime,
                o.CreatedAt
            );
        }).ToList();

        return Ok(result);
    }

    [HttpPost("users/{userId:guid}/toggle-suspend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleUserSuspend(
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync(cancellationToken)) return Forbid();

        var user = await dbContext.Users.IgnoreQueryFilters().SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null) return NotFound(new { error = "User not found." });

        if (user.Roles.Contains(UserRole.Admin) || string.Equals(user.Email, "admin@cue.local", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "Administrative superuser accounts cannot be suspended." });
        }

        bool isNowSuspended;
        if (user.TrustScore < 0)
        {
            user.Reinstate(50);
            isNowSuspended = false;
        }
        else
        {
            user.Suspend();
            isNowSuspended = true;

            // Also deactivate companion profile if exists and active so they do not show in discovery
            var profile = await dbContext.ProviderProfiles.SingleOrDefaultAsync(p => p.UserId == userId, cancellationToken);
            if (profile != null && profile.IsActive)
            {
                profile.Deactivate();
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(new { message = isNowSuspended ? "User account suspended." : "User account reinstated.", isSuspended = isNowSuspended, trustScore = user.TrustScore });
    }
}
