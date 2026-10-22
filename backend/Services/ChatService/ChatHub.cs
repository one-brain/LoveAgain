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
        await EnsureAuthorizedParticipantAndPaidOrderAsync(orderId, userId, "join this chat", cancellationToken);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(orderId), cancellationToken);
    }

    public async Task SendMessage(Guid orderId, string content, MessageType messageType = MessageType.Text, CancellationToken cancellationToken = default)
    {
        var senderId = GetUserId();
        await EnsureAuthorizedParticipantAndPaidOrderAsync(orderId, senderId, "send messages", cancellationToken);

        var message = new ChatMessage(orderId, senderId, content, messageType);
        dbContext.ChatMessages.Add(message);
        await dbContext.SaveChangesAsync(cancellationToken);
        await Clients.Group(GroupName(orderId)).SendAsync("ReceiveMessage", new { message.Id, message.OrderId, message.SenderId, message.Content, message.SentAt, message.MessageType }, cancellationToken);
    }

    private async Task<ServiceOrder> EnsureAuthorizedParticipantAndPaidOrderAsync(
        Guid orderId,
        Guid userId,
        string actionDescription,
        CancellationToken cancellationToken)
    {
        var order = await dbContext.ServiceOrders.SingleOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        if (order == null || (order.ProviderId != userId && order.SeekerId != userId))
        {
            throw new HubException($"Only booking participants can {actionDescription}.");
        }

        var hasPaid = order.Status != OrderStatus.PendingPayment ||
            await dbContext.EscrowHolds.AnyAsync(e => e.OrderId == orderId && e.Status != EscrowStatus.Refunded, cancellationToken) ||
            await dbContext.PaymentTransactions.AnyAsync(pt => pt.OrderId == orderId && pt.Status == TransactionStatus.Captured, cancellationToken);

        if (!hasPaid)
        {
            throw new HubException("Chat is only available for paid bookings.");
        }

        return order;
    }

    private Guid GetUserId() => Guid.TryParse(Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? Context.User?.FindFirstValue(ClaimTypes.Name), out var userId)
        ? userId
        : throw new HubException("A valid user identity is required.");

    private static string GroupName(Guid orderId) => $"order:{orderId}";
}
