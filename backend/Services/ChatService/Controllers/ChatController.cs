using System.Security.Claims;
using Cue.Application.Chat;
using Cue.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatService.Controllers;

[ApiController]
[Route("api/v1/chat")]
[Authorize]
public sealed class ChatController(
    ISender sender,
    ChatRepository chatRepository,
    IHubContext<ChatHub> hubContext) : ControllerBase
{
    [HttpPost("orders/{orderId:guid}/messages")]
    [ProducesResponseType(typeof(ChatMessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatMessageDto>> SendMessage(
        Guid orderId,
        [FromBody] SendChatMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (!await chatRepository.HasPaidAsync(orderId, cancellationToken))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Chat is only available for paid bookings." });
        }

        try
        {
            var message = await sender.Send(new SendMessageCommand(orderId, userId, request.Content, request.MessageType), cancellationToken);

            await hubContext.Clients.Group($"order:{orderId}").SendAsync("ReceiveMessage", new
            {
                message.Id,
                message.OrderId,
                message.SenderId,
                message.Content,
                message.SentAt,
                message.MessageType
            }, cancellationToken);

            return CreatedAtAction(nameof(GetMessages), new { orderId }, message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

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
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Chat is only available for paid bookings." });
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
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Chat is only available for paid bookings." });
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
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Chat is only available for paid bookings." });
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
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Chat is only available for paid bookings." });
        }

        return Ok(true);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out userId);
    }
}
