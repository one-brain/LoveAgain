using System.Security.Claims;
using Cue.Application.Bookings;
using Cue.Infrastructure.Data;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingService.Controllers;

[ApiController]
[Route("api/v1/bookings")]
public sealed class BookingsController(ISender sender, CueDbContext dbContext) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(CreateBookingResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CreateBookingResult>> Create(
        [FromBody] CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        if (IsAdmin())
        {
            return BadRequest(new { error = "Platform administrators are not permitted to create companion bookings." });
        }

        // The seeker is always taken from the authenticated session, never from the body.
        if (!TryGetUserId(out var seekerId))
        {
            return Unauthorized();
        }

        var seeker = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == seekerId && u.DeletedAt == null, cancellationToken);

        if (seeker is null || !seeker.IsVerified)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                error = "Identity verification is required before you can book companions. Please submit your identity card in your Profile.",
                code = "KYC_VERIFICATION_REQUIRED"
            });
        }

        try
        {
            var result = await sender.Send(command with { SeekerId = seekerId }, cancellationToken);
            return CreatedAtAction(nameof(Create), new { bookingId = result.OrderId }, result);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { error = exception.Message });
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { error = string.Join(" ", exception.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<BookingSummary>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BookingSummary>>> GetMine(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var bookings = await sender.Send(new GetUserBookingsQuery(userId), cancellationToken);
        return Ok(bookings);
    }

    [HttpGet("provider/incoming/{providerId}")]
    [ProducesResponseType(typeof(IReadOnlyList<BookingSummary>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<BookingSummary>>> GetProviderIncoming(
        string providerId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(providerId, out var providerGuid))
        {
            return BadRequest(new { error = "Invalid provider ID." });
        }

        var bookings = await sender.Send(new GetProviderIncomingBookingsQuery(userId, providerGuid), cancellationToken);
        return Ok(bookings);
    }

    [HttpGet("seeker/outgoing/{seekerId}")]
    [ProducesResponseType(typeof(IReadOnlyList<BookingSummary>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<BookingSummary>>> GetSeekerOutgoing(
        string seekerId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(seekerId, out var seekerGuid))
        {
            return BadRequest(new { error = "Invalid seeker ID." });
        }

        var bookings = await sender.Send(new GetSeekerOutgoingBookingsQuery(userId, seekerGuid), cancellationToken);
        return Ok(bookings);
    }

    [HttpPut("{orderId:guid}")]
    [HttpPatch("{orderId:guid}")]
    [ProducesResponseType(typeof(BookingSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<BookingSummary>> Update(
        Guid orderId,
        [FromBody] UpdateBookingRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var command = new UpdateBookingCommand(
                orderId,
                userId,
                request.MeetingAddress,
                request.StartTime,
                request.EndTime,
                request.DurationHours,
                request.Requirements);

            var result = await sender.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Booking was not found." });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Only a booking participant can modify this booking." });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { error = exception.Message });
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { error = string.Join(" ", exception.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    [HttpPatch("{orderId:guid}/confirm")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Confirm(Guid orderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        return await SendLifecycle(new ConfirmBookingCommand(orderId, userId), cancellationToken);
    }

    [HttpPatch("{orderId:guid}/checkin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CheckIn(
        Guid orderId,
        [FromBody] CheckInBookingRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        return await SendLifecycle(new CheckInBookingCommand(orderId, userId, request.Pin), cancellationToken);
    }

    [HttpPatch("{orderId:guid}/start")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Start(Guid orderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        return await SendLifecycle(new StartOrderCommand(orderId, userId), cancellationToken);
    }

    [HttpPatch("{orderId:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Complete(
        Guid orderId,
        [FromBody] CompleteBookingRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        return await SendLifecycle(new CompleteOrderCommand(orderId, userId, request.CompletionPin), cancellationToken);
    }

    [HttpPost("{orderId:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Cancel(
        Guid orderId,
        [FromBody] CancelBookingRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        return await SendLifecycle(new CancelBookingCommand(orderId, userId, request.Reason), cancellationToken);
    }

    private async Task<IActionResult> SendLifecycle(IRequest<Unit> command, CancellationToken cancellationToken)
    {
        try
        {
            await sender.Send(command, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { error = exception.Message });
        }
        catch (ValidationException exception)
        {
            return BadRequest(new { error = string.Join(" ", exception.Errors.Select(e => e.ErrorMessage)) });
        }
    }

    private bool IsAdmin()
    {
        if (User.Identity?.IsAuthenticated != true) return false;
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
            User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin"))
        {
            return true;
        }

        var email = User.FindFirstValue(ClaimTypes.Email);
        if (!string.IsNullOrWhiteSpace(email) && email.Trim().Equals("admin@cue.local", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    private bool TryGetUserId(out Guid userId)
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            userId = Guid.Empty;
            return false;
        }
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(value, out userId);
    }

    public sealed record CheckInBookingRequest(string Pin);
    public sealed record CompleteBookingRequest(string CompletionPin);
    public sealed record CancelBookingRequest(string Reason);
    public sealed record UpdateBookingRequest(
        string? MeetingAddress,
        DateTime? StartTime,
        DateTime? EndTime,
        decimal? DurationHours,
        Cue.Domain.BookingRequirements? Requirements);
}
