using Cue.Application.Abstractions;
using Cue.Domain;
using FluentValidation;
using MediatR;

namespace Cue.Application.Profiles;

public sealed record CreateAvailabilitySlotCommand(Guid UserId, DateTime StartTime, DateTime EndTime) : IRequest<AvailabilitySlotSummary>;

public sealed record AvailabilitySlotSummary(Guid SlotId, Guid ProviderId, DateTime StartTime, DateTime EndTime, bool IsBooked);

public sealed class CreateAvailabilitySlotCommandValidator : AbstractValidator<CreateAvailabilitySlotCommand>
{
    public CreateAvailabilitySlotCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.EndTime).GreaterThan(command => command.StartTime);
        RuleFor(command => command.StartTime).GreaterThan(DateTime.UtcNow);
    }
}

public sealed class CreateAvailabilitySlotCommandHandler(IProviderProfileRepository repository)
    : IRequestHandler<CreateAvailabilitySlotCommand, AvailabilitySlotSummary>
{
    public async Task<AvailabilitySlotSummary> Handle(CreateAvailabilitySlotCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        // Overlapping free slots would let two seekers book the same hour twice
        // from the provider's perspective, so they are rejected up front.
        var slots = await repository.GetSlotsAsync(profile.UserId, cancellationToken);
        var overlaps = slots.Any(slot =>
            command.StartTime < slot.EndTime && command.EndTime > slot.StartTime);
        if (overlaps)
        {
            throw new InvalidOperationException("The slot overlaps an existing availability window.");
        }

        var slot = new AvailabilitySlot(profile.UserId, command.StartTime, command.EndTime);
        await repository.AddSlotAsync(slot, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return new AvailabilitySlotSummary(slot.Id, slot.ProviderId, slot.StartTime, slot.EndTime, slot.IsBooked);
    }
}

public sealed record DeleteAvailabilitySlotCommand(Guid UserId, Guid SlotId) : IRequest<Unit>;

public sealed record GetProviderSlotsQuery(Guid UserId) : IRequest<IReadOnlyList<AvailabilitySlotSummary>>;

public sealed class GetProviderSlotsQueryHandler(IProviderProfileRepository repository)
    : IRequestHandler<GetProviderSlotsQuery, IReadOnlyList<AvailabilitySlotSummary>>
{
    public async Task<IReadOnlyList<AvailabilitySlotSummary>> Handle(GetProviderSlotsQuery query, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(query.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        var slots = await repository.GetSlotsAsync(profile.UserId, cancellationToken);
        return slots.Select(slot => new AvailabilitySlotSummary(slot.Id, slot.ProviderId, slot.StartTime, slot.EndTime, slot.IsBooked)).ToArray();
    }
}

public sealed class DeleteAvailabilitySlotCommandValidator : AbstractValidator<DeleteAvailabilitySlotCommand>
{
    public DeleteAvailabilitySlotCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.SlotId).NotEmpty();
    }
}

public sealed class DeleteAvailabilitySlotCommandHandler(IProviderProfileRepository repository)
    : IRequestHandler<DeleteAvailabilitySlotCommand, Unit>
{
    public async Task<Unit> Handle(DeleteAvailabilitySlotCommand command, CancellationToken cancellationToken)
    {
        var profile = await repository.GetByUserIdAsync(command.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile was not found.");

        var slot = await repository.GetSlotAsync(profile.UserId, command.SlotId, cancellationToken);
        if (slot == null)
        {
            throw new KeyNotFoundException("Availability slot was not found.");
        }

        // Booked slots carry an existing commitment and must be cancelled via
        // the booking flow instead of silently removed from the calendar.
        if (slot.IsBooked)
        {
            throw new InvalidOperationException("A booked slot cannot be deleted. Cancel the booking first.");
        }

        await repository.RemoveSlotAsync(slot, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
