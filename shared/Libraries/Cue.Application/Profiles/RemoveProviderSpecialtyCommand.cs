using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record RemoveProviderSpecialtyCommand(Guid UserId, string Specialty) : IRequest<Unit>;

public sealed class RemoveProviderSpecialtyCommandValidator : AbstractValidator<RemoveProviderSpecialtyCommand>
{
    public RemoveProviderSpecialtyCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Specialty)
            .NotEmpty()
            .MaximumLength(100)
            .Must(s => !string.IsNullOrWhiteSpace(s))
            .WithMessage("Specialty is required.");
    }
}

public sealed class RemoveProviderSpecialtyCommandHandler(IProviderProfileRepository repository)
    : IRequestHandler<RemoveProviderSpecialtyCommand, Unit>
{
    public async Task<Unit> Handle(RemoveProviderSpecialtyCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        profile.RemoveSpecialty(command.Specialty.Trim());
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}