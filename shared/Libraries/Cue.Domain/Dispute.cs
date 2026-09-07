namespace Cue.Domain;

public sealed class Dispute
{
    private Dispute()
    {
    }

    public Dispute(Guid orderId, Guid raisedBy, string reason)
    {
        if (orderId == Guid.Empty || raisedBy == Guid.Empty) throw new ArgumentException("Order and reporting user are required.");
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("A dispute reason is required.", nameof(reason));

        Id = Guid.NewGuid();
        OrderId = orderId;
        RaisedBy = raisedBy;
        Reason = reason.Trim();
        Status = DisputeStatus.Open;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid RaisedBy { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public DisputeStatus Status { get; private set; }
    public string? Resolution { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public void BeginReview() { EnsureOpen(); Status = DisputeStatus.InReview; }
    public void Escalate() { Status = DisputeStatus.Escalated; }
    public void Resolve(string resolution)
    {
        if (string.IsNullOrWhiteSpace(resolution)) throw new ArgumentException("A resolution is required.", nameof(resolution));
        Resolution = resolution.Trim();
        Status = DisputeStatus.Resolved;
    }

    private void EnsureOpen()
    {
        if (Status != DisputeStatus.Open) throw new InvalidOperationException("Only open disputes can enter review.");
    }
}
