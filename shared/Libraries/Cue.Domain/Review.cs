namespace Cue.Domain;

public sealed class Review
{
    private Review()
    {
    }

    public Review(Guid orderId, Guid reviewerId, Guid revieweeId, int rating, string comment, int? timelinessScore = null, int? communicationScore = null)
    {
        if (orderId == Guid.Empty || reviewerId == Guid.Empty || revieweeId == Guid.Empty) throw new ArgumentException("Review references are required.");
        if (reviewerId == revieweeId) throw new ArgumentException("A user cannot review themselves.");
        ValidateScore(rating, nameof(rating));
        if (timelinessScore.HasValue) ValidateScore(timelinessScore.Value, nameof(timelinessScore));
        if (communicationScore.HasValue) ValidateScore(communicationScore.Value, nameof(communicationScore));
        if (string.IsNullOrWhiteSpace(comment)) throw new ArgumentException("Review comment is required.", nameof(comment));

        Id = Guid.NewGuid();
        OrderId = orderId;
        ReviewerId = reviewerId;
        RevieweeId = revieweeId;
        Rating = rating;
        Comment = comment.Trim();
        TimelinessScore = timelinessScore;
        CommunicationScore = communicationScore;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid ReviewerId { get; private set; }
    public Guid RevieweeId { get; private set; }
    public int Rating { get; private set; }
    public string Comment { get; private set; } = string.Empty;
    public int? TimelinessScore { get; private set; }
    public int? CommunicationScore { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private static void ValidateScore(int score, string parameterName)
    {
        if (score is < 1 or > 5) throw new ArgumentOutOfRangeException(parameterName, "Scores must be between 1 and 5.");
    }
}
