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
[Authorize]
public sealed class ProviderProfileController(CueDbContext dbContext, ISender sender) : ControllerBase
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

        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            return NotFound(new { error = "No provider profile yet. Create one first." });
        }

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
            userId, request.HourlyRate, request.Bio ?? string.Empty, request.Specialties, request.MaxRadiusKm);

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

    private bool TryGetUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out userId);
    }

    private static ProviderProfileResponse ToResponse(ProviderProfile profile) =>
        new(profile.Id, profile.UserId, profile.HourlyRate, profile.Bio, profile.Specialties,
            profile.MaxRadiusKm, profile.IntroVideoUrl, profile.IsActive, profile.AverageRating,
            profile.CreatedAt, profile.UpdatedAt);
}
