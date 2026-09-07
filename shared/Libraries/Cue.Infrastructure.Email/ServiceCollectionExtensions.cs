using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Cue.Infrastructure.Email;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the Mailjet email sender against the "Mailjet" configuration section.
    /// </summary>
    public static IServiceCollection AddMailjetEmail(this IServiceCollection services)
    {
        services.AddOptions<MailjetOptions>()
            .BindConfiguration(MailjetOptions.SectionName);
        services.AddHttpClient<IEmailSender, MailjetEmailSender>(client =>
            client.BaseAddress = new Uri("https://api.mailjet.com/"));
        return services;
    }
}
