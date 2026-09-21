using System.Security.Claims;
using Cue.Application.Chat;
using Cue.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatService.Controllers;

[ApiController]
[Route("api/v1/chat")]
[Authorize]
public sealed class ChatController(ISender sender, ChatRepository chatRepository) : ControllerBase
{
    [HttpGet("orders/{orderId:guid}/messages")]
    [ProducesResponseType(typeof(IReadOnlyList<ChatMessageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ChatMessageDto>>> GetMessages(
        Guid orderId,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!await chatRepository.HasPaidAsync(orderId, cancellationToken))
        {
            return Forbid("Chat is only available for paid bookings.");
        }

        try
        {
            var messages = await sender.Send(new GetOrderMessagesQuery(orderId, userId, limit, offset), cancellationToken);
            return Ok(messages);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("orders/{orderId:guid}/unread-count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<ActionResult<int>> GetUnreadCount(Guid orderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!await chatRepository.HasPaidAsync(orderId, cancellationToken))
        {
            return Forbid("Chat is only available for paid bookings.");
        }

        var count = await sender.Send(new GetUnreadCountQuery(userId, orderId), cancellationToken);
        return Ok(count);
    }

    [HttpPost("orders/{orderId:guid}/mark-read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAsRead(Guid orderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!await chatRepository.HasPaidAsync(orderId, cancellationToken))
        {
            return Forbid("Chat is only available for paid bookings.");
        }

        await sender.Send(new MarkMessagesAsReadCommand(orderId, userId), cancellationToken);
        return NoContent();
    }

    [HttpGet("orders/{orderId:guid}/is-paid")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> IsPaid(Guid orderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!await chatRepository.HasPaidAsync(orderId, cancellationToken))
        {
            return Forbid("Chat is only available for paid bookings.");
        }

        return Ok(true);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out userId);
    }
}
