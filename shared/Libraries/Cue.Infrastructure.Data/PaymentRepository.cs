using Cue.Application.Abstractions;
using Cue.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cue.Infrastructure.Data;

public sealed class PaymentRepository(CueDbContext dbContext) : IPaymentRepository
{
    public Task AddAsync(PaymentTransaction transaction, CancellationToken cancellationToken) =>
        dbContext.PaymentTransactions.AddAsync(transaction, cancellationToken).AsTask();

    public Task<PaymentTransaction?> GetByIdAsync(Guid transactionId, CancellationToken cancellationToken) =>
        dbContext.PaymentTransactions.SingleOrDefaultAsync(transaction => transaction.Id == transactionId, cancellationToken);

    public Task<Wallet?> GetWalletByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Wallets.SingleOrDefaultAsync(wallet => wallet.UserId == userId, cancellationToken);

    public async Task<Wallet> GetOrCreateWalletAsync(Guid userId, string currency, CancellationToken cancellationToken)
    {
        var wallet = await dbContext.Wallets.SingleOrDefaultAsync(w => w.UserId == userId, cancellationToken);
        if (wallet is not null) return wallet;

        wallet = new Wallet(userId, currency);
        await dbContext.Wallets.AddAsync(wallet, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return wallet;
    }

    public Task AddWalletTransactionAsync(WalletTransaction transaction, CancellationToken cancellationToken) =>
        dbContext.WalletTransactions.AddAsync(transaction, cancellationToken).AsTask();

    public async Task<IReadOnlyList<WalletTransaction>> GetWalletTransactionsAsync(Guid walletId, int limit, CancellationToken cancellationToken)
    {
        return await dbContext.WalletTransactions
            .Where(t => t.WalletId == walletId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public Task<EscrowHold?> GetEscrowHoldByOrderIdAsync(Guid orderId, CancellationToken cancellationToken) =>
        dbContext.EscrowHolds.SingleOrDefaultAsync(e => e.OrderId == orderId, cancellationToken);

    public Task AddEscrowHoldAsync(EscrowHold escrow, CancellationToken cancellationToken) =>
        dbContext.EscrowHolds.AddAsync(escrow, cancellationToken).AsTask();

    public Task AddPayoutRequestAsync(PayoutRequest request, CancellationToken cancellationToken) =>
        dbContext.PayoutRequests.AddAsync(request, cancellationToken).AsTask();

    public async Task<IReadOnlyList<PayoutRequest>> GetPayoutRequestsByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.PayoutRequests
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(decimal GrossRevenue, decimal PlatformCommission, decimal ClearedBalance, decimal PendingBalance)> GetProviderEarningsSummaryAsync(Guid providerId, CancellationToken cancellationToken)
    {
        var wallet = await GetWalletByUserIdAsync(providerId, cancellationToken);
        var clearedBalance = wallet?.AvailableBalance ?? 0m;
        var pendingBalance = wallet?.PendingBalance ?? 0m;

        var completedEscrows = await dbContext.EscrowHolds
            .Where(e => e.ProviderId == providerId && e.Status == EscrowStatus.Released)
            .ToListAsync(cancellationToken);

        var grossRevenue = completedEscrows.Sum(e => e.GrossAmount);
        var platformCommission = completedEscrows.Sum(e => e.PlatformFee);

        return (grossRevenue, platformCommission, clearedBalance, pendingBalance);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
}
