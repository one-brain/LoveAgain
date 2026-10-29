namespace Cue.Domain;

public sealed class ServiceOrder
{
    private ServiceOrder()
    {
    }

    public ServiceOrder(
        Guid providerId,
        Guid seekerId,
        DateTime startTime,
        DateTime endTime,
        decimal totalAmount,
        decimal platformFee,
        string? meetingAddress = null,
        BookingRequirements? requirements = null,
        string? checkInPin = null)
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
        Requirements = requirements;
        CheckInPin = checkInPin?.Trim();
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
    public BookingRequirements? Requirements { get; private set; }
    public string? CheckInPin { get; private set; }
    public DateTime? CheckedInAt { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public void UpdateRequirements(BookingRequirements requirements)
    {
        if (Status is OrderStatus.InProgress or OrderStatus.Completed or OrderStatus.Cancelled)
        {
            throw new InvalidOperationException("Requirements cannot be modified once the booking is in progress, completed, or cancelled.");
        }
        Requirements = requirements ?? throw new ArgumentNullException(nameof(requirements));
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string? meetingAddress,
        BookingRequirements? requirements,
        DateTime? startTime = null,
        DateTime? endTime = null,
        decimal? durationHours = null)
    {
        if (Status is OrderStatus.InProgress or OrderStatus.Completed or OrderStatus.Cancelled)
        {
            throw new InvalidOperationException($"Booking in status '{Status}' cannot be modified.");
        }

        if (meetingAddress is not null)
        {
            MeetingAddress = meetingAddress.Trim();
        }

        if (requirements is not null)
        {
            Requirements = requirements;
        }

        if (startTime.HasValue && endTime.HasValue)
        {
            if (endTime.Value <= startTime.Value)
            {
                throw new ArgumentException("End time must be after start time.", nameof(endTime));
            }

            // Recalculate fees if in PendingPayment status
            if (Status == OrderStatus.PendingPayment && durationHours.HasValue && durationHours.Value > 0)
            {
                var oldDuration = (decimal)(EndTime - StartTime).TotalHours;
                if (oldDuration <= 0) oldDuration = 1m;
                var hourlyRate = decimal.Round(TotalAmount / oldDuration, 2);
                TotalAmount = decimal.Round(hourlyRate * durationHours.Value, 2);
                PlatformFee = decimal.Round(TotalAmount * 0.15m, 2);
                ProviderEarnings = TotalAmount - PlatformFee;
            }

            StartTime = startTime.Value;
            EndTime = endTime.Value;
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        EnsureStatus(OrderStatus.PendingPayment);
        Status = OrderStatus.Confirmed;
        CheckInPin ??= Random.Shared.Next(100000, 999999).ToString();
        UpdatedAt = DateTime.UtcNow;
    }

    public void CheckIn(string pin)
    {
        EnsureStatus(OrderStatus.Confirmed);
        if (string.IsNullOrWhiteSpace(pin) || !string.Equals(pin.Trim(), CheckInPin, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Invalid check-in PIN.");
        }

        Status = OrderStatus.InProgress;
        CheckedInAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Start()
    {
        EnsureStatus(OrderStatus.Confirmed);
        Status = OrderStatus.InProgress;
        CheckedInAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status is not (OrderStatus.Confirmed or OrderStatus.InProgress))
        {
            throw new InvalidOperationException($"Order must be Confirmed or InProgress before this operation (current: {Status}).");
        }
        Status = OrderStatus.Completed;
        CheckedInAt ??= DateTime.UtcNow;
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

    public static ServiceOrder Seed(
        Guid id,
        Guid providerId,
        Guid seekerId,
        DateTime startTime,
        DateTime endTime,
        OrderStatus status,
        decimal totalAmount,
        string meetingAddress,
        BookingRequirements requirements,
        string? checkInPin,
        DateTime? checkedInAt,
        string? cancellationReason,
        DateTime createdAt)
    {
        var fee = decimal.Round(totalAmount * 0.15m, 2);
        return new ServiceOrder
        {
            Id = id,
            ProviderId = providerId,
            SeekerId = seekerId,
            StartTime = startTime,
            EndTime = endTime,
            Status = status,
            TotalAmount = totalAmount,
            PlatformFee = fee,
            ProviderEarnings = totalAmount - fee,
            MeetingAddress = meetingAddress,
            Requirements = requirements,
            CheckInPin = checkInPin,
            CheckedInAt = checkedInAt,
            CancellationReason = cancellationReason,
            CreatedAt = createdAt,
            UpdatedAt = createdAt
        };
    }

    private void EnsureStatus(OrderStatus expected)
    {
        if (Status != expected) throw new InvalidOperationException($"Order must be {expected} before this operation.");
    }
}
