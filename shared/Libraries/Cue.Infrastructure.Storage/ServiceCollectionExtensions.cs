using Amazon.S3;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Cue.Infrastructure.Storage;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddS3BlobStorage(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.AddSingleton<IAmazonS3>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<StorageOptions>>().Value;
            var config = new AmazonS3Config
            {
                ServiceURL = options.ServiceUrl,
                ForcePathStyle = true, // required for MinIO
                AuthenticationRegion = "us-east-1", // SDK demands a region even for MinIO
            };
            return new AmazonS3Client(options.AccessKey, options.SecretKey, config);
        });
        services.AddSingleton<IBlobStorage, S3BlobStorage>();
        return services;
    }
}
