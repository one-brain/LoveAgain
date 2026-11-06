namespace Cue.Domain;

public static class OtpPurposes
{
    public const string EmailVerification = "EmailVerification";
    public const string PhoneVerification = "PhoneVerification";
    public const string MobileLogin = "MobileLogin";
    public const string PasswordReset = "PasswordReset";
}

public sealed class VerificationOtp
{
    private VerificationOtp()
    {
    }

    public VerificationOtp(
        Guid? userId,
        string target,
        string otpCode,
        string purpose,
        DateTime expiresAt)
    {
        if (string.IsNullOrWhiteSpace(target)) throw new ArgumentException("Target is required.", nameof(target));
        if (string.IsNullOrWhiteSpace(otpCode)) throw new ArgumentException("OTP code is required.", nameof(otpCode));
        if (string.IsNullOrWhiteSpace(purpose)) throw new ArgumentException("Purpose is required.", nameof(purpose));
        if (expiresAt <= DateTime.UtcNow) throw new ArgumentException("Expiry must be in the future.", nameof(expiresAt));

        Id = Guid.NewGuid();
        UserId = userId;
        Target = target.Trim().ToLowerInvariant();
        OtpCode = otpCode.Trim();
        Purpose = purpose.Trim();
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
        AttemptCount = 0;
    }

    public Guid Id { get; private set; }
    public Guid? UserId { get; private set; }
    public string Target { get; private set; } = string.Empty;
    public string OtpCode { get; private set; } = string.Empty;
    public string Purpose { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? UsedAt { get; private set; }
    public int AttemptCount { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public bool IsUsable => UsedAt == null && ExpiresAt > DateTime.UtcNow && AttemptCount < 5;

    public bool Verify(string code)
    {
        AttemptCount++;
        if (!IsUsable) return false;
        if (string.Equals(OtpCode, code.Trim(), StringComparison.Ordinal))
        {
            UsedAt = DateTime.UtcNow;
            return true;
        }
        return false;
    }

    public void Invalidate()
    {
        if (UsedAt == null)
        {
            UsedAt = DateTime.UtcNow;
        }
    }
}

