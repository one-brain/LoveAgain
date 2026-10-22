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
}
