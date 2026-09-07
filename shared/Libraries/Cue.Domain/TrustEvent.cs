namespace Cue.Domain;

public sealed class TrustEvent
{
    private TrustEvent()
    {
    }

    public TrustEvent(Guid userId, string eventType, int scoreDelta, string reason)
    {
        if (userId == Guid.Empty) throw new ArgumentException("User is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(eventType)) throw new ArgumentException("Event type is required.", nameof(eventType));
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Reason is required.", nameof(reason));

        Id = Guid.NewGuid();
        UserId = userId;
        EventType = eventType.Trim();
        ScoreDelta = scoreDelta;
        Reason = reason.Trim();
        Timestamp = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public int ScoreDelta { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public DateTime Timestamp { get; private set; }
}
