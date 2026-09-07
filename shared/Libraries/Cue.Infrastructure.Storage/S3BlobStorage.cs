using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Util;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Cue.Infrastructure.Storage;

/// <summary>
/// S3-compatible blob storage (works with MinIO). Objects are public-read so they
/// can be served straight from the browser.
/// </summary>
public sealed class S3BlobStorage : IBlobStorage
{
    private readonly IAmazonS3 client;
    private readonly StorageOptions options;
    private readonly ILogger<S3BlobStorage> logger;

    public S3BlobStorage(IAmazonS3 client, IOptions<StorageOptions> options, ILogger<S3BlobStorage> logger)
    {
        this.client = client;
        this.options = options.Value;
        this.logger = logger;
    }

    public async Task<string> UploadAsync(string objectName, Stream content, string contentType, CancellationToken ct = default)
    {
        await EnsureBucketAsync(ct);

        await client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = options.Bucket,
            Key = objectName,
            InputStream = content,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead,
        }, ct);

        logger.LogInformation("Stored blob {Object} in bucket {Bucket}", objectName, options.Bucket);
        return GetPublicUrl(objectName);
    }

    public string GetPublicUrl(string objectName) =>
        $"{options.PublicBaseUrl.TrimEnd('/')}/{options.Bucket}/{objectName}";

    private async Task EnsureBucketAsync(CancellationToken ct)
    {
        if (await AmazonS3Util.DoesS3BucketExistV2Async(client, options.Bucket))
        {
            return;
        }

        await client.PutBucketAsync(options.Bucket, ct);
        // Public-read at bucket level so avatars render without signed URLs.
        await client.PutACLAsync(new PutACLRequest
        {
            BucketName = options.Bucket,
            CannedACL = S3CannedACL.PublicRead,
        }, ct);
        logger.LogInformation("Created public-read bucket {Bucket}", options.Bucket);
    }
}
