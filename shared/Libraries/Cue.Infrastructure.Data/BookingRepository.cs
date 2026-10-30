using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cue.Infrastructure.Data;

public sealed class BookingRepository(CueDbContext dbContext) : IBookingRepository
{
    public Task<AvailabilitySlot?> GetAvailableSlotAsync(Guid providerId, DateTime startTime, CancellationToken cancellationToken)
    {
        // Any free slot that *covers* the requested start works; requiring an
        // exact start-time match made UI bookings (which pick now+1h) fail
        // unless they happened to land on a slot boundary.
        return dbContext.AvailabilitySlots
            .Where(slot => slot.ProviderId == providerId && !slot.IsBooked && slot.StartTime <= startTime && slot.EndTime > startTime)
            .OrderBy(slot => slot.StartTime)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AvailabilitySlot>> GetFutureAvailableSlotsAsync(Guid providerId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        return await dbContext.AvailabilitySlots
            .AsNoTracking()
            .Where(slot => slot.ProviderId == providerId && !slot.IsBooked && slot.EndTime > now)
            .OrderBy(slot => slot.StartTime)
            .ToListAsync(cancellationToken);
    }

    public Task AddSlotAsync(AvailabilitySlot slot, CancellationToken cancellationToken) =>
        dbContext.AvailabilitySlots.AddAsync(slot, cancellationToken).AsTask();

    public Task<bool> HasOverlappingSlotAsync(Guid providerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken) =>
        dbContext.AvailabilitySlots.AnyAsync(
            slot => slot.ProviderId == providerId && slot.IsBooked && slot.StartTime < endTime && slot.EndTime > startTime,
            cancellationToken);

    public Task<AvailabilitySlot?> GetSlotByBookingAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.AvailabilitySlots
            .SingleOrDefaultAsync(slot => slot.BookingId == orderId, cancellationToken);
    }

    public Task<ServiceOrder?> GetByIdAsync(Guid orderId, CancellationToken cancellationToken) =>
        dbContext.ServiceOrders.SingleOrDefaultAsync(order => order.Id == orderId, cancellationToken);

    public async Task<IReadOnlyList<ServiceOrder>> GetForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.ServiceOrders
            .AsNoTracking()
            .Where(order => order.ProviderId == userId || order.SeekerId == userId)
            .OrderByDescending(order => order.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<decimal?> GetProviderHourlyRateAsync(Guid providerId, CancellationToken cancellationToken)
    {
        var profile = await dbContext.ProviderProfiles
            .AsNoTracking()
            .Where(p => p.UserId == providerId || p.Id == providerId)
            .Select(p => (decimal?)p.HourlyRate)
            .FirstOrDefaultAsync(cancellationToken);
        return profile;
    }

    public Task<ServiceOrder?> GetPendingOrderForSeekerAsync(Guid seekerId, Guid providerId, DateTime startTime, CancellationToken cancellationToken)
    {
        return dbContext.ServiceOrders
            .FirstOrDefaultAsync(
                order => order.SeekerId == seekerId &&
                         order.ProviderId == providerId &&
                         order.Status == OrderStatus.PendingPayment &&
                         order.StartTime == startTime,
                cancellationToken);
    }

    public async Task<IReadOnlyList<ProviderProfile>> GetAvailableProvidersAsync(string? specialty, decimal? maxHourlyRate, CancellationToken cancellationToken)
    {
        var query = dbContext.ProviderProfiles.AsNoTracking().Where(profile => profile.IsActive);
        if (!string.IsNullOrWhiteSpace(specialty)) query = query.Where(profile => profile.Specialties.Contains(specialty));
        if (maxHourlyRate.HasValue) query = query.Where(profile => profile.HourlyRate <= maxHourlyRate.Value);
        return await query.OrderByDescending(profile => profile.AverageRating).ToListAsync(cancellationToken);
    }

    public Task AddAsync(ServiceOrder order, CancellationToken cancellationToken)
    {
        return dbContext.ServiceOrders.AddAsync(order, cancellationToken).AsTask();
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    // Provider incoming / seeker outgoing history queries
    public async Task<IReadOnlyList<ServiceOrder>> GetProviderIncomingAsync(Guid providerId, CancellationToken cancellationToken) =>
        await dbContext.ServiceOrders
            .AsNoTracking()
            .Where(order => order.ProviderId == providerId)
            .OrderByDescending(order => order.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ServiceOrder>> GetSeekerOutgoingAsync(Guid seekerId, CancellationToken cancellationToken) =>
        await dbContext.ServiceOrders
            .AsNoTracking()
            .Where(order => order.SeekerId == seekerId)
            .OrderByDescending(order => order.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, BookingParticipantInfo>> GetParticipantsMetadataAsync(
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken)
    {
        var ids = userIds.Distinct().ToArray();
        if (ids.Length == 0)
        {
            return new Dictionary<Guid, BookingParticipantInfo>();
        }

        var users = await dbContext.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(u => ids.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        var profiles = await dbContext.ProviderProfiles
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(p => ids.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId, cancellationToken);

        var result = new Dictionary<Guid, BookingParticipantInfo>(ids.Length);
        foreach (var id in ids)
        {
            users.TryGetValue(id, out var user);
            profiles.TryGetValue(id, out var profile);

            var displayName = !string.IsNullOrWhiteSpace(profile?.DisplayName)
                ? profile.DisplayName!
                : (user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Verified Member");

            var photoUrl = profile?.ProfileImages.FirstOrDefault() ?? user?.PhotoUrl;
            var rating = profile != null && profile.AverageRating > 0 ? profile.AverageRating : (decimal?)null;
            var specialty = profile?.Specialties.FirstOrDefault();
            var isVerified = user?.IsVerified ?? (profile?.Status == VerificationStatus.Approved);

            result[id] = new BookingParticipantInfo(
                id,
                displayName,
                photoUrl,
                rating,
                specialty,
                isVerified);
        }

        return result;
    }
}
