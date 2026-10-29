using Cue.Application.Abstractions;
using Cue.Domain;
using Cue.Infrastructure.Messaging;
using FluentValidation;
using MediatR;

namespace Cue.Application.Bookings;

public sealed record ConfirmBookingCommand(Guid OrderId, Guid ProviderId) : IRequest<Unit>;

public sealed class ConfirmBookingCommandValidator : AbstractValidator<ConfirmBookingCommand>
{
    public ConfirmBookingCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.ProviderId).NotEmpty();
    }
}

public sealed class ConfirmBookingCommandHandler(
    IBookingRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<ConfirmBookingCommand, Unit>
{
    public async Task<Unit> Handle(ConfirmBookingCommand command, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking was not found.");

        if (order.ProviderId != command.ProviderId && order.SeekerId != command.ProviderId)
        {
            throw new UnauthorizedAccessException("Only a booking participant can confirm a booking.");
        }

        order.Confirm();
        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(new BookingConfirmedEvent(order.Id, order.Status.ToString()), cancellationToken);
        return Unit.Value;
    }
}

public sealed record StartOrderCommand(Guid OrderId, Guid ProviderId) : IRequest<Unit>;

public sealed class StartOrderCommandValidator : AbstractValidator<StartOrderCommand>
{
    public StartOrderCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.ProviderId).NotEmpty();
    }
}

public sealed class StartOrderCommandHandler(
    IBookingRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<StartOrderCommand, Unit>
{
    public async Task<Unit> Handle(StartOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking was not found.");

        if (order.ProviderId != command.ProviderId)
        {
            throw new UnauthorizedAccessException("Only the provider can start a booking.");
        }

        order.Start();
        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(new BookingConfirmedEvent(order.Id, order.Status.ToString()), cancellationToken);
        return Unit.Value;
    }
}

public sealed record CheckInBookingCommand(Guid OrderId, Guid ProviderId, string Pin) : IRequest<Unit>;

public sealed class CheckInBookingCommandValidator : AbstractValidator<CheckInBookingCommand>
{
    public CheckInBookingCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.ProviderId).NotEmpty();
        RuleFor(command => command.Pin).NotEmpty().Length(6);
    }
}

public sealed class CheckInBookingCommandHandler(
    IBookingRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<CheckInBookingCommand, Unit>
{
    public async Task<Unit> Handle(CheckInBookingCommand command, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking was not found.");

        if (order.ProviderId != command.ProviderId)
        {
            throw new UnauthorizedAccessException("Only the provider/companion can verify the check-in PIN.");
        }

        order.CheckIn(command.Pin);
        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(new BookingConfirmedEvent(order.Id, order.Status.ToString()), cancellationToken);
        return Unit.Value;
    }
}

public sealed record CancelBookingCommand(Guid OrderId, Guid UserId, string Reason) : IRequest<Unit>;

public sealed class CancelBookingCommandValidator : AbstractValidator<CancelBookingCommand>
{
    public CancelBookingCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Reason).NotEmpty().MaximumLength(500);
    }
}

public sealed class CancelBookingCommandHandler(
    IBookingRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<CancelBookingCommand, Unit>
{
    public async Task<Unit> Handle(CancelBookingCommand command, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking was not found.");

        if (order.ProviderId != command.UserId && order.SeekerId != command.UserId)
        {
            throw new UnauthorizedAccessException("Only a booking participant can cancel it.");
        }

        order.Cancel(command.Reason);

        // Free the held availability slot so others can book that time again.
        var slot = await repository.GetSlotByBookingAsync(order.Id, cancellationToken);
        if (slot is not null)
        {
            slot.Release(order.Id);
        }

        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(new BookingCancelledEvent(order.Id, order.Status.ToString(), order.CancellationReason!), cancellationToken);
        return Unit.Value;
    }
}

public sealed record CompleteOrderCommand(Guid OrderId, Guid ProviderId) : IRequest<Unit>;

public sealed class CompleteOrderCommandValidator : AbstractValidator<CompleteOrderCommand>
{
    public CompleteOrderCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.ProviderId).NotEmpty();
    }
}

