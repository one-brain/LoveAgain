namespace Cue.Domain;

public sealed class PayoutRequest
{
    private PayoutRequest()
    {
    }

    public PayoutRequest(
        Guid userId,
        decimal amount,
        decimal feeAmount,
        PayoutMethodType payoutType,
        string destination)
    {
        if (userId == Guid.Empty) throw new ArgumentException("User ID is required.", nameof(userId));
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Payout amount must be positive.");
        if (feeAmount < 0) throw new ArgumentOutOfRangeException(nameof(feeAmount), "Fee amount cannot be negative.");
        if (string.IsNullOrWhiteSpace(destination)) throw new ArgumentException("Payout destination is required.", nameof(destination));

        Id = Guid.NewGuid();
        UserId = userId;
        Amount = decimal.Round(amount, 2);
        FeeAmount = decimal.Round(feeAmount, 2);
        PayoutType = payoutType;
        Destination = destination.Trim();
        Status = PayoutStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public decimal Amount { get; private set; }
    public decimal FeeAmount { get; private set; }
    public PayoutMethodType PayoutType { get; private set; }
    public string Destination { get; private set; } = string.Empty;
    public PayoutStatus Status { get; private set; }
    public string? RazorpayPayoutId { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ProcessedAt { get; private set; }

    public void MarkProcessing(string? razorpayPayoutId = null)
    {
        if (Status != PayoutStatus.Pending) throw new InvalidOperationException("Only pending payouts can move to processing.");
        Status = PayoutStatus.Processing;
        RazorpayPayoutId = razorpayPayoutId?.Trim();
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkCompleted(string? razorpayPayoutId = null)
    {
        if (Status is not (PayoutStatus.Pending or PayoutStatus.Processing))
        {
            throw new InvalidOperationException("Payout cannot be completed from current state.");
        }

        Status = PayoutStatus.Completed;
        if (!string.IsNullOrWhiteSpace(razorpayPayoutId)) RazorpayPayoutId = razorpayPayoutId.Trim();
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkFailed(string reason)
    {
        Status = PayoutStatus.Failed;
        FailureReason = reason?.Trim() ?? "Unknown failure";
        ProcessedAt = DateTime.UtcNow;
    }
}

