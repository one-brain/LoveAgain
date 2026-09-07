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
}
