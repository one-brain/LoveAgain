using Cue.Application.Abstractions;
using Cue.Domain;
using MediatR;

namespace Cue.Application.Analytics;

public sealed record ProviderAnalytics(int TotalBookings, int CompletedBookings, decimal GrossRevenue, decimal CompletionRate);

public sealed record GetProviderAnalyticsQuery(Guid ProviderId) : IRequest<ProviderAnalytics>;

public sealed class GetProviderAnalyticsQueryHandler(IBookingRepository repository) : IRequestHandler<GetProviderAnalyticsQuery, ProviderAnalytics>
{
    public async Task<ProviderAnalytics> Handle(GetProviderAnalyticsQuery query, CancellationToken cancellationToken)
    {
        var orders = await repository.GetForUserAsync(query.ProviderId, cancellationToken);
        var completed = orders.Count(order => order.Status == OrderStatus.Completed);
        var revenue = orders.Where(order => order.Status == OrderStatus.Completed).Sum(order => order.ProviderEarnings);
        var completionRate = orders.Count == 0 ? 0 : decimal.Round((decimal)completed / orders.Count * 100, 2);
        return new ProviderAnalytics(orders.Count, completed, revenue, completionRate);
    }
}