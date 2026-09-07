namespace Cue.Domain;

public sealed class PasswordResetToken
{
    private PasswordResetToken()
    {
    }

    public PasswordResetToken(Guid userId, string tokenHash, DateTime expiresAt)
    {
        if (userId == Guid.Empty) throw new ArgumentException("User is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(tokenHash)) throw new ArgumentException("Token hash is required.", nameof(tokenHash));
        if (expiresAt <= DateTime.UtcNow) throw new ArgumentException("Expiry must be in the future.", nameof(expiresAt));

        Id = Guid.NewGuid();
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? UsedAt { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public bool IsUsable => UsedAt is null && ExpiresAt > DateTime.UtcNow;

    public void MarkUsed()
    {
        if (UsedAt is not null) throw new InvalidOperationException("Token has already been used.");
        UsedAt = DateTime.UtcNow;
    }
}
