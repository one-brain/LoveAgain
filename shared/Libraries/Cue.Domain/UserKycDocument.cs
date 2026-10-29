namespace Cue.Domain;

public sealed class UserKycDocument
{
    private UserKycDocument()
    {
    }

    public UserKycDocument(
        Guid userId,
        string documentType,
        string documentNumber,
        string frontImageUrl,
        string backImageUrl,
        string selfieImageUrl)
    {
        if (userId == Guid.Empty) throw new ArgumentException("User ID is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(documentType)) throw new ArgumentException("Document type is required.", nameof(documentType));
        if (string.IsNullOrWhiteSpace(documentNumber)) throw new ArgumentException("Document number is required.", nameof(documentNumber));
        if (string.IsNullOrWhiteSpace(frontImageUrl)) throw new ArgumentException("Front image is required.", nameof(frontImageUrl));
        if (string.IsNullOrWhiteSpace(backImageUrl)) throw new ArgumentException("Back image is required.", nameof(backImageUrl));
        if (string.IsNullOrWhiteSpace(selfieImageUrl)) throw new ArgumentException("Selfie image is required.", nameof(selfieImageUrl));

        Id = Guid.NewGuid();
        UserId = userId;
        DocumentType = documentType.Trim();
        DocumentNumber = documentNumber.Trim();
        FrontImageUrl = frontImageUrl.Trim();
        BackImageUrl = backImageUrl.Trim();
        SelfieImageUrl = selfieImageUrl.Trim();
        Status = KycStatus.PendingReview;
        SubmittedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string DocumentType { get; private set; } = string.Empty;
    public string DocumentNumber { get; private set; } = string.Empty;
    public string FrontImageUrl { get; private set; } = string.Empty;
    public string BackImageUrl { get; private set; } = string.Empty;
    public string SelfieImageUrl { get; private set; } = string.Empty;
    public KycStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime SubmittedAt { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public Guid? ReviewedBy { get; private set; }

    public void Approve(Guid reviewerId)
    {
        if (Status == KycStatus.Approved) return;
        Status = KycStatus.Approved;
        ReviewedBy = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = null;
    }

    public void Reject(Guid reviewerId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Rejection reason is required.", nameof(reason));
        Status = KycStatus.Rejected;
        ReviewedBy = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        RejectionReason = reason.Trim();
    }

    public void Resubmit(
        string documentType,
        string documentNumber,
        string frontImageUrl,
        string backImageUrl,
        string selfieImageUrl)
    {
        if (string.IsNullOrWhiteSpace(documentType)) throw new ArgumentException("Document type is required.", nameof(documentType));
        if (string.IsNullOrWhiteSpace(documentNumber)) throw new ArgumentException("Document number is required.", nameof(documentNumber));
        if (string.IsNullOrWhiteSpace(frontImageUrl)) throw new ArgumentException("Front image is required.", nameof(frontImageUrl));
        if (string.IsNullOrWhiteSpace(backImageUrl)) throw new ArgumentException("Back image is required.", nameof(backImageUrl));
        if (string.IsNullOrWhiteSpace(selfieImageUrl)) throw new ArgumentException("Selfie image is required.", nameof(selfieImageUrl));

        DocumentType = documentType.Trim();
        DocumentNumber = documentNumber.Trim();
        FrontImageUrl = frontImageUrl.Trim();
        BackImageUrl = backImageUrl.Trim();
        SelfieImageUrl = selfieImageUrl.Trim();
        Status = KycStatus.PendingReview;
        RejectionReason = null;
        SubmittedAt = DateTime.UtcNow;
        ReviewedAt = null;
        ReviewedBy = null;
    }
}

