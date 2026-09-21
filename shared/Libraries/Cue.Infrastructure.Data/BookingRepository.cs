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

    public Task<AvailabilitySlot?> GetSlotByBookingAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.AvailabilitySlots
            .SingleOrDefaultAsync(slot => slot.BookingId == orderId, cancellationToken);
    }

    public Task<ServiceOrder?> GetByIdAsync(Guid orderId, CancellationToken cancellationToken) =>
        dbContext.ServiceOrders.SingleOrDefaultAsync(order => order.Id == orderId, cancellationToken);

    public async Task<IReadOnlyList<ServiceOrder>> GetForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.ServiceOrders
            .Where(order => order.ProviderId == userId || order.SeekerId == userId)
            .OrderByDescending(order => order.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ProviderProfile>> GetAvailableProvidersAsync(string? specialty, decimal? maxHourlyRate, CancellationToken cancellationToken)
    {
        var query = dbContext.ProviderProfiles.Where(profile => profile.IsActive);
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
            .Where(order => order.ProviderId == providerId)
            .OrderByDescending(order => order.StartTime)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ServiceOrder>> GetSeekerOutgoingAsync(Guid seekerId, CancellationToken cancellationToken) =>
        await dbContext.ServiceOrders
            .Where(order => order.SeekerId == seekerId)
            .OrderByDescending(order => order.StartTime)
            .ToListAsync(cancellationToken);
}