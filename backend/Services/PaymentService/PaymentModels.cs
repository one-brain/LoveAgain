using System.Net.Http.Headers;
using System.Text.Json;
using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.Extensions.Options;

namespace PaymentService;

public sealed class StripeOptions
{
    public string SecretKey { get; init; } = string.Empty;
    public string ApiBaseUrl { get; init; } = "https://api.stripe.com/v1";
    public string ConnectedAccountId { get; init; } = string.Empty;
    public string WebhookSecret { get; init; } = string.Empty;
}

public sealed record CreatePaymentIntentRequest(Guid OrderId, decimal Amount, string Currency = "usd");
public sealed record PaymentIntentResult(Guid TransactionId, string PaymentIntentId, string ClientSecret, decimal Amount, string Status);

public interface IPaymentGateway
{
    Task<(string Id, string ClientSecret, string Status)> CreatePaymentIntentAsync(CreatePaymentIntentRequest request, CancellationToken cancellationToken);
}

public sealed class StripePaymentGateway(HttpClient httpClient, IOptions<StripeOptions> options) : IPaymentGateway
{
    private readonly StripeOptions settings = options.Value;

    public async Task<(string Id, string ClientSecret, string Status)> CreatePaymentIntentAsync(CreatePaymentIntentRequest request, CancellationToken cancellationToken)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, $"{settings.ApiBaseUrl}/payment_intents");
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.SecretKey);
        var form = new Dictionary<string, string>
        {
            ["amount"] = decimal.ToInt64(decimal.Round(request.Amount * 100, 0)).ToString(),
            ["currency"] = request.Currency.ToLowerInvariant(),
            ["capture_method"] = "manual",
            ["metadata[order_id]"] = request.OrderId.ToString()
        };
        if (!string.IsNullOrWhiteSpace(settings.ConnectedAccountId)) form["transfer_data[destination]"] = settings.ConnectedAccountId;
        message.Content = new FormUrlEncodedContent(form);
        using var response = await httpClient.SendAsync(message, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        response.EnsureSuccessStatusCode();
        using var document = JsonDocument.Parse(body);
        var root = document.RootElement;
        return (root.GetProperty("id").GetString()!, root.GetProperty("client_secret").GetString()!, root.GetProperty("status").GetString()!);
    }
}
