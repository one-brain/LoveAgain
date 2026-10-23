using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record UpdateProfileCommand(
    Guid UserId,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm,
    string? IntroVideoUrl = null) : IRequest<Unit>;

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
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken);
        if (profile == null)
        {
            profile = new ProviderProfile(
                command.UserId,
                command.HourlyRate,
                command.Bio ?? string.Empty,
                command.Specialties,
                command.MaxRadiusKm > 0 ? command.MaxRadiusKm : 50,
                command.IntroVideoUrl
            );
            await repository.AddAsync(profile, cancellationToken);
        }
        else
        {
            profile.Update(command.HourlyRate, command.Bio ?? string.Empty, command.Specialties, command.MaxRadiusKm, command.IntroVideoUrl);
        }
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
