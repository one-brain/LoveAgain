using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cue.Infrastructure.Data;

public sealed class ProviderProfileRepository(CueDbContext dbContext) : IProviderProfileRepository
{
    public Task<ProviderProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.ProviderProfiles.SingleOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

    public Task<ProviderProfile?> GetByProfileIdAsync(Guid profileId, CancellationToken cancellationToken) =>
        dbContext.ProviderProfiles.SingleOrDefaultAsync(profile => profile.Id == profileId, cancellationToken);

    public async Task<IReadOnlyList<AvailabilitySlot>> GetSlotsAsync(Guid providerId, CancellationToken cancellationToken) =>
        await dbContext.AvailabilitySlots
            .AsNoTracking()
            .Where(slot => slot.ProviderId == providerId)
            .OrderBy(slot => slot.StartTime)
            .ToListAsync(cancellationToken);

    public Task AddAsync(ProviderProfile profile, CancellationToken cancellationToken) =>
        dbContext.ProviderProfiles.AddAsync(profile, cancellationToken).AsTask();

    public Task<AvailabilitySlot?> GetSlotAsync(Guid providerId, Guid slotId, CancellationToken cancellationToken) =>
        dbContext.AvailabilitySlots.SingleOrDefaultAsync(slot => slot.ProviderId == providerId && slot.Id == slotId, cancellationToken);

    public Task AddSlotAsync(AvailabilitySlot slot, CancellationToken cancellationToken) =>
        dbContext.AvailabilitySlots.AddAsync(slot, cancellationToken).AsTask();

    public Task RemoveSlotAsync(AvailabilitySlot slot, CancellationToken cancellationToken)
    {
        dbContext.AvailabilitySlots.Remove(slot);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    public async Task AddSpecialtyAsync(Guid providerId, string specialty, CancellationToken cancellationToken)
    {
        var profile = await dbContext.ProviderProfiles.SingleOrDefaultAsync(
            p => p.Id == providerId || p.UserId == providerId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile not found.");
        profile.AddSpecialty(specialty);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveSpecialtyAsync(Guid providerId, string specialty, CancellationToken cancellationToken)
    {
        var profile = await dbContext.ProviderProfiles.SingleOrDefaultAsync(
            p => p.Id == providerId || p.UserId == providerId, cancellationToken)
            ?? throw new KeyNotFoundException("Provider profile not found.");
        profile.RemoveSpecialty(specialty);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
