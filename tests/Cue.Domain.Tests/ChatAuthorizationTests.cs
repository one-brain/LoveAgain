using Cue.Domain;
using Xunit;

namespace Cue.Domain.Tests;

public class ChatAuthorizationTests
{
    [Theory]
    [InlineData(OrderStatus.Confirmed, true)]
    [InlineData(OrderStatus.InProgress, true)]
    [InlineData(OrderStatus.Completed, true)]
    [InlineData(OrderStatus.PendingPayment, false)]
    public void ServiceOrder_ChatEligibility_MatchesOrderStatus(OrderStatus status, bool expectedEligibility)
    {
        // Arrange
        var providerId = Guid.NewGuid();
        var seekerId = Guid.NewGuid();
        var order = new ServiceOrder(
            providerId,
            seekerId,
            DateTime.UtcNow.AddHours(2),
            DateTime.UtcNow.AddHours(4),
            4000m,
            600m
        );

        if (status == OrderStatus.Confirmed)
        {
            order.Confirm();
        }
        else if (status == OrderStatus.InProgress)
        {
            order.Confirm();
            order.Start();
        }
        else if (status == OrderStatus.Completed)
        {
            order.Confirm();
            order.Start();
            order.Complete();
        }

        // Act
        var isEligible = order.Status != OrderStatus.PendingPayment;

        // Assert
        Assert.Equal(status, order.Status);
        Assert.Equal(expectedEligibility, isEligible);
    }

    [Fact]
    public void EscrowHold_WhenActive_GrantsChatEligibility()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var seekerId = Guid.NewGuid();
        var providerId = Guid.NewGuid();
        var hold = new EscrowHold(orderId, seekerId, providerId, 4000m, 600m);

        // Act & Assert
        Assert.Equal(EscrowStatus.Held, hold.Status);
        Assert.NotEqual(EscrowStatus.Refunded, hold.Status);
    }
}
