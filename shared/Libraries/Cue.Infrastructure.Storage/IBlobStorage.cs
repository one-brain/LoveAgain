namespace Cue.Infrastructure.Storage;

public interface IBlobStorage
{
    /// <summary>
    /// Uploads a blob and returns its public URL.
    /// </summary>
    Task<string> UploadAsync(string objectName, Stream content, string contentType, CancellationToken ct = default);
}
