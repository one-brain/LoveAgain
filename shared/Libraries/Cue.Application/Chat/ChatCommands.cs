using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Chat;

public sealed record SendChatMessageRequest(string Content, MessageType MessageType = MessageType.Text);

public sealed record SendMessageCommand(
    Guid OrderId,
    Guid SenderId,
    string Content,
    MessageType MessageType = MessageType.Text) : IRequest<ChatMessageDto>;

public sealed class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(c => c.OrderId).NotEmpty();
        RuleFor(c => c.SenderId).NotEmpty();
        RuleFor(c => c.Content).NotEmpty().MaximumLength(2000);
    }
}

public sealed class SendMessageCommandHandler(
    IChatRepository chatRepository,
    IBookingRepository bookingRepository) : IRequestHandler<SendMessageCommand, ChatMessageDto>
{
    public async Task<ChatMessageDto> Handle(SendMessageCommand command, CancellationToken cancellationToken)
    {
        var order = await bookingRepository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking not found.");

        if (order.ProviderId != command.SenderId && order.SeekerId != command.SenderId)
        {
            throw new UnauthorizedAccessException("Only booking participants can send messages.");
        }

        var message = new ChatMessage(command.OrderId, command.SenderId, command.Content, command.MessageType);
        await chatRepository.AddAsync(message, cancellationToken);
        await chatRepository.SaveChangesAsync(cancellationToken);

        return new ChatMessageDto(
            message.Id,
            message.OrderId,
            message.SenderId,
            message.Content,
            message.SentAt,
            message.IsRead,
            message.MessageType);
    }
}

public sealed record MarkMessagesAsReadCommand(Guid OrderId, Guid UserId) : IRequest<Unit>;

public sealed class MarkMessagesAsReadCommandValidator : AbstractValidator<MarkMessagesAsReadCommand>
{
    public MarkMessagesAsReadCommandValidator()
    {
        RuleFor(c => c.OrderId).NotEmpty();
        RuleFor(c => c.UserId).NotEmpty();
    }
}

public sealed class MarkMessagesAsReadCommandHandler(IChatRepository repository) : IRequestHandler<MarkMessagesAsReadCommand, Unit>
{
    public async Task<Unit> Handle(MarkMessagesAsReadCommand command, CancellationToken cancellationToken)
    {
        await repository.MarkMessagesAsReadAsync(command.OrderId, command.UserId, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
