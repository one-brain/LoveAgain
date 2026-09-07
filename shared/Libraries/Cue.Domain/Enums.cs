namespace Cue.Domain;

public enum UserRole
{
    Seeker = 1,
    Provider = 2,
    Admin = 3
}

public enum OrderStatus
{
    PendingPayment = 1,
    Confirmed = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    Disputed = 6
}

public enum MessageType
{
    Text = 1,
    Image = 2,
    Video = 3,
    File = 4
}

public enum DisputeStatus
{
    Open = 1,
    InReview = 2,
    Resolved = 3,
    Escalated = 4
}

public enum TransactionStatus
{
    Authorized = 1,
    Captured = 2,
    Failed = 3,
    Refunded = 4,
    RefundPending = 5
}

public enum NotificationType
{
    BookingCreated = 1,
    BookingConfirmed = 2,
    BookingCancelled = 3,
    PaymentProcessed = 4,
    NewMessage = 5,
    ReviewSubmitted = 6,
    TrustScoreUpdated = 7
}
