using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Cue.Infrastructure.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(CueDbContext dbContext, CancellationToken cancellationToken = default)
    {
        await TryCreateSchemaAsync(dbContext, "auth", cancellationToken);
        await TryCreateExtensionAsync(dbContext, "postgis", cancellationToken);
        await TryCreateExtensionAsync(dbContext, "pgcrypto", cancellationToken);
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);
        // EnsureCreatedAsync does not alter an existing database; new tables added
        // to the model must be created explicitly until EF migrations land (F-14-07).
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
            "ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS photo_url text NULL;"
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
