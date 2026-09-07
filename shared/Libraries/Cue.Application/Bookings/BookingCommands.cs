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

        if (order.ProviderId != command.ProviderId)
        {
            throw new UnauthorizedAccessException("Only the provider can confirm a booking.");
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

        if (order.ProviderId != command.ProviderId)
        {
            throw new UnauthorizedAccessException("Only the provider can complete a booking.");
        }

        order.Complete();
        await repository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(new BookingCompletedEvent(order.Id, order.EndTime - order.StartTime), cancellationToken);
        return Unit.Value;
    }
}