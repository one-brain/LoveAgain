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
    decimal TotalAmount,
    string? MeetingAddress = null,
    string? CheckInPin = null,
    DateTime? CheckedInAt = null,
    BookingRequirements? Requirements = null,
    string? ProviderName = null,
    string? ProviderPhoto = null,
    string? SeekerName = null,
    string? SeekerPhoto = null,
    decimal? AverageRating = null,
    string? Specialty = null,
    bool? IsVerified = null);

public sealed record GetUserBookingsQuery(Guid UserId) : IRequest<IReadOnlyList<BookingSummary>>;

public sealed class GetUserBookingsQueryHandler(IBookingRepository repository) : IRequestHandler<GetUserBookingsQuery, IReadOnlyList<BookingSummary>>
{
    public async Task<IReadOnlyList<BookingSummary>> Handle(GetUserBookingsQuery query, CancellationToken cancellationToken)
    {
        var orders = await repository.GetForUserAsync(query.UserId, cancellationToken);
        var meta = await repository.GetParticipantsMetadataAsync(
            orders.SelectMany(o => new[] { o.ProviderId, o.SeekerId }),
            cancellationToken);

        return orders.Select(order =>
        {
            meta.TryGetValue(order.ProviderId, out var prov);
            meta.TryGetValue(order.SeekerId, out var seek);
            return new BookingSummary(
                order.Id,
                order.ProviderId,
                order.SeekerId,
                order.StartTime,
                order.EndTime,
                order.Status,
                order.TotalAmount,
                order.MeetingAddress,
                order.SeekerId == query.UserId ? order.CheckInPin : (order.Status is OrderStatus.InProgress or OrderStatus.Completed ? order.CheckInPin : null),
                order.CheckedInAt,
                order.Requirements,
                prov?.DisplayName,
                prov?.PhotoUrl,
                seek?.DisplayName,
                seek?.PhotoUrl,
                prov?.AverageRating,
                order.Requirements?.Activity ?? prov?.PrimarySpecialty,
                prov?.IsVerified
            );
        }).ToArray();
    }
}

// Provider incoming / seeker outgoing queries — separated for history views
public sealed record GetProviderIncomingBookingsQuery(Guid UserId, Guid ProviderId) : IRequest<IReadOnlyList<BookingSummary>>;

public sealed class GetProviderIncomingBookingsQueryHandler(IBookingRepository repository)
    : IRequestHandler<GetProviderIncomingBookingsQuery, IReadOnlyList<BookingSummary>>
{
    public async Task<IReadOnlyList<BookingSummary>> Handle(GetProviderIncomingBookingsQuery query, CancellationToken cancellationToken)
    {
        // Authorization check: validate that the providerId belongs to the requesting user
        if (query.ProviderId != query.UserId)
        {
            throw new UnauthorizedAccessException("You can only access your own provider bookings.");
        }

        var orders = await repository.GetProviderIncomingAsync(query.ProviderId, cancellationToken);
        var meta = await repository.GetParticipantsMetadataAsync(
            orders.SelectMany(o => new[] { o.ProviderId, o.SeekerId }),
            cancellationToken);

        return orders.Select(order =>
        {
            meta.TryGetValue(order.ProviderId, out var prov);
            meta.TryGetValue(order.SeekerId, out var seek);
            return new BookingSummary(
                order.Id,
                order.ProviderId,
                order.SeekerId,
                order.StartTime,
                order.EndTime,
                order.Status,
                order.TotalAmount,
                order.MeetingAddress,
                order.Status is OrderStatus.InProgress or OrderStatus.Completed ? order.CheckInPin : null,
                order.CheckedInAt,
                order.Requirements,
                prov?.DisplayName,
                prov?.PhotoUrl,
                seek?.DisplayName,
                seek?.PhotoUrl,
                prov?.AverageRating,
                order.Requirements?.Activity ?? prov?.PrimarySpecialty,
                prov?.IsVerified
            );
        }).ToArray();
    }
}

public sealed record GetSeekerOutgoingBookingsQuery(Guid UserId, Guid SeekerId) : IRequest<IReadOnlyList<BookingSummary>>;

public sealed class GetSeekerOutgoingBookingsQueryHandler(IBookingRepository repository)
    : IRequestHandler<GetSeekerOutgoingBookingsQuery, IReadOnlyList<BookingSummary>>
{
    public async Task<IReadOnlyList<BookingSummary>> Handle(GetSeekerOutgoingBookingsQuery query, CancellationToken cancellationToken)
    {
        // Authorization check: validate that the seekerId belongs to the requesting user
        if (query.SeekerId != query.UserId)
        {
            throw new UnauthorizedAccessException("You can only access your own seeker bookings.");
        }

        var orders = await repository.GetSeekerOutgoingAsync(query.SeekerId, cancellationToken);
        var meta = await repository.GetParticipantsMetadataAsync(
            orders.SelectMany(o => new[] { o.ProviderId, o.SeekerId }),
            cancellationToken);

        return orders.Select(order =>
        {
            meta.TryGetValue(order.ProviderId, out var prov);
            meta.TryGetValue(order.SeekerId, out var seek);
            return new BookingSummary(
                order.Id,
                order.ProviderId,
                order.SeekerId,
                order.StartTime,
                order.EndTime,
                order.Status,
                order.TotalAmount,
                order.MeetingAddress,
                order.CheckInPin,
                order.CheckedInAt,
                order.Requirements,
                prov?.DisplayName,
                prov?.PhotoUrl,
                seek?.DisplayName,
                seek?.PhotoUrl,
                prov?.AverageRating,
                order.Requirements?.Activity ?? prov?.PrimarySpecialty,
                prov?.IsVerified
            );
        }).ToArray();
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
