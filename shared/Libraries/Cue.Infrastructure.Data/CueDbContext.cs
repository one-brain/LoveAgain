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
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<EscrowHold> EscrowHolds => Set<EscrowHold>();
    public DbSet<PayoutRequest> PayoutRequests => Set<PayoutRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TrustEvent> TrustEvents => Set<TrustEvent>();
    public DbSet<UserKycDocument> UserKycDocuments => Set<UserKycDocument>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(w =>
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CueDbContext).Assembly);

        if (Database.ProviderName?.Contains("InMemory", StringComparison.OrdinalIgnoreCase) == true)
        {
            modelBuilder.Entity<User>(b =>
            {
                b.Property(u => u.Roles).HasConversion(
                    roles => string.Join(',', roles.Select(r => (int)r)),
                    str => str.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => (UserRole)int.Parse(s)).ToHashSet());
            });

            modelBuilder.Entity<ProviderProfile>(b =>
            {
                b.Property(p => p.ProfileImages).HasConversion(
                    images => string.Join(';', images),
                    str => str.Split(';', StringSplitOptions.RemoveEmptyEntries));
                b.Property(p => p.Specialties).HasConversion(
                    specialties => string.Join(';', specialties),
                    str => str.Split(';', StringSplitOptions.RemoveEmptyEntries));
            });
        }
    }
}
