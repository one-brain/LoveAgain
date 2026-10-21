using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record DeleteProviderProfileCommand(Guid UserId) : IRequest<Unit>;

public sealed class DeleteProviderProfileCommandValidator : AbstractValidator<DeleteProviderProfileCommand>
{
    public DeleteProviderProfileCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
    }
}

public sealed class DeleteProviderProfileCommandHandler(IProviderProfileRepository repository) : IRequestHandler<DeleteProviderProfileCommand, Unit>
{
    public async Task<Unit> Handle(DeleteProviderProfileCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        profile.Delete();
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
