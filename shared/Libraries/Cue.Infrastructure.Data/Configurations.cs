using Cue.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cue.Infrastructure.Data;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", "auth");
        builder.HasKey(user => user.Id);
        builder.Property(user => user.Email).HasMaxLength(255).IsRequired();
        builder.Property(user => user.PasswordHash).HasMaxLength(500);
        builder.HasIndex(user => user.Email).IsUnique();
        builder.Property(user => user.Phone).HasMaxLength(20);
        builder.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.LastName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.Roles).HasColumnName("roles").HasColumnType("integer[]").HasConversion(
            roles => roles.Select(role => (int)role).ToArray(),
            values => values.Select(value => (UserRole)value).ToHashSet());
        builder.HasQueryFilter(user => user.TrustScore >= 0);
    }
}

internal sealed class ProviderProfileConfiguration : IEntityTypeConfiguration<ProviderProfile>
{
    public void Configure(EntityTypeBuilder<ProviderProfile> builder)
    {
        builder.ToTable("provider_profiles", "profiles");
        builder.HasKey(profile => profile.Id);
        builder.HasIndex(profile => profile.UserId).IsUnique();
        builder.Property(profile => profile.HourlyRate).HasPrecision(10, 2);
        builder.Property(profile => profile.MaxRadiusKm).HasPrecision(5, 2);
        builder.Property(profile => profile.Specialties).HasColumnType("text[]");
        builder.Property(profile => profile.Specialties).HasConversion(
            specialties => specialties.ToArray(),
            values => values);

        // Location properties - stored as separate columns for simplicity
        // PostGIS geography column can be computed from these via DB migration
        builder.Property(profile => profile.Latitude).HasColumnName("latitude");
        builder.Property(profile => profile.Longitude).HasColumnName("longitude");
    }
}

internal sealed class AvailabilitySlotConfiguration : IEntityTypeConfiguration<AvailabilitySlot>
{
    public void Configure(EntityTypeBuilder<AvailabilitySlot> builder)
    {
        builder.ToTable("availability_slots", "bookings");
        builder.HasKey(slot => slot.Id);
        builder.HasIndex(slot => new { slot.ProviderId, slot.StartTime })
            .HasFilter("is_booked = false");
        builder.HasIndex(slot => slot.BookingId).IsUnique().HasFilter("booking_id IS NOT NULL");
    }
}

internal sealed class ServiceOrderConfiguration : IEntityTypeConfiguration<ServiceOrder>
{
    public void Configure(EntityTypeBuilder<ServiceOrder> builder)
    {
        builder.ToTable("service_orders", "bookings");
        builder.HasKey(order => order.Id);
        builder.Property(order => order.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(order => order.TotalAmount).HasPrecision(10, 2);
        builder.Property(order => order.PlatformFee).HasPrecision(10, 2);
        builder.Property(order => order.ProviderEarnings).HasPrecision(10, 2);
        builder.HasIndex(order => new { order.SeekerId, order.Status });
        builder.HasIndex(order => new { order.ProviderId, order.Status });
        builder.HasIndex(order => new { order.StartTime, order.EndTime });
    }
}

internal sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("reviews", "reviews");
        builder.HasKey(review => review.Id);
        builder.HasIndex(review => review.OrderId).IsUnique();
        builder.Property(review => review.Comment).HasMaxLength(4000).IsRequired();
    }
}

internal sealed class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("messages", "chat");
        builder.HasKey(message => message.Id);
        builder.Property(message => message.MessageType).HasConversion<string>().HasMaxLength(50);
        builder.Property(message => message.Content).HasMaxLength(10000).IsRequired();
        builder.HasIndex(message => new { message.OrderId, message.SentAt });
    }
}

internal sealed class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("payment_transactions", "payments");
        builder.HasKey(transaction => transaction.Id);
        builder.Property(transaction => transaction.Amount).HasPrecision(10, 2);
        builder.Property(transaction => transaction.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(transaction => transaction.Metadata).HasColumnType("jsonb");
        builder.HasIndex(transaction => transaction.StripePaymentIntentId).IsUnique();
    }
}

internal sealed class DisputeConfiguration : IEntityTypeConfiguration<Dispute>
{
    public void Configure(EntityTypeBuilder<Dispute> builder)
    {
        builder.ToTable("disputes", "support");
        builder.HasKey(dispute => dispute.Id);
        builder.Property(dispute => dispute.Status).HasConversion<string>().HasMaxLength(50);
    }
}

internal sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications", "notifications");
        builder.HasKey(notification => notification.Id);
        builder.Property(notification => notification.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(notification => notification.Content).HasMaxLength(4000).IsRequired();
        builder.HasIndex(notification => new { notification.UserId, notification.IsRead });
    }
}

internal sealed class TrustEventConfiguration : IEntityTypeConfiguration<TrustEvent>
{
    public void Configure(EntityTypeBuilder<TrustEvent> builder)
    {
        builder.ToTable("trust_events", "reviews");
        builder.HasKey(trustEvent => trustEvent.Id);
        builder.HasIndex(trustEvent => new { trustEvent.UserId, trustEvent.Timestamp });
    }
}

internal sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens", "auth");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.TokenHash).HasMaxLength(128).IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.HasIndex(t => t.UserId);
    }
}

internal sealed class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("password_reset_tokens", "auth");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.TokenHash).HasMaxLength(128).IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.HasIndex(t => t.UserId);
    }
}

internal sealed class EmailVerificationTokenConfiguration : IEntityTypeConfiguration<EmailVerificationToken>
{
    public void Configure(EntityTypeBuilder<EmailVerificationToken> builder)
    {
        builder.ToTable("email_verification_tokens", "auth");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.TokenHash).HasMaxLength(128).IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.HasIndex(t => t.UserId);
    }
}