using System.Security.Claims;
using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatService;

[Authorize]
public sealed class ChatHub(CueDbContext dbContext) : Hub
{
    public async Task JoinOrder(Guid orderId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var isParticipant = await dbContext.ServiceOrders.AnyAsync(order => order.Id == orderId && (order.ProviderId == userId || order.SeekerId == userId), cancellationToken);
        if (!isParticipant) throw new HubException("Only booking participants can join this chat.");

        var hasPaid = await dbContext.PaymentTransactions
            .Where(pt => pt.OrderId == orderId && pt.Status == TransactionStatus.Captured)
            .AnyAsync(cancellationToken);
        if (!hasPaid) throw new HubException("Chat is only available for paid bookings.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(orderId), cancellationToken);
    }

    public async Task SendMessage(Guid orderId, string content, MessageType messageType = MessageType.Text, CancellationToken cancellationToken = default)
    {
        var senderId = GetUserId();

        var isParticipant = await dbContext.ServiceOrders.AnyAsync(order => order.Id == orderId && (order.ProviderId == senderId || order.SeekerId == senderId), cancellationToken);
        if (!isParticipant) throw new HubException("Only booking participants can send messages.");

        var hasPaid = await dbContext.PaymentTransactions
            .Where(pt => pt.OrderId == orderId && pt.Status == TransactionStatus.Captured)
            .AnyAsync(cancellationToken);
        if (!hasPaid) throw new HubException("Chat is only available for paid bookings.");

        var message = new ChatMessage(orderId, senderId, content, messageType);
        dbContext.ChatMessages.Add(message);
        await dbContext.SaveChangesAsync(cancellationToken);
        await Clients.Group(GroupName(orderId)).SendAsync("ReceiveMessage", new { message.Id, message.OrderId, message.SenderId, message.Content, message.SentAt, message.MessageType }, cancellationToken);
    }

    private Guid GetUserId() => Guid.TryParse(Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? Context.User?.FindFirstValue(ClaimTypes.Name), out var userId)
        ? userId
        : throw new HubException("A valid user identity is required.");

    private static string GroupName(Guid orderId) => $"order:{orderId}";
}
