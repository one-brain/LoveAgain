namespace Cue.Domain;

public sealed class Notification
{
    private Notification()
    {
    }

    public Notification(Guid userId, NotificationType type, string content)
    {
        if (userId == Guid.Empty) throw new ArgumentException("User is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Notification content is required.", nameof(content));

        Id = Guid.NewGuid();
        UserId = userId;
        Type = type;
        Content = content.Trim();
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public NotificationType Type { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public void MarkRead() => IsRead = true;
}
