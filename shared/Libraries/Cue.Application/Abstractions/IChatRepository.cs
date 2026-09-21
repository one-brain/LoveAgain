using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IChatRepository
{
    Task<IReadOnlyList<ChatMessage>> GetOrderMessagesAsync(Guid orderId, int limit, int offset, CancellationToken cancellationToken);
    Task<int> GetUnreadCountAsync(Guid userId, Guid orderId, CancellationToken cancellationToken);
    Task MarkMessagesAsReadAsync(Guid orderId, Guid userId, CancellationToken cancellationToken);
    Task AddAsync(ChatMessage message, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task<bool> HasPaidAsync(Guid orderId, CancellationToken cancellationToken);
}
