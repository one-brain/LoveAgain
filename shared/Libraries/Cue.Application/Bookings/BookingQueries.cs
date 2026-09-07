using System.Text.Json.Serialization;
using Cue.Application.Abstractions;
using Cue.Domain;
using MediatR;

namespace Cue.Application.Bookings;

// Status serializes as its name ("Confirmed") so the SPA can render badges
// directly without maintaining a numeric enum mapping.
public sealed record BookingSummary(
    Guid OrderId,
    Guid ProviderId,
    Guid SeekerId,
    DateTime StartTime,
    DateTime EndTime,
    [property: JsonConverter(typeof(JsonStringEnumConverter))] OrderStatus Status,
    decimal TotalAmount);

public sealed record GetUserBookingsQuery(Guid UserId) : IRequest<IReadOnlyList<BookingSummary>>;

public sealed class GetUserBookingsQueryHandler(IBookingRepository repository) : IRequestHandler<GetUserBookingsQuery, IReadOnlyList<BookingSummary>>
{
    public async Task<IReadOnlyList<BookingSummary>> Handle(GetUserBookingsQuery query, CancellationToken cancellationToken)
    {
        var orders = await repository.GetForUserAsync(query.UserId, cancellationToken);
        return orders.Select(order => new BookingSummary(order.Id, order.ProviderId, order.SeekerId, order.StartTime, order.EndTime, order.Status, order.TotalAmount)).ToArray();
    }
}

public sealed record ProviderSummary(Guid UserId, decimal HourlyRate, string Bio, IReadOnlyCollection<string> Specialties, decimal AverageRating, bool IsActive);

public sealed record GetAvailableProvidersQuery(string? Specialty, decimal? MaxHourlyRate) : IRequest<IReadOnlyList<ProviderSummary>>;

public sealed class GetAvailableProvidersQueryHandler(IBookingRepository repository) : IRequestHandler<GetAvailableProvidersQuery, IReadOnlyList<ProviderSummary>>
{
    public async Task<IReadOnlyList<ProviderSummary>> Handle(GetAvailableProvidersQuery query, CancellationToken cancellationToken)
    {
        var profiles = await repository.GetAvailableProvidersAsync(query.Specialty, query.MaxHourlyRate, cancellationToken);
        return profiles.Select(profile => new ProviderSummary(profile.UserId, profile.HourlyRate, profile.Bio, profile.Specialties, profile.AverageRating, profile.IsActive)).ToArray();
    }
}