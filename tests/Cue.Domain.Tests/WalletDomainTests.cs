using Cue.Domain;

namespace Cue.Domain.Tests;

public sealed class WalletDomainTests
{
    [Fact]
    public void Wallet_CanCreditAndDebitAvailableBalance()
    {
        var userId = Guid.NewGuid();
        var wallet = new Wallet(userId, "INR");

        Assert.Equal(0m, wallet.AvailableBalance);
        Assert.Equal("INR", wallet.Currency);

        wallet.CreditAvailable(1000m);
        Assert.Equal(1000m, wallet.AvailableBalance);

        wallet.DebitAvailable(400m);
        Assert.Equal(600m, wallet.AvailableBalance);

        Assert.Throws<InvalidOperationException>(() => wallet.DebitAvailable(700m));
    }

    [Fact]
    public void Wallet_PendingBalance_CanBeReleasedToAvailable()
    {
        var userId = Guid.NewGuid();
        var wallet = new Wallet(userId, "INR");

        wallet.CreditPending(850m);
        Assert.Equal(0m, wallet.AvailableBalance);
        Assert.Equal(850m, wallet.PendingBalance);

        wallet.ReleasePendingToAvailable(850m);
        Assert.Equal(850m, wallet.AvailableBalance);
        Assert.Equal(0m, wallet.PendingBalance);
    }

    [Fact]
    public void EscrowHold_Calculates15PercentPlatformCommissionCorrectly()
    {
        var orderId = Guid.NewGuid();
        var seekerId = Guid.NewGuid();
        var providerId = Guid.NewGuid();
        var gross = 2000m;
        var platformFee = gross * 0.15m; // 300 INR

        var escrow = new EscrowHold(orderId, seekerId, providerId, gross, platformFee);

        Assert.Equal(EscrowStatus.Held, escrow.Status);
        Assert.Equal(2000m, escrow.GrossAmount);
        Assert.Equal(300m, escrow.PlatformFee);
        Assert.Equal(1700m, escrow.NetAmount);
        Assert.Equal(escrow.GrossAmount, escrow.PlatformFee + escrow.NetAmount);

        escrow.Release();
        Assert.Equal(EscrowStatus.Released, escrow.Status);
        Assert.NotNull(escrow.ReleasedAt);
    }

    [Fact]
    public void EscrowHold_DoubleReleaseOrDoubleRefund_ThrowsInvalidOperation()
    {
        var escrow = new EscrowHold(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 1000m, 150m);
        escrow.Release();

        // Double release must fail
        Assert.Throws<InvalidOperationException>(() => escrow.Release());

        // Refund after release must fail
        Assert.Throws<InvalidOperationException>(() => escrow.Refund("Cannot refund released funds"));

        // New escrow for refund testing
        var escrow2 = new EscrowHold(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 1000m, 150m);
        escrow2.Refund("Seeker cancellation");

        // Double refund must fail
        Assert.Throws<InvalidOperationException>(() => escrow2.Refund("Already refunded"));

        // Release after refund must fail
        Assert.Throws<InvalidOperationException>(() => escrow2.Release());
    }

    [Fact]
    public void EscrowHold_Refund_SetsStatusRefunded()
    {
        var escrow = new EscrowHold(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 1000m, 150m);
        escrow.Refund("Seeker cancelled within free cancellation window");

        Assert.Equal(EscrowStatus.Refunded, escrow.Status);
        Assert.NotNull(escrow.ReleasedAt);
        Assert.Contains("cancelled", escrow.ResolutionNotes);
    }

    [Fact]
    public void PayoutRequest_Lifecycle_TransitionsCorrectly()
    {
        var userId = Guid.NewGuid();
        var payout = new PayoutRequest(userId, 1700m, 15m, PayoutMethodType.Upi, "companion@okhdfcbank");

        Assert.Equal(PayoutStatus.Pending, payout.Status);
        Assert.Equal("companion@okhdfcbank", payout.Destination);

        payout.MarkProcessing("pout_rzp_12345");
        Assert.Equal(PayoutStatus.Processing, payout.Status);
        Assert.Equal("pout_rzp_12345", payout.RazorpayPayoutId);

        payout.MarkCompleted();
        Assert.Equal(PayoutStatus.Completed, payout.Status);
    }
}
