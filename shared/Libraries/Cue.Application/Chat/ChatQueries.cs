using Cue.Application.Abstractions;
using Cue.Domain;
using MediatR;

namespace Cue.Application.Chat;

public sealed record ChatMessageDto(
    Guid Id,
    Guid OrderId,
    Guid SenderId,
    string Content,
    DateTime SentAt,
    bool IsRead,
    MessageType MessageType);

public sealed record GetOrderMessagesQuery(Guid OrderId, Guid UserId, int Limit = 50, int Offset = 0) : IRequest<IReadOnlyList<ChatMessageDto>>;

public sealed class GetOrderMessagesQueryHandler(
    IChatRepository chatRepository,
    IBookingRepository bookingRepository) : IRequestHandler<GetOrderMessagesQuery, IReadOnlyList<ChatMessageDto>>
{
    public async Task<IReadOnlyList<ChatMessageDto>> Handle(GetOrderMessagesQuery query, CancellationToken cancellationToken)
    {
        var order = await bookingRepository.GetByIdAsync(query.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking not found.");

        if (order.ProviderId != query.UserId && order.SeekerId != query.UserId)
        {
            throw new UnauthorizedAccessException("Only booking participants can view messages.");
        }

        var messages = await chatRepository.GetOrderMessagesAsync(query.OrderId, query.Limit, query.Offset, cancellationToken);
        return messages.Select(m => new ChatMessageDto(m.Id, m.OrderId, m.SenderId, m.Content, m.SentAt, m.IsRead, m.MessageType)).ToArray();
    }
}

public sealed record GetUnreadCountQuery(Guid UserId, Guid OrderId) : IRequest<int>;

public sealed class GetUnreadCountQueryHandler(IChatRepository repository) : IRequestHandler<GetUnreadCountQuery, int>
{
    public async Task<int> Handle(GetUnreadCountQuery query, CancellationToken cancellationToken)
    {
        return await repository.GetUnreadCountAsync(query.UserId, query.OrderId, cancellationToken);
    }
}
