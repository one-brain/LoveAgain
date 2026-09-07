using Cue.Application.Abstractions;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record SetProviderProfileStatusCommand(Guid UserId, bool IsActive) : IRequest<Unit>;

public sealed class SetProviderProfileStatusCommandValidator : AbstractValidator<SetProviderProfileStatusCommand>
{
    public SetProviderProfileStatusCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
    }
}

public sealed class SetProviderProfileStatusCommandHandler(IProviderProfileRepository repository)
    : IRequestHandler<SetProviderProfileStatusCommand, Unit>
{
    public async Task<Unit> Handle(SetProviderProfileStatusCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        if (command.IsActive)
        {
            profile.Activate();
        }
        else
        {
            profile.Deactivate();
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
