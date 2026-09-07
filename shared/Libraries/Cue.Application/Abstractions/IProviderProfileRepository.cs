using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IProviderProfileRepository
{
    Task<ProviderProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<ProviderProfile?> GetByProfileIdAsync(Guid profileId, CancellationToken cancellationToken);
    Task<IReadOnlyList<AvailabilitySlot>> GetSlotsAsync(Guid providerId, CancellationToken cancellationToken);
    Task AddAsync(ProviderProfile profile, CancellationToken cancellationToken);
    Task<AvailabilitySlot?> GetSlotAsync(Guid providerId, Guid slotId, CancellationToken cancellationToken);
    Task AddSlotAsync(AvailabilitySlot slot, CancellationToken cancellationToken);
    Task RemoveSlotAsync(AvailabilitySlot slot, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}