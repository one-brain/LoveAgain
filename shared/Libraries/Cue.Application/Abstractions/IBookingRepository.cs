using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IBookingRepository
{
    Task<AvailabilitySlot?> GetAvailableSlotAsync(Guid providerId, DateTime startTime, CancellationToken cancellationToken);
    Task AddSlotAsync(AvailabilitySlot slot, CancellationToken cancellationToken);
    Task<bool> HasOverlappingSlotAsync(Guid providerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken);
    Task<AvailabilitySlot?> GetSlotByBookingAsync(Guid orderId, CancellationToken cancellationToken);
    Task<ServiceOrder?> GetByIdAsync(Guid orderId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ServiceOrder>> GetForUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<decimal?> GetProviderHourlyRateAsync(Guid providerId, CancellationToken cancellationToken);
    Task<ServiceOrder?> GetPendingOrderForSeekerAsync(Guid seekerId, Guid providerId, DateTime startTime, CancellationToken cancellationToken);
    Task<IReadOnlyList<ProviderProfile>> GetAvailableProvidersAsync(string? specialty, decimal? maxHourlyRate, CancellationToken cancellationToken);
    Task AddAsync(ServiceOrder order, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);

    // Provider incoming / seeker outgoing history queries
    Task<IReadOnlyList<ServiceOrder>> GetProviderIncomingAsync(Guid providerId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ServiceOrder>> GetSeekerOutgoingAsync(Guid seekerId, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, BookingParticipantInfo>> GetParticipantsMetadataAsync(IEnumerable<Guid> userIds, CancellationToken cancellationToken);
}

public sealed record BookingParticipantInfo(
    Guid UserId,
    string DisplayName,
    string? PhotoUrl,
    decimal? AverageRating,
    string? PrimarySpecialty,
    bool IsVerified);
