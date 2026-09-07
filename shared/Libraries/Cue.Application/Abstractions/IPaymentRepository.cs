using Cue.Domain;

namespace Cue.Application.Abstractions;

public interface IPaymentRepository
{
    Task AddAsync(PaymentTransaction transaction, CancellationToken cancellationToken);
    Task<PaymentTransaction?> GetByIdAsync(Guid transactionId, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
