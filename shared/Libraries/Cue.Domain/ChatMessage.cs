namespace Cue.Domain;

public sealed class ChatMessage
{
    private ChatMessage()
    {
    }

    public ChatMessage(Guid orderId, Guid senderId, string content, MessageType messageType = MessageType.Text)
    {
        if (orderId == Guid.Empty || senderId == Guid.Empty) throw new ArgumentException("Order and sender are required.");
        if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Message content is required.", nameof(content));

        Id = Guid.NewGuid();
        OrderId = orderId;
        SenderId = senderId;
        Content = content.Trim();
        SentAt = DateTime.UtcNow;
        MessageType = messageType;
    }

    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid SenderId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public DateTime SentAt { get; private set; }
    public bool IsRead { get; private set; }
    public MessageType MessageType { get; private set; }

    public void MarkRead() => IsRead = true;
}
