namespace Cue.Domain;

public sealed class EscrowHold
{
    private EscrowHold()
    {
    }

    public EscrowHold(
        Guid orderId,
        Guid seekerId,
        Guid providerId,
        decimal grossAmount,
        decimal platformFee)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("Order ID is required.", nameof(orderId));
        if (seekerId == Guid.Empty) throw new ArgumentException("Seeker ID is required.", nameof(seekerId));
        if (providerId == Guid.Empty) throw new ArgumentException("Provider ID is required.", nameof(providerId));
        if (seekerId == providerId) throw new ArgumentException("Seeker and provider must be different users.");
        if (grossAmount <= 0) throw new ArgumentOutOfRangeException(nameof(grossAmount), "Gross amount must be positive.");
        if (platformFee < 0 || platformFee >= grossAmount) throw new ArgumentOutOfRangeException(nameof(platformFee), "Platform fee must be valid.");

        Id = Guid.NewGuid();
        OrderId = orderId;
        SeekerId = seekerId;
        ProviderId = providerId;
        GrossAmount = decimal.Round(grossAmount, 2);
        PlatformFee = decimal.Round(platformFee, 2);
        NetAmount = decimal.Round(grossAmount - platformFee, 2);
        Status = EscrowStatus.Held;
        HeldAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid SeekerId { get; private set; }
    public Guid ProviderId { get; private set; }
    public decimal GrossAmount { get; private set; }
    public decimal PlatformFee { get; private set; }
    public decimal NetAmount { get; private set; }
    public EscrowStatus Status { get; private set; }
    public DateTime HeldAt { get; private set; }
    public DateTime? ReleasedAt { get; private set; }
    public string? ResolutionNotes { get; private set; }

    public void Release()
    {
        if (Status is not (EscrowStatus.Held or EscrowStatus.Disputed))
        {
            throw new InvalidOperationException($"Cannot release escrow from status {Status}.");
        }

        Status = EscrowStatus.Released;
        ReleasedAt = DateTime.UtcNow;
    }

    public void Refund(string? notes = null)
    {
        if (Status is not (EscrowStatus.Held or EscrowStatus.Disputed))
        {
            throw new InvalidOperationException($"Cannot refund escrow from status {Status}.");
        }

        Status = EscrowStatus.Refunded;
        ReleasedAt = DateTime.UtcNow;
        ResolutionNotes = notes?.Trim();
    }

    public void Dispute(string? notes = null)
    {
        if (Status != EscrowStatus.Held)
        {
            throw new InvalidOperationException("Only held escrows can be marked as disputed.");
        }

        Status = EscrowStatus.Disputed;
        ResolutionNotes = notes?.Trim();
    }
}

