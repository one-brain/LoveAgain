using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace Cue.Infrastructure.Messaging;

public sealed class RabbitMqOptions
{
    public string Host { get; init; } = "localhost";
    public int Port { get; init; } = 5672;
    public string Username { get; init; } = "guest";
    public string Password { get; init; } = "guest";
    public string Exchange { get; init; } = "cue.events";
    public string DeadLetterExchange { get; init; } = "cue.events.dead-letter";
}

public sealed class RabbitMqEventPublisher(IOptions<RabbitMqOptions> options) : IEventPublisher, IAsyncDisposable
{
    private readonly RabbitMqOptions settings = options.Value;
    private IConnection? connection;
    private IChannel? channel;

    public async Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class
    {
        try
        {
            var eventName = typeof(TEvent).Name;
            var currentChannel = await GetChannelAsync(cancellationToken);
            var payload = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(@event));
            var properties = new BasicProperties
            {
                ContentType = "application/json",
                Type = eventName,
                DeliveryMode = DeliveryModes.Persistent
            };

            await currentChannel.BasicPublishAsync(settings.Exchange, eventName, false, properties, payload, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            throw new InvalidOperationException($"Unable to publish {typeof(TEvent).Name}.", exception);
        }
    }

    private async Task<IChannel> GetChannelAsync(CancellationToken cancellationToken)
    {
        if (channel is not null) return channel;

        var factory = new ConnectionFactory
        {
            HostName = settings.Host,
            Port = settings.Port,
            UserName = settings.Username,
            Password = settings.Password
        };

        connection = await factory.CreateConnectionAsync(cancellationToken);
        channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);
        await channel.ExchangeDeclareAsync(settings.Exchange, ExchangeType.Topic, durable: true, cancellationToken: cancellationToken);
        await channel.ExchangeDeclareAsync(settings.DeadLetterExchange, ExchangeType.Topic, durable: true, cancellationToken: cancellationToken);
        return channel;
    }

    public async ValueTask DisposeAsync()
    {
        if (channel is not null) await channel.DisposeAsync();
        if (connection is not null) await connection.DisposeAsync();
    }
}