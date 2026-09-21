using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record AddProviderSpecialtyCommand(Guid UserId, string Specialty) : IRequest<Unit>;

public sealed class AddProviderSpecialtyCommandValidator : AbstractValidator<AddProviderSpecialtyCommand>
{
    public AddProviderSpecialtyCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Specialty)
            .NotEmpty()
            .MaximumLength(100)
            .Must(s => !string.IsNullOrWhiteSpace(s))
            .WithMessage("Specialty cannot be empty or whitespace.");
    }
}

public sealed class AddProviderSpecialtyCommandHandler(IProviderProfileRepository repository)
    : IRequestHandler<AddProviderSpecialtyCommand, Unit>
{
    public async Task<Unit> Handle(AddProviderSpecialtyCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        profile.AddSpecialty(command.Specialty.Trim());
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}