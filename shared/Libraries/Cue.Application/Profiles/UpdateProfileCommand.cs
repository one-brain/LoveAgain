using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record UpdateProfileCommand(Guid UserId, decimal HourlyRate, string Bio, IReadOnlyCollection<string> Specialties, decimal MaxRadiusKm) : IRequest<Unit>;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.HourlyRate).GreaterThan(0);
        RuleFor(command => command.MaxRadiusKm).GreaterThan(0);
        RuleFor(command => command.Bio).MaximumLength(4000);
        RuleFor(command => command.Specialties).NotEmpty();
    }
}

public sealed class UpdateProfileCommandHandler(IProviderProfileRepository repository) : IRequestHandler<UpdateProfileCommand, Unit>
{
    public async Task<Unit> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");
        profile.Update(command.HourlyRate, command.Bio, command.Specialties, command.MaxRadiusKm);
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}