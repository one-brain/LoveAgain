namespace Cue.Domain;

public sealed class AvailabilitySlot
{
    private AvailabilitySlot()
    {
    }

    public AvailabilitySlot(Guid providerId, DateTime startTime, DateTime endTime)
    {
        if (providerId == Guid.Empty) throw new ArgumentException("Provider is required.", nameof(providerId));
        if (endTime <= startTime) throw new ArgumentException("End time must be after start time.", nameof(endTime));

        Id = Guid.NewGuid();
        ProviderId = providerId;
        StartTime = startTime;
        EndTime = endTime;
    }

    public Guid Id { get; private set; }
    public Guid ProviderId { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public bool IsBooked { get; private set; }
    public Guid? BookingId { get; private set; }

    public void Hold(Guid bookingId)
    {
        if (bookingId == Guid.Empty) throw new ArgumentException("Booking is required.", nameof(bookingId));
        if (IsBooked) throw new InvalidOperationException("The availability slot is already booked.");

        IsBooked = true;
        BookingId = bookingId;
    }

    public void Release(Guid bookingId)
    {
        if (!IsBooked || BookingId != bookingId)
        {
            throw new InvalidOperationException("Only the booking holding this slot can release it.");
        }

        IsBooked = false;
        BookingId = null;
    }
}
