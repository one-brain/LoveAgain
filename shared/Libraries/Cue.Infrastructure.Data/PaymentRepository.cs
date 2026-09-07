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

    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
}
