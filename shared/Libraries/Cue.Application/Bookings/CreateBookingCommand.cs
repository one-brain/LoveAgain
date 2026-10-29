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
    string? MeetingAddress,
    BookingRequirements? Requirements = null) : IRequest<CreateBookingResult>;

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
        RuleFor(command => command.StartTime).GreaterThan(DateTime.UtcNow.AddHours(-12));
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
        // Check if an existing pending booking already exists for this seeker & provider & time
        // to prevent duplicate entries from retries or concurrent clicks
        var existingPending = await bookingRepository.GetPendingOrderForSeekerAsync(
            command.SeekerId,
            command.ProviderId,
            command.StartTime,
            cancellationToken);

        if (existingPending is not null)
        {
            existingPending.UpdateDetails(
                command.MeetingAddress,
                command.Requirements,
                command.StartTime,
                command.EndTime,
                command.DurationHours);

            await bookingRepository.SaveChangesAsync(cancellationToken);
            return new CreateBookingResult(existingPending.Id, existingPending.TotalAmount, existingPending.Status);
        }

        var isShowcaseSampleProvider = command.ProviderId.ToString()
            .StartsWith("00000000-0000-0000-0000-0000000000", StringComparison.OrdinalIgnoreCase);

        AvailabilitySlot? slot = null;
        if (!isShowcaseSampleProvider)
        {
            slot = await bookingRepository.GetAvailableSlotAsync(command.ProviderId, command.StartTime, cancellationToken);
            if (slot is null)
            {
                var isOverlapping = await bookingRepository.HasOverlappingSlotAsync(
                    command.ProviderId,
                    command.StartTime,
                    command.EndTime,
                    cancellationToken);

                if (isOverlapping)
                {
                    throw new InvalidOperationException("The companion has another confirmed booking during this time window.");
                }

                slot = new AvailabilitySlot(command.ProviderId, command.StartTime, command.EndTime);
                await bookingRepository.AddSlotAsync(slot, cancellationToken);
            }
        }

        // Enforce authoritative provider hourly rate from DB to prevent client price tampering
        var authoritativeRate = await bookingRepository.GetProviderHourlyRateAsync(command.ProviderId, cancellationToken);
        var effectiveRate = authoritativeRate.HasValue && authoritativeRate.Value > 0
            ? authoritativeRate.Value
            : command.HourlyRate;

        var totalAmount = decimal.Round(effectiveRate * command.DurationHours, 2);
        var platformFee = decimal.Round(totalAmount * 0.15m, 2);
        var order = new ServiceOrder(
            command.ProviderId,
            command.SeekerId,
            command.StartTime,
            command.EndTime,
            totalAmount,
            platformFee,
            command.MeetingAddress,
            command.Requirements);

        slot?.Hold(order.Id);
        await bookingRepository.AddAsync(order, cancellationToken);
        await bookingRepository.SaveChangesAsync(cancellationToken);
        await eventPublisher.PublishAsync(
            new BookingCreatedEvent(order.Id, order.ProviderId, order.SeekerId, order.StartTime, order.EndTime, order.TotalAmount),
            cancellationToken);

        return new CreateBookingResult(order.Id, order.TotalAmount, order.Status);
    }
}
