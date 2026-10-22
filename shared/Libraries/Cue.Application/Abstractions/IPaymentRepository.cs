using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IPaymentRepository
{
    Task AddAsync(PaymentTransaction transaction, CancellationToken cancellationToken);
    Task<PaymentTransaction?> GetByIdAsync(Guid transactionId, CancellationToken cancellationToken);
    Task<Wallet?> GetWalletByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<Wallet> GetOrCreateWalletAsync(Guid userId, string currency, CancellationToken cancellationToken);
    Task AddWalletTransactionAsync(WalletTransaction transaction, CancellationToken cancellationToken);
    Task<IReadOnlyList<WalletTransaction>> GetWalletTransactionsAsync(Guid walletId, int limit, CancellationToken cancellationToken);
    Task<EscrowHold?> GetEscrowHoldByOrderIdAsync(Guid orderId, CancellationToken cancellationToken);
    Task AddEscrowHoldAsync(EscrowHold escrow, CancellationToken cancellationToken);
    Task AddPayoutRequestAsync(PayoutRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<PayoutRequest>> GetPayoutRequestsByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<(decimal GrossRevenue, decimal PlatformCommission, decimal ClearedBalance, decimal PendingBalance)> GetProviderEarningsSummaryAsync(Guid providerId, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
