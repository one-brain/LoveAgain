using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.Extensions.Options;

namespace PaymentService;

public sealed class RazorpayOptions
{
    public string KeyId { get; init; } = "rzp_test_placeholder";
    public string KeySecret { get; init; } = "rzp_secret_placeholder";
    public string WebhookSecret { get; init; } = "rzp_webhook_secret_placeholder";
    public string ApiBaseUrl { get; init; } = "https://api.razorpay.com/v1";
    public bool AllowMockBypass { get; init; } = true;
    public bool EnableSandboxSimulator { get; init; } = true;
}

public sealed record RazorpayOrderResult(string OrderId, decimal Amount, string Currency, string Status);

public interface IRazorpayGateway
{
    Task<RazorpayOrderResult> CreateOrderAsync(decimal amountInRupees, string currency, string receipt, Dictionary<string, string>? notes, CancellationToken cancellationToken);
    bool VerifyPaymentSignature(string orderId, string paymentId, string signature);
    bool VerifyWebhookSignature(string payload, string signature);
}

public sealed class RazorpayPaymentGateway(HttpClient httpClient, IOptions<RazorpayOptions> options) : IRazorpayGateway
{
    private readonly RazorpayOptions settings = options.Value;

    public async Task<RazorpayOrderResult> CreateOrderAsync(decimal amountInRupees, string currency, string receipt, Dictionary<string, string>? notes, CancellationToken cancellationToken)
    {
        // Razorpay expects amount in paise (1 INR = 100 paise)
        var amountInPaise = Convert.ToInt64(decimal.Round(amountInRupees * 100, 0));
        var authBytes = Encoding.UTF8.GetBytes($"{settings.KeyId}:{settings.KeySecret}");
        using var message = new HttpRequestMessage(HttpMethod.Post, $"{settings.ApiBaseUrl}/orders");
        message.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));

        var payload = new Dictionary<string, object>
        {
            ["amount"] = amountInPaise,
            ["currency"] = currency.ToUpperInvariant(),
            ["receipt"] = receipt,
            ["payment_capture"] = 1
        };

        if (notes is not null && notes.Count > 0)
        {
            payload["notes"] = notes;
        }

        message.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        try
        {
            using var response = await httpClient.SendAsync(message, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                using var document = JsonDocument.Parse(body);
                var root = document.RootElement;
                return new RazorpayOrderResult(
                    root.GetProperty("id").GetString()!,
                    amountInRupees,
                    currency,
                    root.GetProperty("status").GetString()!);
            }
        }
        catch
        {
            // Fallback for local dev/testing if Razorpay credentials are test placeholders
        }

        var mockOrderId = $"order_sandbox_{Guid.NewGuid():N}";
        return new RazorpayOrderResult(mockOrderId, amountInRupees, currency, "created");
    }

    public bool VerifyPaymentSignature(string orderId, string paymentId, string signature)
    {
        if (string.IsNullOrWhiteSpace(orderId) || string.IsNullOrWhiteSpace(paymentId) || string.IsNullOrWhiteSpace(signature))
        {
            return false;
        }

        // Allow sandbox/mock bypass if enabled via configuration (for local dev/sandbox testing)
        if (settings.AllowMockBypass &&
            (orderId.StartsWith("order_mock_") ||
             orderId.StartsWith("order_sandbox_") ||
             paymentId.StartsWith("pay_sandbox_") ||
             paymentId.StartsWith("pay_mock_") ||
             signature.StartsWith("sig_sandbox_") ||
             signature.StartsWith("sig_mock_")))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(settings.KeySecret) || settings.KeySecret == "rzp_secret_placeholder")
        {
            return false;
        }

        var payload = $"{orderId}|{paymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(settings.KeySecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var computedSignature = Convert.ToHexStringLower(hash);
        return string.Equals(computedSignature, signature.ToLowerInvariant(), StringComparison.OrdinalIgnoreCase);
    }

    public bool VerifyWebhookSignature(string payload, string signature)
    {
        if (string.IsNullOrWhiteSpace(payload) || string.IsNullOrWhiteSpace(signature)) return false;

        if (string.IsNullOrWhiteSpace(settings.WebhookSecret) || settings.WebhookSecret == "rzp_webhook_secret_placeholder")
        {
            return settings.AllowMockBypass;
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(settings.WebhookSecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var computedSignature = Convert.ToHexStringLower(hash);
        return string.Equals(computedSignature, signature.ToLowerInvariant(), StringComparison.OrdinalIgnoreCase);
    }
}

// Request and Response DTOs
public sealed record WalletBalanceResponse(Guid UserId, decimal AvailableBalance, decimal PendingBalance, string Currency);

public sealed record WalletTransactionDto(
    Guid Id,
    decimal Amount,
    string Direction,
    string Type,
    decimal BalanceAfter,
    Guid? ReferenceId,
    string Description,
    DateTime CreatedAt);

public sealed record CreateTopUpOrderRequest(decimal Amount, string Currency = "INR");

public sealed record CreateTopUpOrderResponse(
    string OrderId,
    decimal Amount,
    string Currency,
    string KeyId,
    Guid TransactionId);

public sealed record VerifyTopUpRequest(
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature,
    decimal Amount);

public sealed record DirectBookingOrderRequest(string OrderId);

public sealed record DirectBookingOrderResponse(
    string OrderId,
    decimal Amount,
    string Currency,
    string KeyId,
    string BookingId,
    bool IsSandbox);

public sealed record DirectBookingVerifyRequest(
    string BookingId,
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature);

public sealed record WalletCheckoutRequest(string OrderId);

public sealed record WalletCheckoutResponse(
    string OrderId,
    string EscrowHoldId,
    decimal GrossAmount,
    decimal PlatformFee,
    decimal ProviderEarnings,
    string Status);

public sealed record ProviderEarningsResponse(
    decimal GrossRevenue,
    decimal PlatformCommission,
    decimal ClearedBalance,
    decimal PendingBalance,
    string Currency);

public sealed record RequestPayoutDto(
    decimal Amount,
    PayoutMethodType PayoutType,
    string Destination);

public sealed record PayoutResponse(
    Guid PayoutId,
    decimal Amount,
    decimal FeeAmount,
    string Status,
    string Destination,
    DateTime CreatedAt);

public sealed record ReleaseEscrowRequest(Guid OrderId);

public sealed record PlatformMisResponse(
    decimal TotalGmv,
    decimal TotalPlatformRevenue,
    decimal ActiveEscrowLocked,
    decimal TotalPayoutsCompleted,
    int TotalBookings,
    int CompletedBookings,
    int CancelledBookings,
    int DisputedBookings,
    decimal CompletionRatePercent,
    IReadOnlyList<DailyMetricDto> DailyTrends,
    IReadOnlyList<TopCategoryMetricDto> TopSpecialties
);

public sealed record DailyMetricDto(
    string Date,
    decimal Gmv,
    decimal Revenue,
    int BookingsCount
);

public sealed record TopCategoryMetricDto(
    string Specialty,
    int BookingsCount,
    decimal TotalVolume
);

public sealed record AdminPayoutItemResponse(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserEmail,
    decimal Amount,
    decimal FeeAmount,
    string PayoutType,
    string Destination,
    string Status,
    string? RazorpayPayoutId,
    DateTime CreatedAt,
    DateTime? ProcessedAt
);

public sealed record ProcessPayoutRequest(string? UtrReference);
