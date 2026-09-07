namespace Cue.Domain;

public sealed class PaymentTransaction
{
    private PaymentTransaction()
    {
    }

    public PaymentTransaction(Guid orderId, string stripePaymentIntentId, decimal amount, string currency, IReadOnlyDictionary<string, string>? metadata = null)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("Order is required.", nameof(orderId));
        if (string.IsNullOrWhiteSpace(stripePaymentIntentId)) throw new ArgumentException("Stripe payment intent is required.", nameof(stripePaymentIntentId));
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));

        Id = Guid.NewGuid();
        OrderId = orderId;
        StripePaymentIntentId = stripePaymentIntentId.Trim();
        Amount = amount;
        Currency = currency.Trim().ToUpperInvariant();
        Status = TransactionStatus.Authorized;
        Metadata = metadata is null ? new Dictionary<string, string>() : new Dictionary<string, string>(metadata);
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public string StripePaymentIntentId { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = string.Empty;
    public TransactionStatus Status { get; private set; }
    public IReadOnlyDictionary<string, string> Metadata { get; private set; } = new Dictionary<string, string>();
    public DateTime CreatedAt { get; private set; }

    public void Capture() { EnsureStatus(TransactionStatus.Authorized); Status = TransactionStatus.Captured; }
    public void Fail() { Status = TransactionStatus.Failed; }
    public void Refund() { if (Status is not TransactionStatus.Captured) throw new InvalidOperationException("Only captured payments can be refunded."); Status = TransactionStatus.Refunded; }
    private void EnsureStatus(TransactionStatus expected) { if (Status != expected) throw new InvalidOperationException($"Transaction must be {expected}."); }
}
