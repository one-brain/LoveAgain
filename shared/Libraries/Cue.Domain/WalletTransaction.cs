namespace Cue.Domain;

public sealed class WalletTransaction
{
    private WalletTransaction()
    {
    }

    public WalletTransaction(
        Guid walletId,
        decimal amount,
        TransactionDirection direction,
        WalletTransactionType type,
        decimal balanceAfter,
        Guid? referenceId = null,
        string? description = null)
    {
        if (walletId == Guid.Empty) throw new ArgumentException("Wallet ID is required.", nameof(walletId));
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be positive.");
        if (balanceAfter < 0) throw new ArgumentOutOfRangeException(nameof(balanceAfter), "Balance after cannot be negative.");

        Id = Guid.NewGuid();
        WalletId = walletId;
        Amount = decimal.Round(amount, 2);
        Direction = direction;
        Type = type;
        BalanceAfter = decimal.Round(balanceAfter, 2);
        ReferenceId = referenceId;
        Description = description?.Trim() ?? string.Empty;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid WalletId { get; private set; }
    public decimal Amount { get; private set; }
    public TransactionDirection Direction { get; private set; }
    public WalletTransactionType Type { get; private set; }
    public decimal BalanceAfter { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
}

