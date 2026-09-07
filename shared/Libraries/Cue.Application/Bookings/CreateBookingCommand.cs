using Cue.Application.Abstractions;
using Cue.Domain;
using Cue.Infrastructure.Messaging;
using FluentValidation;
using MediatR;

namespace Cue.Application.Bookings;

public sealed record CreateBookingCommand(
    Guid ProviderId,
    Guid SeekerId,
    DateTime StartTime,
    DateTime EndTime,
    decimal HourlyRate,
    decimal DurationHours,
    string? MeetingAddress) : IRequest<CreateBookingResult>;

public sealed record CreateBookingResult(
    Guid OrderId,
    decimal TotalAmount,
    [property: System.Text.Json.Serialization.JsonConverter(typeof(System.Text.Json.Serialization.JsonStringEnumConverter))] OrderStatus Status);

public sealed class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(command => command.ProviderId).NotEmpty();
        RuleFor(command => command.SeekerId).NotEmpty().NotEqual(command => command.ProviderId);
        RuleFor(command => command.EndTime).GreaterThan(command => command.StartTime);
        RuleFor(command => command.StartTime).GreaterThan(DateTime.UtcNow);
        RuleFor(command => command.HourlyRate).GreaterThan(0);
        RuleFor(command => command.DurationHours).GreaterThan(0);
    }
}

public sealed class CreateBookingCommandHandler(
    IBookingRepository bookingRepository,
    IEventPublisher eventPublisher) : IRequestHandler<CreateBookingCommand, CreateBookingResult>
{
    public async Task<CreateBookingResult> Handle(CreateBookingCommand command, CancellationToken cancellationToken)
    {
        var slot = await bookingRepository.GetAvailableSlotAsync(command.ProviderId, command.StartTime, cancellationToken)
            ?? throw new InvalidOperationException("The requested availability slot is no longer available.");

        var totalAmount = decimal.Round(command.HourlyRate * command.DurationHours, 2);
        var platformFee = decimal.Round(totalAmount * 0.15m, 2);
        var order = new ServiceOrder(
            command.ProviderId,
            command.SeekerId,
            command.StartTime,
            command.EndTime,
            totalAmount,
            platformFee,
            command.MeetingAddress);

        slot.Hold(order.Id);
        await bookingRepository.AddAsync(order, cancellationToken);
        await bookingRepository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(
            new BookingCreatedEvent(order.Id, order.ProviderId, order.SeekerId, order.StartTime, order.EndTime, order.TotalAmount),
            cancellationToken);

        return new CreateBookingResult(order.Id, order.TotalAmount, order.Status);
    }
}