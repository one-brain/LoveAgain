using Cue.Application.Abstractions;
using FluentValidation;
using MediatR;

namespace Cue.Application.Chat;

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
