using Cue.Application.Abstractions;
using Cue.Domain;
using Cue.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Cue.Infrastructure.Data;

public sealed class ChatRepository(CueDbContext dbContext) : IChatRepository
{
    public async Task<IReadOnlyList<ChatMessage>> GetOrderMessagesAsync(Guid orderId, int limit, int offset, CancellationToken cancellationToken)
    {
        return await dbContext.ChatMessages
            .Where(m => m.OrderId == orderId)
            .OrderBy(m => m.SentAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, Guid orderId, CancellationToken cancellationToken)
    {
        return await dbContext.ChatMessages
            .CountAsync(m => m.OrderId == orderId && m.SenderId != userId && !m.IsRead, cancellationToken);
    }

    public async Task MarkMessagesAsReadAsync(Guid orderId, Guid userId, CancellationToken cancellationToken)
    {
        await dbContext.ChatMessages
            .Where(m => m.OrderId == orderId && m.SenderId != userId && !m.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true), cancellationToken);
    }

    public Task AddAsync(ChatMessage message, CancellationToken cancellationToken)
    {
        return dbContext.ChatMessages.AddAsync(message, cancellationToken).AsTask();
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    // NEW: Check if order has a captured payment
    public async Task<bool> HasPaidAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return await dbContext.PaymentTransactions
            .Where(pt => pt.OrderId == orderId && pt.Status == TransactionStatus.Captured)
            .AnyAsync(cancellationToken);
    }
}