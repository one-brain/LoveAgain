namespace Cue.Infrastructure.Messaging;

public interface IEventPublisher
{
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class;
}

public interface IEventHandler<in TEvent>
    where TEvent : class
{
    Task HandleAsync(TEvent @event, CancellationToken cancellationToken);
}

public sealed record UserRegisteredEvent(Guid UserId, string Email, string Role);
public sealed record ProfileCreatedEvent(Guid ProviderId, decimal HourlyRate, IReadOnlyCollection<string> Specialties);
public sealed record BookingCreatedEvent(Guid OrderId, Guid ProviderId, Guid SeekerId, DateTime StartTime, DateTime EndTime, decimal Amount);
public sealed record BookingConfirmedEvent(Guid OrderId, string Status);
public sealed record BookingCancelledEvent(Guid OrderId, string Status, string Reason);
public sealed record BookingCompletedEvent(Guid OrderId, TimeSpan Duration);
public sealed record PaymentProcessedEvent(Guid OrderId, decimal Amount, string Status);
public sealed record ReviewSubmittedEvent(Guid OrderId, int Rating, Guid RevieweeId);
public sealed record TrustScoreUpdatedEvent(Guid UserId, int NewScore, int Delta);
public sealed record NewMessageEvent(Guid RecipientId, Guid OrderId, string MessagePreview);