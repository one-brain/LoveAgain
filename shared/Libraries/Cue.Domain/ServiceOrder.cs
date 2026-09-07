namespace Cue.Domain;

public sealed class ServiceOrder
{
    private ServiceOrder()
    {
    }

    public ServiceOrder(Guid providerId, Guid seekerId, DateTime startTime, DateTime endTime, decimal totalAmount, decimal platformFee, string? meetingAddress = null)
    {
        if (providerId == Guid.Empty || seekerId == Guid.Empty) throw new ArgumentException("Provider and seeker are required.");
        if (providerId == seekerId) throw new ArgumentException("Provider and seeker must be different users.");
        if (endTime <= startTime) throw new ArgumentException("End time must be after start time.", nameof(endTime));
        if (totalAmount < 0 || platformFee < 0 || platformFee > totalAmount) throw new ArgumentOutOfRangeException(nameof(totalAmount));

        Id = Guid.NewGuid();
        ProviderId = providerId;
        SeekerId = seekerId;
        StartTime = startTime;
        EndTime = endTime;
        Status = OrderStatus.PendingPayment;
        TotalAmount = totalAmount;
        PlatformFee = platformFee;
        ProviderEarnings = totalAmount - platformFee;
        MeetingAddress = meetingAddress?.Trim();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid Id { get; private set; }
    public Guid ProviderId { get; private set; }
    public Guid SeekerId { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public OrderStatus Status { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PlatformFee { get; private set; }
    public decimal ProviderEarnings { get; private set; }
    public string? MeetingAddress { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public void Confirm()
    {
        EnsureStatus(OrderStatus.PendingPayment);
        Status = OrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Start()
    {
        EnsureStatus(OrderStatus.Confirmed);
        Status = OrderStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        EnsureStatus(OrderStatus.InProgress);
        Status = OrderStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status is OrderStatus.Completed or OrderStatus.Cancelled) throw new InvalidOperationException("The order cannot be cancelled in its current state.");
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("A cancellation reason is required.", nameof(reason));

        Status = OrderStatus.Cancelled;
        CancellationReason = reason.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    private void EnsureStatus(OrderStatus expected)
    {
        if (Status != expected) throw new InvalidOperationException($"Order must be {expected} before this operation.");
    }
}
