namespace Cue.Infrastructure.Storage;

public sealed record StorageOptions
{
    public const string SectionName = "Storage";

    /// <summary>S3-compatible endpoint, e.g. http://loveagain-loveagain-minio:80.</summary>
    public string ServiceUrl { get; init; } = "http://localhost:9000";

    /// <summary>Browser-facing prefix serving the bucket, e.g. /minio via ingress.</summary>
    public string PublicBaseUrl { get; init; } = "/minio";

    public string AccessKey { get; init; } = string.Empty;

    public string SecretKey { get; init; } = string.Empty;

    public string Bucket { get; init; } = "photos";
}
