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
        builder.Property(user => user.Phone).HasMaxLength(50);
        builder.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.LastName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.Gender).HasColumnName("gender").HasMaxLength(30);
        builder.Property(user => user.IsEmailVerified).HasColumnName("is_email_verified").HasDefaultValue(false);
        builder.Property(user => user.IsPhoneVerified).HasColumnName("is_phone_verified").HasDefaultValue(false);
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
        builder.Property(profile => profile.DisplayName).HasColumnName("display_name").HasMaxLength(150);
        builder.Property(profile => profile.Gender).HasColumnName("gender").HasMaxLength(30);
        builder.Property(profile => profile.City).HasColumnName("city").HasMaxLength(100);
        builder.Property(profile => profile.Area).HasColumnName("area").HasMaxLength(120);
        builder.Property(profile => profile.ProfileImages).HasColumnName("profile_images").HasColumnType("text[]");
        builder.Property(profile => profile.ProfileImages).HasConversion(
            images => images.ToArray(),
            values => values ?? Array.Empty<string>());
        builder.Property(profile => profile.Specialties).HasColumnType("text[]");
        builder.Property(profile => profile.Specialties).HasConversion(
            specialties => specialties.ToArray(),
            values => values);

        builder.Property(profile => profile.Latitude).HasColumnName("latitude");
        builder.Property(profile => profile.Longitude).HasColumnName("longitude");
        builder.Property(profile => profile.DeletedAt).HasColumnName("deleted_at");
        builder.HasQueryFilter(profile => profile.DeletedAt == null);

        builder.Property(profile => profile.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .HasDefaultValue(VerificationStatus.PendingReview);
        builder.Property(profile => profile.IdProofUrl).HasColumnName("id_proof_url");
        builder.Property(profile => profile.SelfieVerificationUrl).HasColumnName("selfie_verification_url");
        builder.Property(profile => profile.RejectionReason).HasColumnName("rejection_reason");
        builder.Property(profile => profile.ReviewedAt).HasColumnName("reviewed_at");
        builder.Property(profile => profile.ReviewedByAdminId).HasColumnName("reviewed_by_admin_id");
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
        builder.Property(order => order.CheckInPin).HasMaxLength(10);
        builder.Property(order => order.CompletionPin).HasMaxLength(10);
        builder.Property(order => order.Requirements)
            .HasColumnName("requirements")
            .HasColumnType("jsonb")
            .HasConversion(
                req => req == null ? null : System.Text.Json.JsonSerializer.Serialize(req, (System.Text.Json.JsonSerializerOptions?)null),
                json => string.IsNullOrWhiteSpace(json)
                    ? null
                    : System.Text.Json.JsonSerializer.Deserialize<BookingRequirements>(json, (System.Text.Json.JsonSerializerOptions?)null));
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
        builder.HasIndex(review => new { review.OrderId, review.ReviewerId }).IsUnique();
        builder.HasIndex(review => review.RevieweeId);
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
        builder.Property(transaction => transaction.Metadata)
            .HasColumnType("jsonb")
            .HasConversion(
                dict => System.Text.Json.JsonSerializer.Serialize(dict, (System.Text.Json.JsonSerializerOptions?)null),
                json => string.IsNullOrWhiteSpace(json)
                    ? new Dictionary<string, string>()
                    : (System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, string>()));
        builder.HasIndex(transaction => transaction.StripePaymentIntentId).IsUnique();
    }
}

internal sealed class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.ToTable("wallets", "payments");
        builder.HasKey(w => w.Id);
        builder.HasIndex(w => w.UserId).IsUnique();
        builder.Property(w => w.AvailableBalance).HasPrecision(12, 2);
        builder.Property(w => w.PendingBalance).HasPrecision(12, 2);
        builder.Property(w => w.Currency).HasMaxLength(3).IsRequired();
    }
}

internal sealed class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
{
    public void Configure(EntityTypeBuilder<WalletTransaction> builder)
    {
        builder.ToTable("wallet_transactions", "payments");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Amount).HasPrecision(12, 2);
        builder.Property(t => t.BalanceAfter).HasPrecision(12, 2);
        builder.Property(t => t.Direction).HasConversion<string>().HasMaxLength(20);
        builder.Property(t => t.Type).HasConversion<string>().HasMaxLength(30);
        builder.Property(t => t.Description).HasMaxLength(500);
        builder.HasIndex(t => new { t.WalletId, t.CreatedAt });
    }
}

internal sealed class EscrowHoldConfiguration : IEntityTypeConfiguration<EscrowHold>
{
    public void Configure(EntityTypeBuilder<EscrowHold> builder)
    {
        builder.ToTable("escrow_holds", "payments");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => e.OrderId).IsUnique();
        builder.Property(e => e.GrossAmount).HasPrecision(12, 2);
        builder.Property(e => e.PlatformFee).HasPrecision(12, 2);
        builder.Property(e => e.NetAmount).HasPrecision(12, 2);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.HasIndex(e => new { e.SeekerId, e.Status });
        builder.HasIndex(e => new { e.ProviderId, e.Status });
    }
}

internal sealed class PayoutRequestConfiguration : IEntityTypeConfiguration<PayoutRequest>
{
    public void Configure(EntityTypeBuilder<PayoutRequest> builder)
    {
        builder.ToTable("payout_requests", "payments");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Amount).HasPrecision(12, 2);
        builder.Property(p => p.FeeAmount).HasPrecision(12, 2);
        builder.Property(p => p.PayoutType).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.Destination).HasMaxLength(255).IsRequired();
        builder.HasIndex(p => new { p.UserId, p.CreatedAt });
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

internal sealed class UserKycDocumentConfiguration : IEntityTypeConfiguration<UserKycDocument>
{
    public void Configure(EntityTypeBuilder<UserKycDocument> builder)
    {
        builder.ToTable("user_kyc_documents", "profiles");
        builder.HasKey(d => d.Id);
        builder.HasIndex(d => d.UserId).IsUnique();
        builder.Property(d => d.DocumentType).HasMaxLength(50).IsRequired();
        builder.Property(d => d.DocumentNumber).HasMaxLength(100).IsRequired();
        builder.Property(d => d.FrontImageUrl).HasColumnType("text").IsRequired();
        builder.Property(d => d.BackImageUrl).HasColumnType("text").IsRequired();
        builder.Property(d => d.SelfieImageUrl).HasColumnType("text").IsRequired();
        builder.Property(d => d.Status).HasConversion<int>().IsRequired();
        builder.Property(d => d.RejectionReason).HasMaxLength(1000);
        builder.HasIndex(d => d.Status);
    }
}
