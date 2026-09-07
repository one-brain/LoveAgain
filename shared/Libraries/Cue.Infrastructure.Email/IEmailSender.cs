namespace Cue.Infrastructure.Email;

/// <summary>
/// A single transactional email ready for delivery.
/// </summary>
public sealed record EmailMessage(
    string ToEmail,
    string Subject,
    string TextBody,
    string HtmlBody);

public interface IEmailSender
{
    /// <summary>
    /// Sends the message. Returns false when the provider rejects it; callers
    /// decide whether that is fatal or worth logging and continuing.
    /// </summary>
    Task<bool> SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}
