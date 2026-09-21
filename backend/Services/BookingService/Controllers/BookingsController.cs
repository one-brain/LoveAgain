using System.Security.Claims;
using Cue.Application.Bookings;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Controllers;

[ApiController]
[Route("api/v1/bookings")]
[Authorize]
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

    [HttpGet("provider/incoming")]
    [ProducesResponseType(typeof(IReadOnlyList<BookingSummary>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<BookingSummary>>> GetProviderIncoming(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var bookings = await sender.Send(new GetProviderIncomingBookingsQuery(userId), cancellationToken);
        return Ok(bookings);
    }

    [HttpGet("seeker/outgoing")]
    [ProducesResponseType(typeof(IReadOnlyList<BookingSummary>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<BookingSummary>>> GetSeekerOutgoing(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var bookings = await sender.Send(new GetSeekerOutgoingBookingsQuery(userId), cancellationToken);
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

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out userId);
    }

    public sealed record CancelBookingRequest(string Reason);
}
