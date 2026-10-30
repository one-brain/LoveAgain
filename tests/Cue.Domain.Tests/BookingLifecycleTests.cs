using Cue.Domain;

namespace Cue.Domain.Tests;

public sealed class BookingLifecycleTests
{
    [Fact]
    public void ServiceOrder_CompletesOnlyAfterStarting()
    {
        var providerId = Guid.NewGuid();
        var seekerId = Guid.NewGuid();
        var order = new ServiceOrder(providerId, seekerId, DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 100m, 15m);

        Assert.Throws<InvalidOperationException>(() => order.Complete());
        order.Confirm();
        order.Start();
        order.Complete();

        Assert.Equal(OrderStatus.Completed, order.Status);
        Assert.Equal(85m, order.ProviderEarnings);
    }

    [Fact]
    public void AvailabilitySlot_CanOnlyBeHeldOnce()
    {
        var slot = new AvailabilitySlot(Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(2));
        var orderId = Guid.NewGuid();

        slot.Hold(orderId);

        Assert.Throws<InvalidOperationException>(() => slot.Hold(Guid.NewGuid()));
        Assert.Equal(orderId, slot.BookingId);
    }

    [Fact]
    public void AvailabilitySlot_ReleasesOnlyByHoldingBooking()
    {
        var slot = new AvailabilitySlot(Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(2));
        var orderId = Guid.NewGuid();

        slot.Hold(orderId);
        Assert.Throws<InvalidOperationException>(() => slot.Release(Guid.NewGuid()));

        slot.Release(orderId);
        Assert.False(slot.IsBooked);
        Assert.Null(slot.BookingId);
    }

    [Fact]
    public void PaymentTransaction_CanBeCapturedThenRefunded()
    {
        var transaction = new PaymentTransaction(Guid.NewGuid(), "pi_test", 25m, "usd");

        transaction.Capture();
        transaction.Refund();

        Assert.Equal(TransactionStatus.Refunded, transaction.Status);
    }

    [Fact]
    public void ServiceOrder_CanBeCreatedWithOutingRequirements()
    {
        var providerId = Guid.NewGuid();
        var seekerId = Guid.NewGuid();
        var startTime = DateTime.UtcNow.AddDays(1);
        var endTime = startTime.AddHours(2);
        var requirements = new BookingRequirements(
            ActivityName: "Cafe Catchup",
            DressCode: "Smart Casual",
            TransportMode: "Meet at Venue",
            SpecialNotes: "Table reserved under John"
        );

        var order = new ServiceOrder(
            providerId,
            seekerId,
            startTime,
            endTime,
            1200m,
            180m,
            meetingAddress: "Starbucks, Indiranagar",
            requirements: requirements
        );

        Assert.NotNull(order.Requirements);
        Assert.Equal("Cafe Catchup", order.Requirements.ActivityName);
        Assert.Equal("Smart Casual", order.Requirements.DressCode);
        Assert.Equal("Meet at Venue", order.Requirements.TransportMode);
        Assert.Equal("Table reserved under John", order.Requirements.SpecialNotes);
    }

    [Fact]
    public void ServiceOrder_UpdateRequirements_Throws_WhenBookingInProgressOrCompleted()
    {
        var order = new ServiceOrder(
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(1).AddHours(2),
            1000m,
            150m
        );

        order.Confirm();
        order.Start();

        var updated = new BookingRequirements(ActivityName: "Updated Activity");
        Assert.Throws<InvalidOperationException>(() => order.UpdateRequirements(updated));

        order.Complete();
        Assert.Throws<InvalidOperationException>(() => order.UpdateRequirements(updated));
    }

    [Fact]
    public void ServiceOrder_Handshake_VerifiesCheckInPin_AndTransitionsToInProgress()
    {
        var order = new ServiceOrder(
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow.AddHours(1),
            DateTime.UtcNow.AddHours(3),
            1000m,
            150m
        );

        order.Confirm();
        Assert.NotNull(order.CheckInPin);
        Assert.Equal(6, order.CheckInPin.Length);

        // Wrong PIN should fail
        Assert.Throws<InvalidOperationException>(() => order.CheckIn("000000"));

        // Correct PIN should succeed
        order.CheckIn(order.CheckInPin);
        Assert.Equal(OrderStatus.InProgress, order.Status);
        Assert.NotNull(order.CheckedInAt);
    }

