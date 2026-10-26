using System.Security.Claims;
using Cue.Application.Bookings;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Controllers;

[ApiController]
[Route("api/v1/bookings")]
public sealed class BookingsController(ISender sender) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(CreateBookingResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
    public async Task<IActionResult> Complete(Guid orderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        return await SendLifecycle(new CompleteOrderCommand(orderId, userId), cancellationToken);
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
        var role = User.FindFirstValue(ClaimTypes.Role)
            ?? Request.Headers["X-User-Role"].FirstOrDefault();
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
            User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin"))
        {
            return true;
        }

        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? Request.Headers["X-User-Email"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(email) && email.Trim().Equals("admin@cue.local", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? Request.Headers["X-User-Id"].FirstOrDefault();
        return Guid.TryParse(value, out userId);
    }

    public sealed record CheckInBookingRequest(string Pin);
    public sealed record CancelBookingRequest(string Reason);
}
