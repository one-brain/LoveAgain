using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace Cue.Infrastructure.Email;

public sealed class MailjetOptions
{
    public const string SectionName = "Mailjet";

    public string ApiKey { get; init; } = string.Empty;
    public string ApiSecret { get; init; } = string.Empty;
    /// <summary>Sandbox mode validates the payload without delivering email.</summary>
    public bool SandboxMode { get; init; }
    public string FromEmail { get; init; } = "no-reply@cue.local";
    public string FromName { get; init; } = "Cue";
}

/// <summary>
/// Sends transactional email via the Mailjet Send API v3.1
/// (POST /v3.1/send, HTTP basic auth). See https://dev.mailjet.com/email/guides/.
/// </summary>
public sealed class MailjetEmailSender(HttpClient httpClient, IOptions<MailjetOptions> options) : IEmailSender
{
    private static readonly JsonSerializerOptions PayloadOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly MailjetOptions settings = options.Value;

    public bool IsConfigured => !string.IsNullOrEmpty(settings.ApiKey) && !string.IsNullOrEmpty(settings.ApiSecret);

    public async Task<bool> SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
        {
            // Unconfigured (local dev): log instead of sending so flows still work.
            Console.WriteLine($"[EMAIL:dev-unconfigured] To={message.ToEmail} Subject=\"{message.Subject}\"");
            return true;
        }

        var payload = new
        {
            SandboxMode = settings.SandboxMode,
            Messages = new[]
            {
                new
                {
                    From = new { Email = settings.FromEmail, Name = settings.FromName },
                    To = new[] { new { Email = message.ToEmail } },
                    Subject = message.Subject,
                    TextPart = message.TextBody,
                    HTMLPart = message.HtmlBody
                }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "v3.1/send")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload, PayloadOptions), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{settings.ApiKey}:{settings.ApiSecret}")));

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[EMAIL] Mailjet rejected message to {message.ToEmail}: {(int)response.StatusCode} {body}");
            return false;
        }

        // v3.1 can answer 200 while an individual message failed (e.g. unvalidated
        // sender), so inspect the per-message status as well.
        try
        {
            using var document = JsonDocument.Parse(body);
            var status = document.RootElement
                .GetProperty("Messages")
                .EnumerateArray()
                .FirstOrDefault()
                .GetProperty("Status")
                .GetString();
            // v3.1 reports "success" on accepted messages ("sent" appears in some docs/examples).
            if (status is "success" or "sent") return true;

            Console.WriteLine($"[EMAIL] Mailjet did not deliver message to {message.ToEmail}: status={status} {body}");
            return false;
        }
        catch (Exception exception) when (exception is JsonException or KeyNotFoundException or InvalidOperationException)
        {
            Console.WriteLine($"[EMAIL] Unexpected Mailjet response for {message.ToEmail}: {body}");
            return false;
        }
    }
}
