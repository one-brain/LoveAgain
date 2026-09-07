using Cue.Application.Abstractions;
using Cue.Domain;
using Cue.Infrastructure.Messaging;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record CreateProviderProfileCommand(
    Guid UserId,
    decimal HourlyRate,
    string Bio,
    IReadOnlyCollection<string> Specialties,
    decimal MaxRadiusKm) : IRequest<CreateProviderProfileResult>;

public sealed record CreateProviderProfileResult(Guid ProfileId, decimal HourlyRate, bool IsActive);

public sealed class CreateProviderProfileCommandValidator : AbstractValidator<CreateProviderProfileCommand>
{
    public CreateProviderProfileCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.HourlyRate).GreaterThan(0);
        RuleFor(command => command.MaxRadiusKm).GreaterThan(0);
        RuleFor(command => command.Bio).MaximumLength(4000);
        RuleFor(command => command.Specialties).NotEmpty();
    }
}

public sealed class CreateProviderProfileCommandHandler(
    IProviderProfileRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<CreateProviderProfileCommand, CreateProviderProfileResult>
{
    public async Task<CreateProviderProfileResult> Handle(CreateProviderProfileCommand command, CancellationToken cancellationToken)
    {
        // One profile per user is enforced by a unique index; check first so the
        // caller gets a clean conflict instead of a database exception.
        var existing = await repository.GetByUserIdAsync(command.UserId, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException("A provider profile already exists for this user.");
        }

        var profile = new ProviderProfile(
            command.UserId, command.HourlyRate, command.Bio, command.Specialties);

        if (command.MaxRadiusKm > 0)
        {
            profile.Update(command.HourlyRate, command.Bio, command.Specialties, command.MaxRadiusKm);
        }

        await repository.AddAsync(profile, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(
            new ProfileCreatedEvent(profile.UserId, profile.HourlyRate, profile.Specialties),
            cancellationToken);

        return new CreateProviderProfileResult(profile.Id, profile.HourlyRate, profile.IsActive);
    }
}
