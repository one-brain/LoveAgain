using Cue.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cue.Infrastructure.Data;

public sealed class CueDbContext(DbContextOptions<CueDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();
    public DbSet<ProviderProfile> ProviderProfiles => Set<ProviderProfile>();
    public DbSet<AvailabilitySlot> AvailabilitySlots => Set<AvailabilitySlot>();
    public DbSet<ServiceOrder> ServiceOrders => Set<ServiceOrder>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Dispute> Disputes => Set<Dispute>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TrustEvent> TrustEvents => Set<TrustEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CueDbContext).Assembly);
    }
}