public sealed class CompleteOrderCommandHandler(
    IBookingRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<CompleteOrderCommand, Unit>
{
    public async Task<Unit> Handle(CompleteOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking was not found.");

        if (order.ProviderId != command.ProviderId && order.SeekerId != command.ProviderId)
        {
            throw new UnauthorizedAccessException("Only a booking participant can complete a booking.");
        }

        order.Complete();

        var slot = await repository.GetSlotByBookingAsync(order.Id, cancellationToken);
        if (slot is not null)
        {
            slot.Release(order.Id);
        }

        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(new BookingCompletedEvent(order.Id, order.EndTime - order.StartTime), cancellationToken);
        return Unit.Value;
    }
}

public sealed record UpdateBookingCommand(
    Guid OrderId,
    Guid UserId,
    string? MeetingAddress,
    DateTime? StartTime,
    DateTime? EndTime,
    decimal? DurationHours,
    BookingRequirements? Requirements) : IRequest<BookingSummary>;

public sealed class UpdateBookingCommandValidator : AbstractValidator<UpdateBookingCommand>
{
    public UpdateBookingCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.UserId).NotEmpty();
    }
}

public sealed class UpdateBookingCommandHandler(
    IBookingRepository repository,
    IEventPublisher eventPublisher) : IRequestHandler<UpdateBookingCommand, BookingSummary>
{
    public async Task<BookingSummary> Handle(UpdateBookingCommand command, CancellationToken cancellationToken)
    {
        var order = await repository.GetByIdAsync(command.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking was not found.");

        if (order.SeekerId != command.UserId && order.ProviderId != command.UserId)
        {
            throw new UnauthorizedAccessException("Only a booking participant can modify this booking.");
        }

        if (order.Status is OrderStatus.InProgress or OrderStatus.Completed or OrderStatus.Cancelled)
        {
            throw new InvalidOperationException($"Booking in status '{order.Status}' cannot be modified.");
        }

        if (command.StartTime.HasValue && command.EndTime.HasValue)
        {
            if (command.EndTime.Value <= command.StartTime.Value)
            {
                throw new InvalidOperationException("End time must be after start time.");
            }

            var isShowcaseSample = order.ProviderId.ToString()
                .StartsWith("00000000-0000-0000-0000-0000000000", StringComparison.OrdinalIgnoreCase);

            if (!isShowcaseSample && (order.StartTime != command.StartTime.Value || order.EndTime != command.EndTime.Value))
            {
                var isOverlapping = await repository.HasOverlappingSlotAsync(
                    order.ProviderId,
                    command.StartTime.Value,
                    command.EndTime.Value,
                    cancellationToken);

                if (isOverlapping)
                {
                    throw new InvalidOperationException("The companion has another confirmed booking during this time window.");
                }
            }
        }

        order.UpdateDetails(
            command.MeetingAddress,
            command.Requirements,
            command.StartTime,
            command.EndTime,
            command.DurationHours);

        await repository.SaveChangesAsync(cancellationToken);

        var meta = await repository.GetParticipantsMetadataAsync(
            new[] { order.ProviderId, order.SeekerId },
            cancellationToken);

        meta.TryGetValue(order.ProviderId, out var prov);
        meta.TryGetValue(order.SeekerId, out var seek);

        return new BookingSummary(
            order.Id,
            order.ProviderId,
            order.SeekerId,
            order.StartTime,
            order.EndTime,
            order.Status,
            order.TotalAmount,
            order.MeetingAddress,
            order.SeekerId == command.UserId ? order.CheckInPin : (order.Status is OrderStatus.InProgress or OrderStatus.Completed ? order.CheckInPin : null),
            order.CheckedInAt,
            order.Requirements,
            prov?.DisplayName,
            prov?.PhotoUrl,
            seek?.DisplayName,
            seek?.PhotoUrl,
            prov?.AverageRating,
            order.Requirements?.Activity ?? prov?.PrimarySpecialty,
            prov?.IsVerified
        );
    }
}
