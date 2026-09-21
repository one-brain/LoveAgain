using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IBookingRepository
{
    Task<AvailabilitySlot?> GetAvailableSlotAsync(Guid providerId, DateTime startTime, CancellationToken cancellationToken);
    Task<AvailabilitySlot?> GetSlotByBookingAsync(Guid orderId, CancellationToken cancellationToken);
    Task<ServiceOrder?> GetByIdAsync(Guid orderId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ServiceOrder>> GetForUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ProviderProfile>> GetAvailableProvidersAsync(string? specialty, decimal? maxHourlyRate, CancellationToken cancellationToken);
    Task AddAsync(ServiceOrder order, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);

    // Provider incoming / seeker outgoing history queries
    Task<IReadOnlyList<ServiceOrder>> GetProviderIncomingAsync(Guid providerId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ServiceOrder>> GetSeekerOutgoingAsync(Guid seekerId, CancellationToken cancellationToken);
}