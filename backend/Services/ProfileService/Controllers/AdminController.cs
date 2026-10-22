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
    [HttpGet("verifications")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminVerificationItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminVerificationItemResponse>>> GetVerifications(
        [FromQuery] VerificationStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        if (!IsAdmin()) return Forbid();

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
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
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
                x.p.ReviewedAt
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
        if (!IsAdmin()) return Forbid();
        TryGetUserId(out var adminId);

        var profile = await dbContext.ProviderProfiles
            .SingleOrDefaultAsync(p => p.Id == profileId, cancellationToken);
        if (profile == null) return NotFound(new { error = "Companion profile not found." });

        profile.Approve(adminId);

        // Also add Provider role to the user if not already present
        var user = await dbContext.Users.SingleOrDefaultAsync(u => u.Id == profile.UserId, cancellationToken);
        if (user != null && !user.Roles.Contains(UserRole.Provider))
        {
            user.AddRole(UserRole.Provider);
            user.Verify();
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
        if (!IsAdmin()) return Forbid();
        TryGetUserId(out var adminId);

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new { error = "A rejection reason is required." });
        }

        var profile = await dbContext.ProviderProfiles
            .SingleOrDefaultAsync(p => p.Id == profileId, cancellationToken);
        if (profile == null) return NotFound(new { error = "Companion profile not found." });

        profile.Reject(adminId, request.Reason);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Companion application rejected.", reason = request.Reason, status = "Rejected" });
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminUserItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AdminUserItemResponse>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        if (!IsAdmin()) return Forbid();

        var query = dbContext.Users.AsNoTracking().Where(u => u.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u => u.FirstName.ToLower().Contains(s) || u.LastName.ToLower().Contains(s) || u.Email.ToLower().Contains(s));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
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

    private bool IsAdmin()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        return string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
               User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
    }

    private bool TryGetUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out userId);
    }
}
