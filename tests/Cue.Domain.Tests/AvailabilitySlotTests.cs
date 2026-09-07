using Cue.Domain;

namespace Cue.Domain.Tests;

public sealed class AvailabilitySlotTests
{
    [Fact]
    public void Slot_HoldsOnceAndReleasesForSameBooking()
    {
        var providerId = Guid.NewGuid();
        var slot = new AvailabilitySlot(providerId, DateTime.UtcNow.AddHours(2), DateTime.UtcNow.AddHours(3));
        var bookingId = Guid.NewGuid();

        slot.Hold(bookingId);
        Assert.True(slot.IsBooked);
        Assert.Equal(bookingId, slot.BookingId);

        Assert.Throws<InvalidOperationException>(() => slot.Hold(Guid.NewGuid()));

        slot.Release(bookingId);
        Assert.False(slot.IsBooked);
        Assert.Null(slot.BookingId);
    }

    [Fact]
    public void Slot_ReleaseByOtherBookingRejected()
    {
        var slot = new AvailabilitySlot(Guid.NewGuid(), DateTime.UtcNow.AddHours(2), DateTime.UtcNow.AddHours(3));
        slot.Hold(Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() => slot.Release(Guid.NewGuid()));
    }

    [Fact]
    public void Slot_RejectsEndBeforeStart()
    {
        var start = DateTime.UtcNow.AddHours(3);
        Assert.Throws<ArgumentException>(() =>
            new AvailabilitySlot(Guid.NewGuid(), start, start.AddMinutes(-30)));
    }
}