    [Fact]
    public void ServiceOrder_UpdateDetails_UpdatesMeetingAddressAndRequirements()
    {
        var order = new ServiceOrder(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 200m, 30m);
        var updatedReq = new BookingRequirements(
            Activity: "Tennis Match",
            DressCode: "Sporty",
            TransportMode: "Meet at venue",
            DietPreference: "Energy drink",
            EquipmentGear: "Rackets",
            LanguagePreference: "English",
            SpecialNotes: "Clay court reserved");

        order.UpdateDetails("Koramangala Club, 6th Block", updatedReq);

        Assert.Equal("Koramangala Club, 6th Block", order.MeetingAddress);
        Assert.Equal("Tennis Match", order.Requirements?.Activity);
        Assert.Equal("Clay court reserved", order.Requirements?.SpecialNotes);
    }

    [Fact]
    public void ServiceOrder_UpdateDetails_RecalculatesAmount_WhenPendingPaymentAndDurationChanges()
    {
        // 2 hours at 100/hr = 200 total
        var order = new ServiceOrder(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 200m, 30m);
        var newStart = DateTime.UtcNow.AddDays(2);
        var newEnd = newStart.AddHours(3); // 3 hours

        order.UpdateDetails("New Cafe", null, newStart, newEnd, durationHours: 3m);

        Assert.Equal(300m, order.TotalAmount); // 100/hr * 3 hrs
        Assert.Equal(45m, order.PlatformFee); // 15% of 300
        Assert.Equal(255m, order.ProviderEarnings);
        Assert.Equal(newStart, order.StartTime);
        Assert.Equal(newEnd, order.EndTime);
    }

    [Fact]
    public void ServiceOrder_UpdateDetails_Throws_WhenBookingInProgressOrCompletedOrCancelled()
    {
        var order = new ServiceOrder(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 200m, 30m);
        order.Confirm();
        order.CheckIn(order.CheckInPin!); // InProgress

        Assert.Throws<InvalidOperationException>(() => {
            order.UpdateDetails("Another place", null);
        });

        order.Complete();
        Assert.Throws<InvalidOperationException>(() => {
            order.UpdateDetails("Another place", null);
        });

        var cancelledOrder = new ServiceOrder(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 200m, 30m);
        cancelledOrder.Cancel("Client change of plans");
        Assert.Throws<InvalidOperationException>(() => {
            cancelledOrder.UpdateDetails("Another place", null);
        });
    }

    [Fact]
    public void ServiceOrder_UpdateDetails_Throws_WhenEndTimeBeforeStartTime()
    {
        var order = new ServiceOrder(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 200m, 30m);
        var start = DateTime.UtcNow.AddDays(1);
        var end = start.AddHours(-1);

        Assert.Throws<ArgumentException>(() => {
            order.UpdateDetails("Cafe", null, start, end);
        });
    }

    [Fact]
    public void ServiceOrder_DualPin_RequiresCheckInPin_AndCompletionPin()
    {
        var providerId = Guid.NewGuid();
        var seekerId = Guid.NewGuid();
        var order = new ServiceOrder(providerId, seekerId, DateTime.UtcNow.AddHours(1), DateTime.UtcNow.AddHours(3), 100m, 15m);

        order.Confirm();
        Assert.NotNull(order.CheckInPin);
        Assert.NotNull(order.CompletionPin);

        // Cannot complete directly from Confirmed
        Assert.Throws<InvalidOperationException>(() => order.Complete(order.CompletionPin!));

        // Wrong Arrival PIN fails
        Assert.Throws<InvalidOperationException>(() => order.CheckIn("000000"));

        // Valid Arrival PIN transitions Confirmed -> InProgress
        order.CheckIn(order.CheckInPin!);
        Assert.Equal(OrderStatus.InProgress, order.Status);

        // Wrong Completion PIN fails
        Assert.Throws<InvalidOperationException>(() => order.Complete("999999"));

        // Valid Completion PIN transitions InProgress -> Completed
        order.Complete(order.CompletionPin!);
        Assert.Equal(OrderStatus.Completed, order.Status);
    }
}
