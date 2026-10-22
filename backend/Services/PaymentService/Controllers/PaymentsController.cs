using System.Security.Claims;
using System.Text.Json;
using Cue.Application.Abstractions;
using Cue.Domain;
using Cue.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PaymentService;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/v1/payments")]
public sealed class PaymentsController(
    IRazorpayGateway razorpayGateway,
    IPaymentRepository repository,
    CueDbContext dbContext,
    IOptions<RazorpayOptions> razorpayOptions) : ControllerBase
{
    private readonly RazorpayOptions rzpSettings = razorpayOptions.Value;

    [HttpGet("wallet/balance")]
    [Authorize]
    [ProducesResponseType(typeof(WalletBalanceResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<WalletBalanceResponse>> GetWalletBalance(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var wallet = await repository.GetOrCreateWalletAsync(userId, "INR", cancellationToken);
        return Ok(new WalletBalanceResponse(wallet.UserId, wallet.AvailableBalance, wallet.PendingBalance, wallet.Currency));
    }

    [HttpGet("wallet/transactions")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<WalletTransactionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<WalletTransactionDto>>> GetWalletTransactions(
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var wallet = await repository.GetOrCreateWalletAsync(userId, "INR", cancellationToken);
        var transactions = await repository.GetWalletTransactionsAsync(wallet.Id, Math.Min(limit, 100), cancellationToken);

        var dtos = transactions.Select(t => new WalletTransactionDto(
            t.Id,
            t.Amount,
            t.Direction.ToString(),
            t.Type.ToString(),
            t.BalanceAfter,
            t.ReferenceId,
            t.Description,
            t.CreatedAt)).ToList();

        return Ok(dtos);
    }

    [HttpPost("wallet/topup/order")]
    [Authorize]
    [ProducesResponseType(typeof(CreateTopUpOrderResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CreateTopUpOrderResponse>> CreateTopUpOrder(
        [FromBody] CreateTopUpOrderRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        if (request.Amount < 10m) return BadRequest(new { error = "Minimum top-up amount is ₹10." });

        var currency = string.IsNullOrWhiteSpace(request.Currency) ? "INR" : request.Currency.ToUpperInvariant();
        var receipt = $"topup_{userId:N}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        var notes = new Dictionary<string, string>
        {
            ["user_id"] = userId.ToString(),
            ["type"] = "wallet_topup"
        };

        var order = await razorpayGateway.CreateOrderAsync(request.Amount, currency, receipt, notes, cancellationToken);

        var transaction = new PaymentTransaction(
            Guid.NewGuid(),
            order.OrderId,
            request.Amount,
            currency,
            new Dictionary<string, string>
            {
                ["user_id"] = userId.ToString(),
                ["type"] = "topup",
                ["status"] = order.Status
            });

        await repository.AddAsync(transaction, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return Ok(new CreateTopUpOrderResponse(
            order.OrderId,
            request.Amount,
            currency,
            rzpSettings.KeyId,
            transaction.Id));
    }

    [HttpPost("wallet/topup/verify")]
    [Authorize]
    [ProducesResponseType(typeof(WalletBalanceResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<WalletBalanceResponse>> VerifyTopUp(
        [FromBody] VerifyTopUpRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var isValid = razorpayGateway.VerifyPaymentSignature(
            request.RazorpayOrderId,
            request.RazorpayPaymentId,
            request.RazorpaySignature);

        if (!isValid)
        {
            return BadRequest(new { error = "Invalid payment signature." });
        }

        var wallet = await repository.GetOrCreateWalletAsync(userId, "INR", cancellationToken);
        wallet.CreditAvailable(request.Amount);

        var txn = new WalletTransaction(
            wallet.Id,
            request.Amount,
            TransactionDirection.Credit,
            WalletTransactionType.TopUp,
            wallet.AvailableBalance,
            null,
            $"Wallet Top-Up via Razorpay UPI (Ref: {request.RazorpayPaymentId})");

        await repository.AddWalletTransactionAsync(txn, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return Ok(new WalletBalanceResponse(wallet.UserId, wallet.AvailableBalance, wallet.PendingBalance, wallet.Currency));
    }

    [HttpPost("checkout/wallet")]
    [Authorize]
    [ProducesResponseType(typeof(WalletCheckoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<WalletCheckoutResponse>> CheckoutWithWallet(
        [FromBody] WalletCheckoutRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var order = await dbContext.ServiceOrders.SingleOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
        if (order is null) return NotFound(new { error = "Service order not found." });
        if (order.SeekerId != userId) return Forbid();
        if (order.Status != OrderStatus.PendingPayment)
        {
            return Conflict(new { error = $"Order cannot be paid in current status: {order.Status}" });
        }

        var seekerWallet = await repository.GetOrCreateWalletAsync(userId, "INR", cancellationToken);
        if (seekerWallet.AvailableBalance < order.TotalAmount)
        {
            return BadRequest(new
            {
                error = $"Insufficient wallet balance (Available: ₹{seekerWallet.AvailableBalance:N2}, Required: ₹{order.TotalAmount:N2}). Please top up first."
            });
        }

        var existingEscrow = await repository.GetEscrowHoldByOrderIdAsync(order.Id, cancellationToken);
        if (existingEscrow is not null)
        {
            return Conflict(new { error = "Escrow hold already exists for this booking." });
        }

        // Deduct from seeker available balance
        seekerWallet.DebitAvailable(order.TotalAmount);
        var seekerTxn = new WalletTransaction(
            seekerWallet.Id,
            order.TotalAmount,
            TransactionDirection.Debit,
            WalletTransactionType.BookingPayment,
            seekerWallet.AvailableBalance,
            order.Id,
            $"Payment held in escrow for booking #{order.Id.ToString()[..8]}");
        await repository.AddWalletTransactionAsync(seekerTxn, cancellationToken);

        // Calculate 15% platform commission
        var platformFee = decimal.Round(order.TotalAmount * 0.15m, 2);
        var providerEarnings = order.TotalAmount - platformFee;

        // Create Escrow Hold
        var escrow = new EscrowHold(order.Id, order.SeekerId, order.ProviderId, order.TotalAmount, platformFee);
        await repository.AddEscrowHoldAsync(escrow, cancellationToken);

        // Credit provider pending balance
        var providerWallet = await repository.GetOrCreateWalletAsync(order.ProviderId, "INR", cancellationToken);
        providerWallet.CreditPending(providerEarnings);

        // Confirm order
        order.Confirm();

        await repository.SaveChangesAsync(cancellationToken);

        return Ok(new WalletCheckoutResponse(
            order.Id,
            escrow.Id,
            order.TotalAmount,
            platformFee,
            providerEarnings,
            order.Status.ToString()));
    }

    [HttpPost("escrow/release")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ReleaseEscrow(
        [FromBody] ReleaseEscrowRequest request,
        CancellationToken cancellationToken)
    {
        var escrow = await repository.GetEscrowHoldByOrderIdAsync(request.OrderId, cancellationToken);
        if (escrow is null) return NotFound(new { error = "Escrow hold not found." });

        if (escrow.Status != EscrowStatus.Held)
        {
            return Conflict(new { error = $"Escrow is already in status: {escrow.Status}" });
        }

        escrow.Release();

        // Release provider pending balance to available
        var providerWallet = await repository.GetOrCreateWalletAsync(escrow.ProviderId, "INR", cancellationToken);
        providerWallet.ReleasePendingToAvailable(escrow.NetAmount);

        var txn = new WalletTransaction(
            providerWallet.Id,
            escrow.NetAmount,
            TransactionDirection.Credit,
            WalletTransactionType.BookingEarning,
            providerWallet.AvailableBalance,
            escrow.OrderId,
            $"Net earnings released from completed booking #{escrow.OrderId.ToString()[..8]} (Platform fee: ₹{escrow.PlatformFee:N2})");
        await repository.AddWalletTransactionAsync(txn, cancellationToken);

        await repository.SaveChangesAsync(cancellationToken);

        return Ok(new { status = "Escrow released successfully", netAmount = escrow.NetAmount, platformFee = escrow.PlatformFee });
    }

    [HttpGet("provider/earnings")]
    [Authorize]
    [ProducesResponseType(typeof(ProviderEarningsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProviderEarningsResponse>> GetProviderEarnings(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var (gross, commission, cleared, pending) = await repository.GetProviderEarningsSummaryAsync(userId, cancellationToken);
        return Ok(new ProviderEarningsResponse(gross, commission, cleared, pending, "INR"));
    }

    [HttpPost("payout/request")]
    [Authorize]
    [ProducesResponseType(typeof(PayoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<PayoutResponse>> RequestPayout(
        [FromBody] RequestPayoutDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        if (request.Amount < 100m) return BadRequest(new { error = "Minimum payout amount is ₹100." });

        var wallet = await repository.GetOrCreateWalletAsync(userId, "INR", cancellationToken);
        if (wallet.AvailableBalance < request.Amount)
        {
            return BadRequest(new { error = $"Insufficient cleared balance (Available: ₹{wallet.AvailableBalance:N2})." });
        }

        // Instant UPI convenience fee ₹5 or 0
        var fee = 5m;
        var netTransfer = request.Amount - fee;

        wallet.DebitAvailable(request.Amount);

        var txn = new WalletTransaction(
            wallet.Id,
            request.Amount,
            TransactionDirection.Debit,
            WalletTransactionType.Payout,
            wallet.AvailableBalance,
            null,
            $"Payout to {request.PayoutType} ({request.Destination}) - Transfer: ₹{netTransfer:N2}, Fee: ₹{fee:N2}");
        await repository.AddWalletTransactionAsync(txn, cancellationToken);

        var payout = new PayoutRequest(userId, netTransfer, fee, request.PayoutType, request.Destination);
        // In local development or until production webhook, mark completed with reference ID
        payout.MarkCompleted($"pout_mock_{Guid.NewGuid():N}");

        await repository.AddPayoutRequestAsync(payout, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return Ok(new PayoutResponse(
            payout.Id,
            payout.Amount,
            payout.FeeAmount,
            payout.Status.ToString(),
            payout.Destination,
            payout.CreatedAt));
    }

    [HttpGet("payout/history")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<PayoutResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PayoutResponse>>> GetPayoutHistory(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var history = await repository.GetPayoutRequestsByUserIdAsync(userId, cancellationToken);
        var dtos = history.Select(p => new PayoutResponse(
            p.Id,
            p.Amount,
            p.FeeAmount,
            p.Status.ToString(),
            p.Destination,
            p.CreatedAt)).ToList();

        return Ok(dtos);
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(cancellationToken);

        if (Request.Headers.TryGetValue("X-Razorpay-Signature", out var signatureHeader))
        {
            var isValid = razorpayGateway.VerifyWebhookSignature(body, signatureHeader.ToString());
            if (!isValid) return Unauthorized();
        }

        return Ok();
    }

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(value, out userId)) return true;

        if (Request.Headers.TryGetValue("X-User-Id", out var headerValue) &&
            Guid.TryParse(headerValue.ToString(), out userId))
        {
            return true;
        }

        userId = Guid.Empty;
        return false;
    }
}
