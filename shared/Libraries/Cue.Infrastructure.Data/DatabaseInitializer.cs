using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Cue.Infrastructure.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(CueDbContext dbContext, CancellationToken cancellationToken = default)
    {
        await TryCreateSchemaAsync(dbContext, "auth", cancellationToken);
        await TryCreateSchemaAsync(dbContext, "payments", cancellationToken);
        await TryCreateExtensionAsync(dbContext, "postgis", cancellationToken);
        await TryCreateExtensionAsync(dbContext, "pgcrypto", cancellationToken);
        try
        {
            // Apply any pending EF Core migrations to bring the database up to date
            await dbContext.Database.MigrateAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database migration notice: {ex.Message}");
        }
        await EnsureNewTablesAsync(dbContext, cancellationToken);
    }

    private static async Task TryCreateSchemaAsync(CueDbContext dbContext, string schemaName, CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync($"CREATE SCHEMA IF NOT EXISTS {schemaName};", cancellationToken);
        }
        catch (PostgresException ex) when (
            ex.Message.Contains("does not exist", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("invalid schema name", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine($"Warning: failed to create schema '{schemaName}': {ex.MessageText}");
        }
    }

    private static async Task EnsureNewTablesAsync(CueDbContext dbContext, CancellationToken cancellationToken)
    {
        // DDL for tables added after the databases were first created, since
        // EnsureCreatedAsync never alters an existing database.
        var statements = new[]
        {
            """
            CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                token_hash character varying(128) NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                revoked_at timestamp with time zone NULL,
                created_at timestamp with time zone NOT NULL
            );
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_refresh_tokens_token_hash ON auth.refresh_tokens (token_hash);",
            "CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON auth.refresh_tokens (user_id);",
            """
            CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                token_hash character varying(128) NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                used_at timestamp with time zone NULL,
                created_at timestamp with time zone NOT NULL
            );
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON auth.password_reset_tokens (token_hash);",
            "CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON auth.password_reset_tokens (user_id);",
            """
            CREATE TABLE IF NOT EXISTS auth.email_verification_tokens (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                token_hash character varying(128) NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                used_at timestamp with time zone NULL,
                created_at timestamp with time zone NOT NULL
            );
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_email_verification_tokens_token_hash ON auth.email_verification_tokens (token_hash);",
            "CREATE INDEX IF NOT EXISTS ix_email_verification_tokens_user_id ON auth.email_verification_tokens (user_id);",
            "ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone NULL;",
            "ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS photo_url text NULL;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS latitude double precision NULL;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS longitude double precision NULL;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone NULL;",
            """
            CREATE TABLE IF NOT EXISTS payments.wallets (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL UNIQUE,
                available_balance numeric(12,2) NOT NULL DEFAULT 0.00,
                pending_balance numeric(12,2) NOT NULL DEFAULT 0.00,
                currency character varying(3) NOT NULL DEFAULT 'INR',
                created_at timestamp with time zone NOT NULL,
                updated_at timestamp with time zone NOT NULL
            );
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_wallets_user_id ON payments.wallets (user_id);",
            """
            CREATE TABLE IF NOT EXISTS payments.wallet_transactions (
                id uuid NOT NULL PRIMARY KEY,
                wallet_id uuid NOT NULL,
                amount numeric(12,2) NOT NULL,
                direction character varying(20) NOT NULL,
                type character varying(30) NOT NULL,
                balance_after numeric(12,2) NOT NULL,
                reference_id uuid NULL,
                description character varying(500) NOT NULL DEFAULT '',
                created_at timestamp with time zone NOT NULL
            );
            """,
            "CREATE INDEX IF NOT EXISTS ix_wallet_transactions_wallet_created ON payments.wallet_transactions (wallet_id, created_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS payments.escrow_holds (
                id uuid NOT NULL PRIMARY KEY,
                order_id uuid NOT NULL UNIQUE,
                seeker_id uuid NOT NULL,
                provider_id uuid NOT NULL,
                gross_amount numeric(12,2) NOT NULL,
                platform_fee numeric(12,2) NOT NULL,
                net_amount numeric(12,2) NOT NULL,
                status character varying(30) NOT NULL,
                held_at timestamp with time zone NOT NULL,
                released_at timestamp with time zone NULL,
                resolution_notes text NULL
            );
            """,
            "CREATE INDEX IF NOT EXISTS ix_escrow_holds_seeker ON payments.escrow_holds (seeker_id, status);",
            "CREATE INDEX IF NOT EXISTS ix_escrow_holds_provider ON payments.escrow_holds (provider_id, status);",
            """
            CREATE TABLE IF NOT EXISTS payments.payout_requests (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                amount numeric(12,2) NOT NULL,
                fee_amount numeric(12,2) NOT NULL,
                payout_type character varying(20) NOT NULL,
                destination character varying(255) NOT NULL,
                status character varying(20) NOT NULL,
                razorpay_payout_id character varying(255) NULL,
                failure_reason text NULL,
                created_at timestamp with time zone NOT NULL,
                processed_at timestamp with time zone NULL
            );
            """,
            "CREATE INDEX IF NOT EXISTS ix_payout_requests_user ON payments.payout_requests (user_id, created_at DESC);",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS status integer DEFAULT 3;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS id_proof_url text;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS selfie_verification_url text;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS rejection_reason text;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;",
            "ALTER TABLE profiles.provider_profiles ADD COLUMN IF NOT EXISTS reviewed_by_admin_id uuid;",
            "CREATE INDEX IF NOT EXISTS ix_provider_profiles_status ON profiles.provider_profiles (status, is_active);"
        };

        foreach (var statement in statements)
        {
            try
            {
                await dbContext.Database.ExecuteSqlRawAsync(statement, cancellationToken);
            }
            catch (PostgresException ex) when (ex.Message.Contains("does not exist", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine($"Warning: skipping DDL because a schema/table does not exist: {ex.MessageText}");
            }
        }
    }

    private static async Task TryCreateExtensionAsync(CueDbContext dbContext, string extensionName, CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync($"CREATE EXTENSION IF NOT EXISTS {extensionName};", cancellationToken);
        }
        catch (PostgresException ex) when (
            ex.SqlState == PostgresErrorCodes.FeatureNotSupported ||
            ex.Message.Contains("is not available", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("does not exist", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine($"Warning: PostgreSQL extension '{extensionName}' is not available in the current database image. Continuing without it.");
        }
    }
}
