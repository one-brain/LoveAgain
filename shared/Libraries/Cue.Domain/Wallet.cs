namespace Cue.Domain;

public sealed class Wallet
{
    private Wallet()
    {
    }

    public Wallet(Guid userId, string currency = "INR")
    {
        if (userId == Guid.Empty) throw new ArgumentException("User ID is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));

        Id = Guid.NewGuid();
        UserId = userId;
        AvailableBalance = 0m;
        PendingBalance = 0m;
        Currency = currency.Trim().ToUpperInvariant();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public decimal AvailableBalance { get; private set; }
    public decimal PendingBalance { get; private set; }
    public string Currency { get; private set; } = "INR";
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public void CreditAvailable(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Credit amount must be positive.");
        AvailableBalance = decimal.Round(AvailableBalance + amount, 2);
        UpdatedAt = DateTime.UtcNow;
    }

    public void DebitAvailable(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Debit amount must be positive.");
        if (AvailableBalance < amount) throw new InvalidOperationException("Insufficient wallet balance.");
        AvailableBalance = decimal.Round(AvailableBalance - amount, 2);
        UpdatedAt = DateTime.UtcNow;
    }

    public void CreditPending(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Pending amount must be positive.");
        PendingBalance = decimal.Round(PendingBalance + amount, 2);
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReleasePendingToAvailable(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be positive.");
        if (PendingBalance < amount) throw new InvalidOperationException("Insufficient pending balance to release.");
        PendingBalance = decimal.Round(PendingBalance - amount, 2);
        AvailableBalance = decimal.Round(AvailableBalance + amount, 2);
        UpdatedAt = DateTime.UtcNow;
    }

    public void DebitPending(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be positive.");
        if (PendingBalance < amount) throw new InvalidOperationException("Insufficient pending balance to debit.");
        PendingBalance = decimal.Round(PendingBalance - amount, 2);
        UpdatedAt = DateTime.UtcNow;
    }
}

